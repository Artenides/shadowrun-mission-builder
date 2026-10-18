import type { Campaign, Mission, NpcBlock, NpcCrunch } from '../engine/types';

function npcToMarkdown(npc: NpcBlock, crunch: NpcCrunch): string {
  const lines = [
    `- **${npc.name}** — ${npc.roleTag} (${npc.threatTier}${npc.headcount ? ` x${npc.headcount}` : ''})`,
    `  - Dice Pool ${npc.dicePool}D6 · Soak ${npc.soak} · Condition Boxes ${npc.conditionBoxes}`,
  ];
  if (crunch === 'full' && npc.edge !== undefined) lines.push(`  - Edge ${npc.edge}`);
  if (npc.specials.length) lines.push(`  - Special: ${npc.specials.join('; ')}`);
  lines.push(`  - *${npc.quickLine}*`);
  return lines.join('\n');
}

function missionToMarkdown(mission: Mission, crunch: NpcCrunch, includeNpcs: boolean): string {
  const parts = [
    `### ${mission.index + 1}. ${mission.title}${mission.isOutlier ? ' _(outlier)_' : ''}`,
    `**Type:** ${mission.type}  \n**Location:** ${mission.locationName}`,
    '',
    mission.hook,
    '',
    '**Complications:**',
    ...mission.complications.map((c) => `- ${c}`),
    '',
    `**Narrative thread (DM only):** ${mission.narrativeThreadNote}`,
  ];
  if (includeNpcs && mission.npcs.length > 0) {
    parts.push('', '**NPCs:**', ...mission.npcs.map((n) => npcToMarkdown(n, crunch)));
  }
  return parts.join('\n');
}

export function campaignToMarkdown(campaign: Campaign): string {
  const city = campaign.city;
  const header = [
    `# ${campaign.title}`,
    '',
    campaign.summary,
    '',
    `_Seed: \`${campaign.seed}\`_`,
    '',
    '## City Dossier',
    '',
    `**${city.name}** — ${city.tier}, population ~${city.population}`,
    '',
    `Metahuman mix: ${city.metahumanMix.human}% Human, ${city.metahumanMix.elf}% Elf, ${city.metahumanMix.dwarf}% Dwarf, ${city.metahumanMix.ork}% Ork, ${city.metahumanMix.troll}% Troll (~${city.awakenedFraction}% Awakened)`,
    '',
    `Economy: ${city.economicEngine.join(', ')}  `,
    `Ambience: ${city.ambienceTags.join(', ')}`,
    '',
    '### Districts',
    ...city.districts.map((d) => `- **${d.name}** — ${d.role}: ${d.flavor}`),
    '',
    '### Stakeholders',
    ...city.stakeholders.map((s) => {
      const relTarget = s.relationship ? city.stakeholders.find((o) => o.id === s.relationship!.targetId) : null;
      const rel = s.relationship && relTarget ? ` (${s.relationship.kind} with ${relTarget.name})` : '';
      return `- **${s.name}** — ${s.type}, ${s.powerLevel}, ${s.disposition} toward the party's employer${rel}. Assets: ${s.knownAssets.join(', ')}. *Secretly, they ${s.secretAgenda}.*`;
    }),
    '',
    '## Missions',
    '',
  ];
  const missions = campaign.missions.map((m) => missionToMarkdown(m, campaign.inputs.npcCrunch, campaign.inputs.includeNpcs));
  return [...header, missions.join('\n\n---\n\n')].join('\n');
}
