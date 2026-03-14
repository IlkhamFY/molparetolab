import type { Molecule, FilterResult, MolProps } from './types';
import { DRUG_FILTERS } from './types';

// Let the window object hold RDKitModule globally just like index.html
declare global {
  interface Window {
    initRDKitModule: () => Promise<any>;
    RDKitModule: any;
  }
}

export async function initRDKitCache(): Promise<any> {
  if (window.RDKitModule) return window.RDKitModule;
  if (!window.initRDKitModule) throw new Error("RDKit minimal JS not loaded via CDN");
  window.RDKitModule = await window.initRDKitModule();
  return window.RDKitModule;
}

export function looksLikeName(line: string): boolean {
  const s = line.trim().split(/\s+/)[0];
  return !/[()=\[\]#/\\@+]/.test(s) && !/[A-Za-z]\d/.test(s) && !/^\d/.test(s);
}

/** Parse SDF text to "SMILES name" lines (one per molecule). Requires RDKit to be inited. */
export function parseSDFToSmilesLines(sdfText: string, RDKit: any): string[] {
  const blocks = sdfText.split('$$$$').filter((b) => b.trim());
  const results: string[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 4) continue;

    const molName = lines[0].trim() || '';
    const endIdx = lines.findIndex((l) => l.trim().startsWith('M  END'));
    if (endIdx === -1) continue;

    const molblock = lines.slice(0, endIdx + 1).join('\n');

    try {
      const mol = RDKit.get_mol(molblock);
      if (mol && mol.is_valid()) {
        const smiles = mol.get_smiles();
        let name = molName;
        if (!name) {
          const nameMatch = block.match(/>\s*<(?:Name|MOLNAME|name|ID|_Name)>\s*\n([^\n]+)/i);
          if (nameMatch) name = nameMatch[1].trim();
        }
        results.push(name ? `${smiles} ${name}` : smiles);
        mol.delete();
      }
    } catch {
      // Skip invalid molecules
    }
  }
  return results;
}

/** Load SDF file text and return "SMILES name" lines for parseAndAnalyze. */
export async function parseSDFFile(sdfText: string): Promise<string[]> {
  const RDKit = await initRDKitCache();
  return parseSDFToSmilesLines(sdfText, RDKit);
}

export async function lookupSMILES(name: string): Promise<string | null> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/CanonicalSMILES/JSON`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const props = data?.PropertyTable?.Properties;
    return props?.[0]?.CanonicalSMILES || props?.[0]?.ConnectivitySMILES || null;
  } catch (e) {
    return null;
  }
}

/** Fetch canonical SMILES for a ChEMBL molecule ID (e.g. CHEMBL1). */
export async function lookupChEMBL(chemblId: string): Promise<{ smiles: string; name: string } | null> {
  const id = chemblId.trim().toUpperCase();
  if (!id.startsWith('CHEMBL')) return null;
  try {
    const url = `https://www.ebi.ac.uk/chembl/api/data/molecule/${encodeURIComponent(id)}.json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const smiles = data?.molecule_properties?.canonical_smiles ?? data?.canonical_smiles ?? data?.molecule_structures?.canonical_smiles?.molecule_value;
    const name = data?.pref_name ?? data?.molecule_chembl_id ?? id;
    return smiles ? { smiles, name } : null;
  } catch {
    return null;
  }
}

/** Fetch SMILES for multiple ChEMBL IDs with rate limiting. Returns "SMILES name" lines. */
export async function fetchChEMBLBatch(
  ids: string[],
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const lines: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    onProgress?.(i + 1, ids.length);
    const result = await lookupChEMBL(ids[i]);
    if (result) lines.push(`${result.smiles} ${result.name}`);
    await delay(200);
  }
  return lines;
}

function checkFilter(filterName: string, props: any): FilterResult {
  const filter = DRUG_FILTERS[filterName as keyof typeof DRUG_FILTERS];
  if (!filter) return { pass: false, violations: 0 };
  let violations = 0;
  for (const rule of filter.rules) {
    const val = props[rule.key as keyof typeof props];
    if (rule.op === '<=' && val > rule.val) violations++;
    else if (rule.op === '>=' && val < rule.val) violations++;
    else if (rule.op === '<' && val >= rule.val) violations++;
    else if (rule.op === '>' && val <= rule.val) violations++;
  }
  return { pass: violations <= filter.maxViolations, violations };
}

export async function parseAndAnalyze(input: string): Promise<{ molecules: Molecule[], errors: number, failedLookups: number }> {
  const RDKit = await initRDKitCache();
  const lines = input.split('\n').filter(l => l.trim());
  
  let resolvedLookups = 0;
  let failedLookups = 0;

  // 1. Bug Fix implementation: Check with RDKit FIRST before doing PubChem lookup
  const resolvedLines = [...lines];
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    const potentialSmiles = parts[0];
    
    // Test if RDKit thinks it's valid SMILES
    let isValidSmiles = false;
    try {
      const testMol = RDKit.get_mol(potentialSmiles);
      if (testMol && testMol.is_valid()) {
        isValidSmiles = true;
      }
      if (testMol) testMol.delete();
    } catch(e) { }

    if (!isValidSmiles && looksLikeName(lines[i])) {
      const name = parts[0];
      const rest = parts.slice(1).join(' ');
      const smiles = await lookupSMILES(name);
      if (smiles) {
        resolvedLines[i] = `${smiles} ${rest || name}`;
        resolvedLookups++;
      } else {
        failedLookups++;
      }
    }
  }

  const newMolecules: Molecule[] = [];
  let errors = 0;

  // 2. Compute properties using RDKit
  for (let i = 0; i < resolvedLines.length; i++) {
    const parts = resolvedLines[i].trim().split(/\s+/);
    const smiles = parts[0];
    const name = parts.slice(1).join(' ') || `mol_${i+1}`;

    try {
      const mol = RDKit.get_mol(smiles);
      if (!mol || !mol.is_valid()) { errors++; continue; }

      const desc = JSON.parse(mol.get_descriptors());
      const svg = mol.get_svg_with_highlights(JSON.stringify({ width: 200, height: 150 }));
      const numAtoms = (desc.NumHeavyAtoms || desc.HeavyAtomCount || 0) + (desc.NumHs || 0);

      let fingerprint = '';
      try { fingerprint = mol.get_morgan_fp(JSON.stringify({radius: 2, nBits: 2048})); } catch(e) {}

      const props = {
        MW: desc.exactmw || desc.amw || 0,
        LogP: desc.CrippenClogP || 0,
        HBD: desc.NumHBD || 0,
        HBA: desc.NumHBA || 0,
        TPSA: desc.tpsa || 0,
        RotBonds: desc.NumRotatableBonds || 0,
        FrCSP3: desc.FractionCSP3 || 0,
        Rings: desc.RingCount || 0,
        AromaticRings: desc.NumAromaticRings || 0,
        HeavyAtoms: desc.NumHeavyAtoms || desc.HeavyAtomCount || 0,
        MR: desc.CrippenMR || 0,
        NumAtoms: numAtoms || (desc.NumHeavyAtoms || 0),
      };

      const filters: Record<string, FilterResult> = {};
      for (const filterName of Object.keys(DRUG_FILTERS)) {
        filters[filterName] = checkFilter(filterName, props);
      }

      newMolecules.push({
        name,
        smiles,
        svg,
        fingerprint,
        props,
        filters,
        lipinski: filters.lipinski,
        paretoRank: null,
        dominates: [],
        dominatedBy: [],
      });

      mol.delete();
    } catch(e) {
      errors++;
    }
  }

  // 3. Compute Pareto ranks & Dominance
  computeParetoRanks(newMolecules);
  computeDominance(newMolecules);

  return { molecules: newMolecules, errors, failedLookups };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Chunked parse for large inputs; reports progress. phase: 'resolve' = name lookup, 'analyze' = RDKit parse. */
export async function parseAndAnalyzeChunked(
  input: string,
  options: { chunkSize?: number; onProgress?: (done: number, total: number, phase?: 'resolve' | 'analyze') => void } = {}
): Promise<{ molecules: Molecule[]; errors: number; failedLookups: number }> {
  const chunkSize = options.chunkSize ?? 25;
  const onProgress = options.onProgress ?? (() => {});

  const RDKit = await initRDKitCache();
  const lines = input.split('\n').filter((l) => l.trim());
  const total = lines.length;

  let failedLookups = 0;
  const resolvedLines: string[] = [...lines];
  for (let i = 0; i < lines.length; i++) {
    onProgress(i + 1, total, 'resolve');
    const parts = lines[i].trim().split(/\s+/);
    const potentialSmiles = parts[0];
    let isValidSmiles = false;
    try {
      const testMol = RDKit.get_mol(potentialSmiles);
      if (testMol && testMol.is_valid()) isValidSmiles = true;
      if (testMol) testMol.delete();
    } catch {}
    if (!isValidSmiles && looksLikeName(lines[i])) {
      const name = parts[0];
      const rest = parts.slice(1).join(' ');
      const smiles = await lookupSMILES(name);
      if (smiles) resolvedLines[i] = `${smiles} ${rest || name}`;
      else failedLookups++;
    }
    if (i > 0 && i % 10 === 0) await delay(0);
  }

  const newMolecules: Molecule[] = [];
  let errors = 0;
  for (let start = 0; start < resolvedLines.length; start += chunkSize) {
    const end = Math.min(start + chunkSize, resolvedLines.length);
    for (let i = start; i < end; i++) {
      const parts = resolvedLines[i].trim().split(/\s+/);
      const smiles = parts[0];
      const name = parts.slice(1).join(' ') || `mol_${i + 1}`;
      try {
        const mol = RDKit.get_mol(smiles);
        if (!mol || !mol.is_valid()) {
          errors++;
          continue;
        }
        const desc = JSON.parse(mol.get_descriptors());
        const svg = mol.get_svg_with_highlights(JSON.stringify({ width: 200, height: 150 }));
        const numAtoms = (desc.NumHeavyAtoms || desc.HeavyAtomCount || 0) + (desc.NumHs || 0);
        let fingerprint = '';
        try {
          fingerprint = mol.get_morgan_fp(JSON.stringify({ radius: 2, nBits: 2048 }));
        } catch {}
        const props = {
          MW: desc.exactmw || desc.amw || 0,
          LogP: desc.CrippenClogP || 0,
          HBD: desc.NumHBD || 0,
          HBA: desc.NumHBA || 0,
          TPSA: desc.tpsa || 0,
          RotBonds: desc.NumRotatableBonds || 0,
          FrCSP3: desc.FractionCSP3 || 0,
          Rings: desc.RingCount || 0,
          AromaticRings: desc.NumAromaticRings || 0,
          HeavyAtoms: desc.NumHeavyAtoms || desc.HeavyAtomCount || 0,
          MR: desc.CrippenMR || 0,
          NumAtoms: numAtoms || (desc.NumHeavyAtoms || 0),
        };
        const filters: Record<string, FilterResult> = {};
        for (const filterName of Object.keys(DRUG_FILTERS)) {
          filters[filterName] = checkFilter(filterName, props);
        }
        newMolecules.push({
          name,
          smiles,
          svg,
          fingerprint,
          props,
          filters,
          lipinski: filters.lipinski,
          paretoRank: null,
          dominates: [],
          dominatedBy: [],
        });
        mol.delete();
      } catch {
        errors++;
      }
    }
    onProgress(end, total, 'analyze');
    await delay(0);
  }

  computeParetoRanks(newMolecules);
  computeDominance(newMolecules);
  return { molecules: newMolecules, errors, failedLookups };
}

function computeParetoRanks(molecules: Molecule[]) {
  const keys: (keyof MolProps)[] = ['MW', 'LogP', 'HBD', 'HBA', 'TPSA', 'RotBonds'];
  const n = molecules.length;
  const dominated = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      let allLeq = true, anyLt = false;
      for (const k of keys) {
        if (molecules[j].props[k] > molecules[i].props[k]) allLeq = false;
        if (molecules[j].props[k] < molecules[i].props[k]) anyLt = true;
      }
      if (allLeq && anyLt) { dominated[i] = true; break; }
    }
  }

  molecules.forEach((m, i) => {
    m.paretoRank = dominated[i] ? 2 : 1;
  });
}

/** Tanimoto (Jaccard) between two fingerprint bit strings. */
function tanimoto(fp1: string, fp2: string): number {
  if (fp1.length !== fp2.length) return 0;
  let inter = 0, union = 0;
  for (let i = 0; i < fp1.length; i++) {
    const a = fp1[i] === '1';
    const b = fp2[i] === '1';
    if (a && b) inter++;
    if (a || b) union++;
  }
  return union === 0 ? 0 : inter / union;
}

/** Compute n×n Tanimoto similarity matrix from molecules (Morgan fingerprints). */
export function computeTanimotoMatrix(molecules: Molecule[]): number[][] {
  const n = molecules.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const t = tanimoto(molecules[i].fingerprint, molecules[j].fingerprint);
      matrix[i][j] = matrix[j][i] = t;
    }
  }
  return matrix;
}

/** Diversity score = mean(1 - T) over upper triangle. Higher = more diverse. */
export function getDiversityScore(matrix: number[][]): number {
  const n = matrix.length;
  if (n < 2) return 0;
  let sum = 0, count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      sum += 1 - matrix[i][j];
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

const PARETO_KEYS: (keyof MolProps)[] = ['MW', 'LogP', 'HBD', 'HBA', 'TPSA', 'RotBonds'];
const LIPINSKI_MAX: Record<string, number> = { MW: 500, LogP: 5, HBD: 5, HBA: 10, TPSA: 140, RotBonds: 10 };

export interface ActivityCliff {
  i: number;
  j: number;
  tanimoto: number;
  propDistance: number;
  cliffScore: number;
  topDifferingProps: string[];
}

/** Activity cliffs: high similarity but large property difference. */
export function computeActivityCliffs(
  molecules: Molecule[],
  tanimotoMatrix: number[][],
  threshold = 0.5,
  topN = 10
): ActivityCliff[] {
  const n = molecules.length;
  const cliffs: ActivityCliff[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const t = tanimotoMatrix[i][j];
      if (t <= threshold) continue;

      const norm = (k: string, v: number) => v / (LIPINSKI_MAX[k] || 1);
      let sumSq = 0;
      const diffs: { key: string; diff: number }[] = [];
      for (const k of PARETO_KEYS) {
        const v1 = molecules[i].props[k];
        const v2 = molecules[j].props[k];
        const n1 = norm(k, v1);
        const n2 = norm(k, v2);
        const d = n1 - n2;
        sumSq += d * d;
        diffs.push({ key: k, diff: Math.abs(d) });
      }
      const propDist = Math.sqrt(sumSq);
      diffs.sort((a, b) => b.diff - a.diff);
      cliffs.push({
        i,
        j,
        tanimoto: t,
        propDistance: propDist,
        cliffScore: t * propDist,
        topDifferingProps: diffs.slice(0, 3).map((x) => x.key),
      });
    }
  }

  cliffs.sort((a, b) => b.cliffScore - a.cliffScore);
  return cliffs.slice(0, topN);
}

function computeDominance(molecules: Molecule[]) {
  const keys: (keyof MolProps)[] = ['MW', 'LogP', 'HBD', 'HBA', 'TPSA', 'RotBonds'];
  const n = molecules.length;

  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      let iBetter = 0, jBetter = 0;
      for (const k of keys) {
        if (molecules[i].props[k] < molecules[j].props[k]) iBetter++;
        else if (molecules[i].props[k] > molecules[j].props[k]) jBetter++;
      }
      if (iBetter > 0 && jBetter === 0) {
        molecules[i].dominates.push(j);
        molecules[j].dominatedBy.push(i);
      } else if (jBetter > 0 && iBetter === 0) {
        molecules[j].dominates.push(i);
        molecules[i].dominatedBy.push(j);
      }
    }
  }
}
