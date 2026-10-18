import { useState } from 'react';
import type { Mission, NpcCrunch } from '../engine/types';
import NpcBlockView from './NpcBlockView';

interface MissionCardProps {
  mission: Mission;
  npcCrunch: NpcCrunch;
  showThreadNotes: boolean;
  onRegenerate: () => void;
}

export default function MissionCard({ mission, npcCrunch, showThreadNotes, onRegenerate }: MissionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`mission-card${mission.isOutlier ? ' mission-outlier' : ''}`}>
      <button type="button" className="mission-card-head" onClick={() => setExpanded((e) => !e)}>
        <span className="mission-index">{mission.index + 1}</span>
        <span className="mission-title">{mission.title}</span>
        <span className="mission-type-badge">{mission.type}</span>
        {mission.isOutlier && <span className="outlier-badge">outlier</span>}
        <span className="expand-caret">{expanded ? '▾' : '▸'}</span>
      </button>

      {/* Always rendered (not conditionally mounted) so the print stylesheet can force every
          card open regardless of each card's collapsed/expanded UI state. */}
      <div className={`mission-card-body${expanded ? '' : ' collapsed'}`}>
        <p className="mission-location">
          <strong>Location:</strong> {mission.locationName}
        </p>
        <p className="mission-hook">{mission.hook}</p>

        <div className="mission-complications">
          <strong>Complications</strong>
          <ul>
            {mission.complications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        {showThreadNotes && (
          <p className="mission-thread-note">
            <strong>Narrative thread (DM only):</strong> {mission.narrativeThreadNote}
          </p>
        )}

        {mission.npcs.length > 0 && (
          <div className="mission-npcs">
            <strong>NPCs</strong>
            {mission.npcs.map((n, i) => (
              <NpcBlockView key={`${mission.id}-npc-${i}`} npc={n} crunch={npcCrunch} />
            ))}
          </div>
        )}

        <button type="button" className="regenerate-button" onClick={onRegenerate}>
          Regenerate this mission
        </button>
      </div>
    </div>
  );
}
