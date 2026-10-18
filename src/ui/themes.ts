export type ThemeId = 'matrix' | 'nexus' | 'lab';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  hint: string;
  previewColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'matrix', label: 'Matrix', hint: 'Neon green terminal — the original.', previewColor: '#39ff8a' },
  { id: 'nexus', label: 'Nexus', hint: 'Clean corporate blue, modern dashboard.', previewColor: '#4da8ff' },
  { id: 'lab', label: 'Lab', hint: 'Graphite & cyan, clinical instrument readout.', previewColor: '#38d9e8' },
];

export const DEFAULT_THEME: ThemeId = 'matrix';

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value === 'matrix' || value === 'nexus' || value === 'lab';
}
