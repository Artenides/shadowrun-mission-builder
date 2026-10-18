import type { CSSProperties } from 'react';
import { THEME_OPTIONS, type ThemeId } from './themes';

interface ThemeSwitcherProps {
  theme: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export default function ThemeSwitcher({ theme, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher">
      <span className="theme-switcher-label">Theme</span>
      <div className="theme-switcher-options">
        {THEME_OPTIONS.map((option) => {
          const style: CSSProperties & Record<'--preview-color', string> = {
            '--preview-color': option.previewColor,
          };
          return (
            <button
              key={option.id}
              type="button"
              className={`theme-swatch${theme === option.id ? ' active' : ''}`}
              style={style}
              onClick={() => onChange(option.id)}
              title={option.hint}
            >
              <span className="theme-swatch-dot" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
