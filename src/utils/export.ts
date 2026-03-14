import type { Molecule } from './types';
import { PROPERTIES, DRUG_FILTERS } from './types';

/** Build CSV content from molecules. */
export function buildExportCSV(molecules: Molecule[]): string {
  const filterNames = Object.keys(DRUG_FILTERS);
  const header =
    'Name,SMILES,' +
    PROPERTIES.map((p) => p.key).join(',') +
    ',' +
    filterNames.map((fn) => (DRUG_FILTERS as Record<string, { label: string }>)[fn].label + '_Pass').join(',') +
    ',Pareto_Optimal\n';

  const rows = molecules.map((m) => {
    const propVals = PROPERTIES.map((p) => {
      const val = m.props[p.key as keyof Molecule['props']];
      return typeof val === 'number' ? val.toFixed(3) : '';
    }).join(',');
    const filterVals = filterNames.map((fn) => m.filters[fn]?.pass ?? false).join(',');
    const pareto = m.paretoRank === 1;
    return `"${(m.name || '').replace(/"/g, '""')}","${(m.smiles || '').replace(/"/g, '""')}",${propVals},${filterVals},${pareto}\n`;
  });

  return header + rows.join('');
}

/** Trigger download of CSV file. */
export function downloadCSV(molecules: Molecule[], filename = 'molparetolab_export.csv'): void {
  const csv = buildExportCSV(molecules);
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
