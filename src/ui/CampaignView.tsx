import { useState } from 'react';
import type { Campaign } from '../engine/types';
import CityDossier from './CityDossier';
import MissionCard from './MissionCard';
import { campaignToMarkdown } from '../utils/markdownExport';
import { buildShareUrl } from '../utils/seedUrl';

interface CampaignViewProps {
  campaign: Campaign;
  onRegenerateAll: () => void;
  onRegenerateMission: (index: number) => void;
  onRegenerateCityName: () => void;
  onEditInputs: () => void;
}

export default function CampaignView({
  campaign,
  onRegenerateAll,
  onRegenerateMission,
  onRegenerateCityName,
  onEditInputs,
}: CampaignViewProps) {
  const [showThreadNotes, setShowThreadNotes] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function flashStatus(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 2500);
  }

  async function handleCopyMarkdown() {
    const markdown = campaignToMarkdown(campaign);
    try {
      await navigator.clipboard.writeText(markdown);
      flashStatus('Markdown copied to clipboard.');
    } catch {
      flashStatus('Could not access the clipboard — copy the text manually.');
    }
  }

  async function handleCopyShareLink() {
    const url = buildShareUrl(campaign.inputs);
    try {
      await navigator.clipboard.writeText(url);
      flashStatus('Share link copied — reopening it reproduces this exact campaign.');
    } catch {
      flashStatus(url);
    }
  }

  return (
    <div className="campaign-view">
      <div className="campaign-toolbar">
        <button type="button" onClick={onEditInputs}>
          Edit answers
        </button>
        <button type="button" onClick={onRegenerateAll}>
          New campaign (random seed)
        </button>
        <button type="button" onClick={() => setShowThreadNotes((v) => !v)}>
          {showThreadNotes ? 'Hide' : 'Show'} DM thread notes
        </button>
        <button type="button" onClick={handleCopyMarkdown}>
          Copy as Markdown
        </button>
        <button type="button" onClick={handleCopyShareLink}>
          Share seed
        </button>
        <button type="button" onClick={() => window.print()}>
          Print / PDF
        </button>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}

      <div className="campaign-header">
        <h2>{campaign.title}</h2>
        <p className="campaign-summary">{campaign.summary}</p>
        <p className="campaign-seed">
          Seed: <code>{campaign.seed}</code>
        </p>
      </div>

      <CityDossier city={campaign.city} onRegenerateCityName={onRegenerateCityName} />

      <div className="mission-timeline">
        {campaign.missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            npcCrunch={campaign.inputs.npcCrunch}
            showThreadNotes={showThreadNotes}
            onRegenerate={() => onRegenerateMission(mission.index)}
          />
        ))}
      </div>
    </div>
  );
}
