export type ManifestChunk = {
  file: string;
  isEntry?: boolean;
  isDynamicEntry?: boolean;
  imports?: string[];
  dynamicImports?: string[];
  css?: string[];
};
export type Manifest = Record<string, ManifestChunk>;
export type DistReport = {
  appFiles: string[];
  lazyFiles: string[];
  appBytes: number;
  problems: string[];
};

export const BUDGET_BYTES: number;
export function fontProblems(assetFiles: readonly string[]): string[];
export function evaluateDist(
  manifest: Manifest,
  gzipBytes: (file: string) => number,
  options?: { budgetBytes?: number },
): DistReport;
