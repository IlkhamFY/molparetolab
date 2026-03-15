export interface MolProps {
  MW: number;
  LogP: number;
  HBD: number;
  HBA: number;
  TPSA: number;
  RotBonds: number;
  FrCSP3: number;
  Rings: number;
  AromaticRings: number;
  HeavyAtoms: number;
  MR: number;
  NumAtoms: number;
}

export interface FilterResult {
  pass: boolean;
  violations: number;
}

export interface Molecule {
  name: string;
  smiles: string;
  svg: string;
  fingerprint: string;
  props: MolProps;
  filters: Record<string, FilterResult>;
  lipinski?: FilterResult;
  paretoRank: number | null;
  dominates: number[];
  dominatedBy: number[];
}

export const PROPERTIES = [
  { key: 'MW', label: 'Molecular Weight', unit: 'Da', lipinski: { max: 500 } },
  { key: 'LogP', label: 'Calc. LogP', unit: '', lipinski: { max: 5 } },
  { key: 'HBD', label: 'H-Bond Donors', unit: '', lipinski: { max: 5 } },
  { key: 'HBA', label: 'H-Bond Acceptors', unit: '', lipinski: { max: 10 } },
  { key: 'TPSA', label: 'Topological PSA', unit: 'Å²', lipinski: { max: 140 } },
  { key: 'RotBonds', label: 'Rotatable Bonds', unit: '', lipinski: { max: 10 } },
  { key: 'FrCSP3', label: 'Fraction Csp3', unit: '' },
  { key: 'HeavyAtoms', label: 'Heavy Atom Count', unit: '' },
  { key: 'MR', label: 'Molar Refractivity', unit: '' },
  { key: 'Rings', label: 'Ring Count', unit: '' },
  { key: 'AromaticRings', label: 'Aromatic Rings', unit: '' }
];

export const DRUG_FILTERS = {
  lipinski: {
    label: 'Lipinski Ro5',
    color: 'green',
    rules: [
      { key: 'MW', op: '<=', val: 500 },
      { key: 'LogP', op: '<=', val: 5 },
      { key: 'HBD', op: '<=', val: 5 },
      { key: 'HBA', op: '<=', val: 10 },
    ],
    maxViolations: 1,
  },
  veber: {
    label: 'Veber',
    color: 'yellow',
    rules: [
      { key: 'RotBonds', op: '<=', val: 10 },
      { key: 'TPSA', op: '<=', val: 140 },
    ],
    maxViolations: 0,
  },
  ghose: {
    label: 'Ghose',
    color: 'cyan',
    rules: [
      { key: 'LogP', op: '>=', val: -0.4 },
      { key: 'LogP', op: '<=', val: 5.6 },
      { key: 'MW', op: '>=', val: 160 },
      { key: 'MW', op: '<=', val: 480 },
      { key: 'MR', op: '>=', val: 40 },
      { key: 'MR', op: '<=', val: 130 },
      { key: 'NumAtoms', op: '>=', val: 20 },
      { key: 'NumAtoms', op: '<=', val: 70 },
    ],
    maxViolations: 0,
  },
  leadlike: {
    label: 'Lead-like',
    color: 'orange',
    rules: [
      { key: 'MW', op: '<=', val: 450 },
      { key: 'LogP', op: '<=', val: 4.5 },
      { key: 'RotBonds', op: '<=', val: 10 },
      { key: 'HBD', op: '<=', val: 5 },
      { key: 'HBA', op: '<=', val: 8 },
    ],
    maxViolations: 0,
  },
};

export const EXAMPLES = {
  druglike: `CC(=O)Oc1ccccc1C(=O)O aspirin
CC(C)Cc1ccc(cc1)C(C)C(=O)O ibuprofen
CC(=O)Nc1ccc(O)cc1 acetaminophen
CN1C=NC2=C1C(=O)N(C(=O)N2C)C caffeine
OC(=O)C1CCCN1 proline
c1ccc2c(c1)cc1ccc3cccc4ccc2c1c34 pyrene
CC12CCC3C(C1CCC2O)CCC1=CC(=O)CCC13C testosterone
OC(=O)c1cc(O)c(O)c(O)c1 gallic_acid`,

  lipinski: `CC(=O)Oc1ccccc1C(=O)O aspirin
CC(C)Cc1ccc(cc1)C(C)C(=O)O ibuprofen
CC(=O)Nc1ccc(O)cc1 acetaminophen
CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC triacontane
CC(C)(C)c1ccc(cc1)C(O)(c1ccc(cc1)C(C)(C)C)c1ccc(cc1)C(C)(C)C big_lipophilic
CCCCCCCCCCCCCCCCCCCCOC(=O)c1cc(O)c(O)c(O)c1 fatty_gallate
O=C(O)c1ccccc1O salicylic_acid
c1ccccc1 benzene`,

  diverse: `C methane
CCO ethanol
c1ccccc1 benzene
CC(=O)Oc1ccccc1C(=O)O aspirin
CN1C(=O)N(C)c2[nH]cnc2C1=O caffeine_modified
CC1=C(C(CCC1)(C)C)/C=C/C(=C/C=C/C(=C/C=C/C=C(/C=C/C=C(/C=C/C1=C(CCCC1(C)C)C)\\C)\\C)/C)\\C beta_carotene
OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O glucose
CC(C)CC1=CC=C(C=C1)C(C)C(=O)O ibuprofen`,

  kinase: `CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5 imatinib
CC1=C(C=C(C=C1)NC(=O)C2=CC(=CC=C2)C(F)(F)F)NC3=NC=CC(=N3)C4=CN=CC=C4 nilotinib
C#CC1=CC=CC(=C1)NC2=NC=NC3=C2C=C(C=C3)OCCCCCCN4CCN(CC4)C dasatinib_like
CC(C)C1=CC=CC(=C1)NC(=O)C2=CC=C(C=C2)CNC(=O)OC bosutinib_like
CC1=CC=C(C=C1)C(=O)NC2=CC(=CC=C2)NC(=O)C3=CC=CN=C3 sorafenib_like
c1ccc(cc1)-c1ccc2c(c1)ccc1c3cc(-c4ccncc4)ccc3[nH]c21 ponatinib_core`,
};
