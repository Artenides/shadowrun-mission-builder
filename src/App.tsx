import { useEffect, useState } from 'react';
import './App.css';
import type { Campaign, CampaignInputs } from './engine/types';
import { DEFAULT_INPUTS } from './ui/questions';
import { DEFAULT_THEME, type ThemeId } from './ui/themes';
import { generateCampaign, regenerateCityName } from './engine/generateCampaign';
import { readSharedStateFromLocation, buildShareUrl } from './utils/seedUrl';
import Wizard from './ui/Wizard';
import CampaignView from './ui/CampaignView';
import ThemeSwitcher from './ui/ThemeSwitcher';

const STORAGE_KEY = 'shadowline:last-inputs';
const THEME_STORAGE_KEY = 'shadowline:theme';

function loadStoredInputs(): CampaignInputs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_INPUTS, ...JSON.parse(raw) };
  } catch {
    // Private browsing / blocked storage — fall back to defaults, no big deal.
  }
  return DEFAULT_INPUTS;
}

function loadStoredTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'matrix' || raw === 'nexus' || raw === 'lab') return raw;
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

// Decoded once per page load — both the initial campaign and the initial theme
// come from this same shared token, so it's read a single time rather than twice.
const sharedState = readSharedStateFromLocation(DEFAULT_INPUTS);

export default function App() {
  const [campaign, setCampaign] = useState<Campaign | null>(() =>
    sharedState ? generateCampaign(sharedState.inputs) : null,
  );
  const [wizardInputs, setWizardInputs] = useState<CampaignInputs>(
    () => campaign?.inputs ?? sharedState?.inputs ?? loadStoredInputs(),
  );
  const [cityNonce, setCityNonce] = useState(0);
  const [theme, setTheme] = useState<ThemeId>(() => sharedState?.theme ?? loadStoredTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  function handleGenerate(next: CampaignInputs) {
    setWizardInputs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    const result = generateCampaign(next);
    setCampaign(result);
    setCityNonce(0);
    window.history.replaceState(null, '', buildShareUrl(result.inputs, theme));
  }

  function handleRegenerateAll() {
    handleGenerate({ ...wizardInputs, seedPhrase: '' });
  }

  function handleRegenerateCityName() {
    if (!campaign) return;
    const nonce = cityNonce + 1;
    const { cityName, title } = regenerateCityName(campaign, nonce);
    setCampaign({ ...campaign, title, city: { ...campaign.city, name: cityName } });
    setCityNonce(nonce);
  }

  function handleEditInputs() {
    setCampaign(null);
  }

  function handleThemeChange(next: ThemeId) {
    setTheme(next);
    // Keep the address bar's share link in sync so a copied/bookmarked URL always
    // reproduces both the campaign and the theme it was viewed in.
    if (campaign) {
      window.history.replaceState(null, '', buildShareUrl(campaign.inputs, next));
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Shadowline</h1>
        <p className="tagline">An Anarchy 2.0 campaign &amp; mission generator</p>
        <ThemeSwitcher theme={theme} onChange={handleThemeChange} />
      </header>

      {campaign ? (
        <CampaignView
          campaign={campaign}
          theme={theme}
          onRegenerateAll={handleRegenerateAll}
          onRegenerateCityName={handleRegenerateCityName}
          onEditInputs={handleEditInputs}
        />
      ) : (
        <Wizard initialInputs={wizardInputs} onGenerate={handleGenerate} />
      )}
    </div>
  );
}
