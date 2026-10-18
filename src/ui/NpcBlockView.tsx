import type { NpcBlock, NpcCrunch } from '../engine/types';

export default function NpcBlockView({ npc, crunch }: { npc: NpcBlock; crunch: NpcCrunch }) {
  return (
    <div className="npc-block">
      <div className="npc-header">
        <strong>{npc.name}</strong>
        <span className="npc-role">{npc.roleTag}</span>
        <span className={`npc-tier npc-tier-${npc.threatTier.toLowerCase()}`}>
          {npc.threatTier}
          {npc.headcount ? ` ×${npc.headcount}` : ''}
        </span>
      </div>
      <div className="npc-stats">
        <span>Dice Pool {npc.dicePool}D6</span>
        <span>Soak {npc.soak}</span>
        <span>Condition {npc.conditionBoxes}</span>
        {crunch === 'full' && npc.edge !== undefined && <span>Edge {npc.edge}</span>}
      </div>
      {npc.specials.length > 0 && (
        <ul className="npc-specials">
          {npc.specials.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
      <p className="npc-quickline">{npc.quickLine}</p>
    </div>
  );
}
