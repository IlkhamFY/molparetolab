import LZString from 'lz-string';
import type { Molecule } from './types';

/** Encode molecules to a string suitable for URL (SMILES + name per line). */
export function encodeMoleculesToPayload(molecules: Molecule[]): string {
  return molecules.map((m) => `${m.smiles} ${m.name}`).join('\n');
}

/** Compress payload for URL query param. */
export function compressPayload(payload: string): string {
  return LZString.compressToEncodedURIComponent(payload);
}

/** Decompress from URL query param; returns null on failure. */
export function decompressPayload(compressed: string): string | null {
  try {
    return LZString.decompressFromEncodedURIComponent(compressed) || null;
  } catch {
    return null;
  }
}

/** Get shareable URL with encoded molecules. */
export function getShareableUrl(molecules: Molecule[]): string {
  const payload = encodeMoleculesToPayload(molecules);
  const compressed = compressPayload(payload);
  const url = new URL(window.location.href.split('?')[0]);
  url.searchParams.set('m', compressed);
  return url.toString();
}

/** Read initial payload from current URL (?m=). Call once on mount. */
export function getInitialPayloadFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const compressed = params.get('m');
  if (!compressed) return null;
  return decompressPayload(compressed);
}
