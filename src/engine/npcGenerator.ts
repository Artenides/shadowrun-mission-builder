import { pick, pickN, intBetween, chance, weightedPick, type Rng } from '../rng/seed';
import { FIRST_NAMES, LAST_NAMES, STREET_HANDLES } from '../content/personNames';
import { NPC_ROLE_TAGS, NPC_ROLE_TAGS_GENERIC, NPC_QUICK_LINES, MOOK_SQUAD_LABELS } from '../content/npcContent';
import {
  METATYPES,
  ARMOR_ITEMS,
  WOUND_THRESHOLDS,
  RANGED_WEAPON_NAMES,
  MELEE_WEAPON_NAMES,
  SOCIAL_GEAR,
  TECH_GEAR,
  MAGIC_GEAR,
  RIGGER_GEAR,
  averageHits,
  skillByName,
  type MetatypeProfile,
  type ArmorCategory,
} from '../content/anarchyRules';
import type {
  AttributeKey,
  CampaignInputs,
  CityProfile,
  Metatype,
  Mission,
  MissionType,
  NpcAttributes,
  NpcBlock,
  NpcSkillLine,
  PowerLevel,
  PowerTier,
  Stakeholder,
  StakeholderType,
  ThreatTier,
} from './types';

type Archetype = 'Combat' | 'Social' | 'Technical' | 'Magical' | 'Rigger';

const ARCHETYPE_BY_MISSION: Record<MissionType, Archetype> = {
  Infiltration: 'Combat',
  'Theft/Extraction': 'Combat',
  'Wet work': 'Combat',
  'Smash-and-grab': 'Combat',
  'Deception/Social engineering': 'Social',
  Sabotage: 'Technical',
  'Protection/Escort': 'Combat',
  Reconnaissance: 'Combat',
  'Data run': 'Technical',
  Rescue: 'Combat',
  'Negotiation-gone-wrong': 'Social',
};

const ARCHETYPE_SKILLS: Record<Archetype, { primary: string[]; secondary: string[]; focus: AttributeKey[] }> = {
  Combat: {
    primary: ['Ranged Weapons', 'Close Combat'],
    secondary: ['Athletics', 'Perception', 'Stealth'],
    focus: ['agility', 'strength'],
  },
  Social: { primary: ['Influence'], secondary: ['Network', 'Perception'], focus: ['charisma'] },
  Technical: { primary: ['Cracking', 'Electronics'], secondary: ['Engineering', 'Perception'], focus: ['logic'] },
  Magical: { primary: ['Sorcery'], secondary: ['Conjuring', 'Perception'], focus: ['willpower', 'logic'] },
  Rigger: { primary: ['Piloting'], secondary: ['Engineering', 'Perception'], focus: ['agility', 'logic'] },
};

const ARCHETYPE_GEAR: Record<Archetype, string[]> = {
  Combat: [...RANGED_WEAPON_NAMES, ...MELEE_WEAPON_NAMES],
  Social: SOCIAL_GEAR,
  Technical: TECH_GEAR,
  Magical: MAGIC_GEAR,
  Rigger: RIGGER_GEAR,
};

// Rough mapping onto the rulebook's own "On-the-Fly NPC" proficiency bands
// (Base training ~6 dice, Professional ~9 dice, Elite ~12 dice).
const POWER_TIER_SKILL_BASE: Record<PowerTier, number> = {
  'Street-level': 2,
  Professional: 4,
  Veteran: 5,
  Elite: 6,
};
const THREAT_TIER_SKILL_MOD: Record<ThreatTier, number> = { Mook: -1, Named: 0, Boss: 2 };

const POWER_TIER_ATTR_BASE: Record<PowerTier, number> = { 'Street-level': 0, Professional: 1, Veteran: 2, Elite: 2 };
const THREAT_TIER_ATTR_MOD: Record<ThreatTier, number> = { Mook: 0, Named: 1, Boss: 2 };
const POWER_LEVEL_ATTR_BONUS: Record<PowerLevel, number> = { Dominant: 2, Established: 1, Rising: 1, Fringe: 0 };

const COMBAT_HEAVY_TYPES = new Set<MissionType>(['Wet work', 'Smash-and-grab', 'Protection/Escort', 'Rescue']);

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function pickArchetype(missionType: MissionType, rng: Rng): Archetype {
  const base = ARCHETYPE_BY_MISSION[missionType];
  if (base === 'Combat' && chance(rng, 0.12)) {
    return chance(rng, 0.5) ? 'Magical' : 'Rigger';
  }
  return base;
}

function pickMetatype(city: CityProfile, rng: Rng): MetatypeProfile {
  const weights = METATYPES.map((m) => ({
    value: m,
    weight: Math.max(1, city.metahumanMix[m.name.toLowerCase() as keyof CityProfile['metahumanMix']] ?? 1),
  }));
  return weightedPick(rng, weights);
}

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

function rollAttributes(metatype: MetatypeProfile, focus: AttributeKey[], attrBoost: number, rng: Rng): NpcAttributes {
  const keys: AttributeKey[] = ['strength', 'agility', 'willpower', 'logic', 'charisma'];
  const result = {} as NpcAttributes;
  for (const key of keys) {
    const roll = 1 + attrBoost + intBetween(rng, 0, 1) + (focus.includes(key) ? 1 : 0);
    result[key] = clamp(roll, 1, metatype.attributeMax[key]);
  }
  return result;
}

function buildSkillLine(
  skillName: string,
  attributes: NpcAttributes,
  rating: number,
  riskReduction: number,
  specChance: number,
  rng: Rng,
): NpcSkillLine {
  const def = skillByName(skillName);
  const hasSpecialization = def.specializations.length > 0 && chance(rng, specChance);
  const specialization = hasSpecialization ? pick(rng, def.specializations) : undefined;
  const attributeRating = attributes[def.attribute];
  return {
    name: skillName,
    rating,
    attribute: def.attribute,
    specialization,
    riskReduction,
    averageHits: averageHits(rating, attributeRating, riskReduction, hasSpecialization),
  };
}

function pickEquipment(archetype: Archetype, threatTier: ThreatTier, rng: Rng): { items: string[]; armorCategory: ArmorCategory } {
  const items: string[] = [];
  let armorCategory: ArmorCategory = 'clothes';

  const wantsArmor = archetype === 'Combat' || archetype === 'Rigger' || chance(rng, 0.35);
  if (wantsArmor) {
    const pool = threatTier === 'Boss' ? ARMOR_ITEMS.filter((a) => a.category !== 'clothes') : ARMOR_ITEMS;
    const armor = pick(rng, pool);
    items.push(armor.name);
    armorCategory = armor.category;
  }

  items.push(pick(rng, ARCHETYPE_GEAR[archetype]));
  if (items.length < 2 || chance(rng, 0.5)) {
    items.push('Commlink');
  }

  return { items: [...new Set(items)].slice(0, 3), armorCategory };
}

function computeWoundThresholds(attributes: NpcAttributes, armorCategory: ArmorCategory, metatype: Metatype) {
  const robust = attributes.strength >= 4 || metatype === 'Ork' || metatype === 'Troll';
  const physical = WOUND_THRESHOLDS.physical[robust ? 'robust' : 'average'][armorCategory];
  const strongMinded = attributes.willpower >= 4;
  const mental = WOUND_THRESHOLDS.mental[strongMinded ? 'strongMinded' : 'average'];
  return { physical, mental };
}

function fightingSpiritFor(threatTier: ThreatTier, stakeholder: Stakeholder | null): NpcBlock['fightingSpirit'] {
  if (threatTier === 'Boss') return stakeholder?.type === 'Wildcard' ? 'Extreme' : 'High';
  if (threatTier === 'Named') return 'High';
  return 'Low';
}

function buildNpc(
  threatTier: ThreatTier,
  roleTag: string,
  archetype: Archetype,
  stakeholder: Stakeholder | null,
  inputs: CampaignInputs,
  city: CityProfile,
  rng: Rng,
  headcount?: number,
): NpcBlock {
  const metatype = pickMetatype(city, rng);
  const name = threatTier === 'Mook' ? roleTag : randomNpcName(rng, stakeholder?.type ?? null);

  const powerLevelBonus = stakeholder ? POWER_LEVEL_ATTR_BONUS[stakeholder.powerLevel] : 0;
  const attrBoost =
    POWER_TIER_ATTR_BASE[inputs.powerTier] + THREAT_TIER_ATTR_MOD[threatTier] + (powerLevelBonus > 1 ? 1 : 0);
  const attributes = rollAttributes(metatype, ARCHETYPE_SKILLS[archetype].focus, attrBoost, rng);

  const skillBase = POWER_TIER_SKILL_BASE[inputs.powerTier] + THREAT_TIER_SKILL_MOD[threatTier];
  const riskReduction = threatTier === 'Mook' ? 0 : threatTier === 'Named' ? intBetween(rng, 0, 1) : intBetween(rng, 1, 2);

  const { primary, secondary } = ARCHETYPE_SKILLS[archetype];
  const skills: NpcSkillLine[] = [
    buildSkillLine(pick(rng, primary), attributes, clamp(skillBase + 1, 0, 8), riskReduction, 0.6, rng),
    ...pickN(rng, secondary, Math.min(2, secondary.length)).map((s) =>
      buildSkillLine(s, attributes, clamp(skillBase - 1, 0, 8), Math.max(0, riskReduction - 1), 0.25, rng),
    ),
  ];

  const { items, armorCategory } = pickEquipment(archetype, threatTier, rng);

  return {
    name,
    roleTag,
    metatype: metatype.name,
    threatTier,
    headcount,
    attributes,
    edge: threatTier === 'Mook' ? undefined : metatype.edge,
    skills,
    equipment: items,
    woundThresholds: computeWoundThresholds(attributes, armorCategory, metatype.name),
    fightingSpirit: fightingSpiritFor(threatTier, stakeholder),
    quickLine: pick(rng, NPC_QUICK_LINES),
  };
}

/**
 * One named contact/antagonist per mission, plus a mook squad for
 * combat-leaning mission types, plus an extra boss-tier NPC when the
 * mission's client is the city's dominant power player. Stats follow the
 * Anarchy 2.0 "Regular NPC" convention (rulebook, Managing NPCs, p. 81):
 * 5 Attributes, a handful of Skills shown with their precomputed average-hits
 * threshold, light equipment, wound thresholds, and a Fighting Spirit rating.
 */
export function generateNpcsForMission(mission: Mission, inputs: CampaignInputs, city: CityProfile, rng: Rng): NpcBlock[] {
  const stakeholder = city.stakeholders.find((s) => s.id === mission.clientStakeholderId) ?? null;
  const archetype = pickArchetype(mission.type, rng);

  const npcs: NpcBlock[] = [];

  const namedTag = roleTagFor(mission, stakeholder, rng);
  npcs.push(buildNpc('Named', namedTag, archetype, stakeholder, inputs, city, rng));

  if (COMBAT_HEAVY_TYPES.has(mission.type)) {
    const squadLabel = pick(rng, MOOK_SQUAD_LABELS);
    npcs.push(buildNpc('Mook', squadLabel, 'Combat', stakeholder, inputs, city, rng, intBetween(rng, 2, 5)));
  }

  if (stakeholder?.powerLevel === 'Dominant' && mission.type !== 'Reconnaissance') {
    npcs.push(buildNpc('Boss', `${stakeholder.name} — Senior Enforcer`, archetype, stakeholder, inputs, city, rng));
  }

  return npcs;
}
