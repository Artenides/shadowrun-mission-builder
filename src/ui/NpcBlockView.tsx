import type { NpcBlock, NpcCrunch } from '../engine/types';
import { ATTRIBUTE_LABEL, ATTRIBUTE_LETTER } from '../content/anarchyRules';

const ATTR_ORDER: (keyof NpcBlock['attributes'])[] = ['strength', 'agility', 'willpower', 'logic', 'charisma'];

export default function NpcBlockView({ npc, crunch }: { npc: NpcBlock; crunch: NpcCrunch }) {
  return (
    <div className="npc-block">
      <div className="npc-header">
        <strong>{npc.name}</strong>
        <span className="npc-role">
          {npc.roleTag} · {npc.metatype}
        </span>
        <span className={`npc-tier npc-tier-${npc.threatTier.toLowerCase()}`}>
          {npc.threatTier}
          {npc.headcount ? ` ×${npc.headcount}` : ''}
        </span>
      </div>

      <div className="npc-attributes">
        {ATTR_ORDER.map((key) => (
          <span key={key} className="npc-attribute">
            <span className="npc-attribute-label">{ATTRIBUTE_LABEL[key]}</span>
            <span className="npc-attribute-value">{npc.attributes[key]}</span>
          </span>
        ))}
        {npc.edge !== undefined && (
          <span className="npc-attribute">
            <span className="npc-attribute-label">EDGE</span>
            <span className="npc-attribute-value">{npc.edge}</span>
          </span>
        )}
      </div>

      <ul className="npc-skills">
        {npc.skills.map((skill) => (
          <li key={skill.name}>
            <span className="npc-skill-name">
              {skill.name}
              {skill.specialization ? ` (${skill.specialization})` : ''}
            </span>
            <span className="npc-skill-hits">{skill.averageHits} hits</span>
            {crunch === 'full' && (
              <span className="npc-skill-detail">
                ({skill.rating}+{ATTRIBUTE_LETTER[skill.attribute]}, RR {skill.riskReduction})
              </span>
            )}
          </li>
        ))}
      </ul>

      {npc.equipment.length > 0 && <p className="npc-equipment">{npc.equipment.join(', ')}</p>}

      {crunch === 'full' && (
        <p className="npc-wounds">
          Physical {npc.woundThresholds.physical.join('/')} · Mental {npc.woundThresholds.mental.join('/')} ·{' '}
          {npc.fightingSpirit} fighting spirit
        </p>
      )}

      <p className="npc-quickline">{npc.quickLine}</p>
    </div>
  );
}
