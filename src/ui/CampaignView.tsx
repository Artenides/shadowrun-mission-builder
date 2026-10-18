import { useState } from 'react';
import type { Campaign } from '../engine/types';
import type { ThemeId } from './themes';
import CityDossier from './CityDossier';
import MissionCard from './MissionCard';
import { campaignToMarkdown } from '../utils/markdownExport';
import { buildShareUrl } from '../utils/seedUrl';

interface CampaignViewProps {
  campaign: Campaign;
  theme: ThemeId;
  onRegenerateAll: () => void;
  onRegenerateCityName: () => void;
  onEditInputs: () => void;
}

export default function CampaignView({
  campaign,
  theme,
  onRegenerateAll,
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
    const url = buildShareUrl(campaign.inputs, theme);
    try {
      await navigator.clipboard.writeText(url);
      flashStatus('Share link copied — reopening it reproduces this campaign in this same theme.');
    } catch {
      flashStatus(url);
    }
  }

  return (
    <div className="campaign-view">
      <div className="toolbar">
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={onEditInputs}>
            Edit answers
          </button>
          <button type="button" className="toolbar-btn" onClick={onRegenerateAll}>
            New campaign
          </button>
        </div>

        <div className="toolbar-divider" />

        <label className="toolbar-switch" title="Show the DM-only notes on how each mission secretly connects">
          <input
            type="checkbox"
            checked={showThreadNotes}
            onChange={(e) => setShowThreadNotes(e.target.checked)}
          />
          <span className="switch-track">
            <span className="switch-thumb" />
          </span>
          DM thread notes
        </label>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={handleCopyMarkdown}>
            Copy Markdown
          </button>
          <button type="button" className="toolbar-btn" onClick={handleCopyShareLink}>
            Share link
          </button>
          <button type="button" className="toolbar-btn" onClick={() => window.print()}>
            Print / PDF
          </button>
        </div>
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
          />
        ))}
      </div>
    </div>
  );
}
