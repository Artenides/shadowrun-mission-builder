import { useState } from 'react';
import './App.css';
import type { Campaign, CampaignInputs } from './engine/types';
import { DEFAULT_INPUTS } from './ui/questions';
import { generateCampaign, regenerateMission, regenerateCityName } from './engine/generateCampaign';
import { readInputsFromLocation, buildShareUrl } from './utils/seedUrl';
import Wizard from './ui/Wizard';
import CampaignView from './ui/CampaignView';

const STORAGE_KEY = 'shadowline:last-inputs';

function loadStoredInputs(): CampaignInputs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_INPUTS, ...JSON.parse(raw) };
  } catch {
    // Private browsing / blocked storage — fall back to defaults, no big deal.
  }
  return DEFAULT_INPUTS;
}

function initialCampaignFromUrl(): Campaign | null {
  const fromUrl = readInputsFromLocation(DEFAULT_INPUTS);
  return fromUrl ? generateCampaign(fromUrl) : null;
}

export default function App() {
  const [campaign, setCampaign] = useState<Campaign | null>(initialCampaignFromUrl);
  const [wizardInputs, setWizardInputs] = useState<CampaignInputs>(() => campaign?.inputs ?? loadStoredInputs());
  const [missionNonces, setMissionNonces] = useState<Record<number, number>>({});
  const [cityNonce, setCityNonce] = useState(0);

  function handleGenerate(next: CampaignInputs) {
    setWizardInputs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    const result = generateCampaign(next);
    setCampaign(result);
    setMissionNonces({});
    setCityNonce(0);
    window.history.replaceState(null, '', buildShareUrl(result.inputs));
  }

  function handleRegenerateAll() {
    handleGenerate({ ...wizardInputs, seedPhrase: '' });
  }

  function handleRegenerateMission(index: number) {
    if (!campaign) return;
    const nonce = (missionNonces[index] ?? 0) + 1;
    const mission = regenerateMission(campaign, index, nonce);
    const missions = campaign.missions.map((m, i) => (i === index ? mission : m));
    setCampaign({ ...campaign, missions });
    setMissionNonces({ ...missionNonces, [index]: nonce });
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Shadowline</h1>
        <p className="tagline">An Anarchy 2.0 campaign &amp; mission generator</p>
      </header>

      {campaign ? (
        <CampaignView
          campaign={campaign}
          onRegenerateAll={handleRegenerateAll}
          onRegenerateMission={handleRegenerateMission}
          onRegenerateCityName={handleRegenerateCityName}
          onEditInputs={handleEditInputs}
        />
      ) : (
        <Wizard initialInputs={wizardInputs} onGenerate={handleGenerate} />
      )}

      <footer className="app-footer">
        <p>Generated client-side, nothing leaves your browser except what you choose to copy or share.</p>
      </footer>
    </div>
  );
}
