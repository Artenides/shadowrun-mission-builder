import { pick, pickN, intBetween, type Rng } from '../rng/seed';
import { FIRST_NAMES, LAST_NAMES, STREET_HANDLES } from '../content/personNames';
import {
  NPC_ROLE_TAGS,
  NPC_ROLE_TAGS_GENERIC,
  NPC_SPECIALS,
  NPC_QUICK_LINES,
  MOOK_SQUAD_LABELS,
} from '../content/npcContent';
import type { CampaignInputs, CityProfile, Mission, NpcBlock, PowerLevel, PowerTier, Stakeholder, StakeholderType, ThreatTier } from './types';

const POWER_TIER_BASE: Record<PowerTier, { mook: number; named: number; boss: number }> = {
  'Street-level': { mook: 5, named: 8, boss: 11 },
  Professional: { mook: 6, named: 9, boss: 12 },
  Veteran: { mook: 7, named: 11, boss: 14 },
  Elite: { mook: 9, named: 13, boss: 17 },
};

const POWER_LEVEL_BONUS: Record<PowerLevel, number> = {
  Dominant: 3,
  Established: 2,
  Rising: 1,
  Fringe: 0,
};

const COMBAT_HEAVY_TYPES = new Set(['Wet work', 'Smash-and-grab', 'Protection/Escort', 'Rescue']);

function randomNpcName(rng: Rng, type: StakeholderType | null): string {
  if (type === 'Street Gang' || type === 'Organized Crime') {
    return pick(rng, STREET_HANDLES);
  }
  return `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
}

function roleTagFor(mission: Mission, stakeholder: Stakeholder | null, rng: Rng): string {
  if (stakeholder) return pick(rng, NPC_ROLE_TAGS[stakeholder.type]);
  return pick(rng, NPC_ROLE_TAGS_GENERIC[mission.type]);
}

function buildNpc(
  threatTier: ThreatTier,
  roleTag: string,
  name: string,
  bonus: number,
  base: { mook: number; named: number; boss: number },
  rng: Rng,
  headcount?: number,
): NpcBlock {
  const key = threatTier === 'Mook' ? 'mook' : threatTier === 'Named' ? 'named' : 'boss';
  const dicePool = base[key] + bonus;
  const soak = Math.round(dicePool / 2);
  const conditionBoxes =
    threatTier === 'Mook' ? intBetween(rng, 6, 8) : threatTier === 'Named' ? intBetween(rng, 9, 11) : intBetween(rng, 13, 16);
  const edge = threatTier === 'Mook' ? undefined : threatTier === 'Named' ? intBetween(rng, 1, 2) : intBetween(rng, 2, 4);

  return {
    name,
    roleTag,
    threatTier,
    headcount,
    dicePool,
    soak,
    conditionBoxes,
    edge,
    specials: pickN(rng, NPC_SPECIALS, intBetween(rng, 1, 2)),
    quickLine: pick(rng, NPC_QUICK_LINES),
  };
}

/**
 * One named contact/antagonist per mission, plus a mook squad for
 * combat-leaning mission types, plus an extra boss-tier NPC when the
 * mission's client is the city's dominant power player. Dice-pool style
 * stat blocks per Anarchy 2.0 (DESIGN.md §8) rather than full 5E/6E crunch.
 */
export function generateNpcsForMission(mission: Mission, inputs: CampaignInputs, city: CityProfile, rng: Rng): NpcBlock[] {
  const stakeholder = city.stakeholders.find((s) => s.id === mission.clientStakeholderId) ?? null;
  const base = POWER_TIER_BASE[inputs.powerTier];
  const bonus = stakeholder ? POWER_LEVEL_BONUS[stakeholder.powerLevel] : 0;

  const npcs: NpcBlock[] = [];

  const namedTag = roleTagFor(mission, stakeholder, rng);
  npcs.push(buildNpc('Named', namedTag, randomNpcName(rng, stakeholder?.type ?? null), bonus, base, rng));

  if (COMBAT_HEAVY_TYPES.has(mission.type)) {
    const squadLabel = pick(rng, MOOK_SQUAD_LABELS);
    npcs.push(buildNpc('Mook', squadLabel, squadLabel, Math.max(0, bonus - 1), base, rng, intBetween(rng, 2, 5)));
  }

  if (stakeholder?.powerLevel === 'Dominant' && mission.type !== 'Reconnaissance') {
    npcs.push(
      buildNpc('Boss', `${stakeholder.name} — Senior Enforcer`, randomNpcName(rng, stakeholder.type), bonus, base, rng),
    );
  }

  return npcs;
}
