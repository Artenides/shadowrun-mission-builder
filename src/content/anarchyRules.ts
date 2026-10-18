import type { AttributeKey, Metatype } from '../engine/types';

/**
 * Canonical Shadowrun: Anarchy 2.0 character mechanics, transcribed from the
 * core rulebook (Game Concepts chapter) so generated NPCs use real stats
 * instead of invented ones:
 * - 5 Attributes (Strength, Agility, Willpower, Logic, Charisma), rated 1-4
 *   for most metatypes (higher ranges for some — see METATYPES below), plus
 *   a separate Edge rating.
 * - Skills rated 0-8 (0 untrained, 2 trained, 4 professional, 6 expert,
 *   8 elite), each linked to one Attribute, with optional specializations
 *   (+2 to the rating when they apply).
 * - A Test's dice pool = Skill (+specialization) + Attribute.
 * - "Regular NPC" convention (used throughout the book's own ready-to-use
 *   NPCs): average hits/threshold = round(dicePool / 3) + Risk Reduction + 1.
 *   Regular NPCs don't get Edge; "Prime" NPCs (here: Named/Boss tier) do.
 */

export interface MetatypeProfile {
  name: Metatype;
  attributeMax: Record<AttributeKey, number>;
  edge: number;
}

export const METATYPES: MetatypeProfile[] = [
  { name: 'Human', attributeMax: { strength: 4, agility: 4, willpower: 4, logic: 4, charisma: 4 }, edge: 4 },
  { name: 'Elf', attributeMax: { strength: 4, agility: 4, willpower: 4, logic: 4, charisma: 5 }, edge: 3 },
  { name: 'Dwarf', attributeMax: { strength: 4, agility: 4, willpower: 5, logic: 4, charisma: 4 }, edge: 3 },
  { name: 'Ork', attributeMax: { strength: 5, agility: 4, willpower: 4, logic: 4, charisma: 4 }, edge: 3 },
  { name: 'Troll', attributeMax: { strength: 6, agility: 4, willpower: 4, logic: 4, charisma: 4 }, edge: 3 },
];

export const ATTRIBUTE_LETTER: Record<AttributeKey, string> = {
  strength: 'S',
  agility: 'A',
  willpower: 'W',
  logic: 'L',
  charisma: 'C',
};

export const ATTRIBUTE_LABEL: Record<AttributeKey, string> = {
  strength: 'STR',
  agility: 'AGI',
  willpower: 'WIL',
  logic: 'LOG',
  charisma: 'CHA',
};

export interface SkillDef {
  name: string;
  attribute: AttributeKey;
  specializations: string[];
}

export const SKILLS: SkillDef[] = [
  { name: 'Athletics', attribute: 'strength', specializations: ['running', 'climbing', 'ranged defense'] },
  { name: 'Close Combat', attribute: 'agility', specializations: ['unarmed', 'blades', 'clubs', 'defense'] },
  {
    name: 'Ranged Weapons',
    attribute: 'agility',
    specializations: ['pistols', 'submachine guns', 'rifles', 'heavy weapons'],
  },
  { name: 'Stealth', attribute: 'agility', specializations: ['physical sneaking', 'lockpicking', 'palming'] },
  { name: 'Perception', attribute: 'logic', specializations: ['physical', 'social', 'Matrix'] },
  { name: 'Influence', attribute: 'charisma', specializations: ['negotiation', 'intimidation', 'bluff', 'etiquette'] },
  { name: 'Network', attribute: 'charisma', specializations: ['street', 'corporate', 'criminal'] },
  { name: 'Electronics', attribute: 'logic', specializations: ['Matrix search', 'Matrix protection'] },
  { name: 'Cracking', attribute: 'logic', specializations: ['brute force', 'backdoor'] },
  { name: 'Engineering', attribute: 'logic', specializations: ['electronic warfare', 'demolitions', 'drones B&R'] },
  { name: 'Piloting', attribute: 'agility', specializations: ['ground drones', 'cars', 'flying drones'] },
  { name: 'Survival', attribute: 'logic', specializations: ['navigation', 'first aid'] },
  { name: 'Sorcery', attribute: 'willpower', specializations: ['combat spells', 'counterspelling'] },
  { name: 'Conjuring', attribute: 'logic', specializations: ['spirits of air', 'banishing'] },
];

export function skillByName(name: string): SkillDef {
  const found = SKILLS.find((s) => s.name === name);
  if (!found) throw new Error(`Unknown Anarchy skill: ${name}`);
  return found;
}

/** Regular NPC average-hits formula from the rulebook: T = round(DP/3) + RR + 1. */
export function averageHits(skillRating: number, attributeRating: number, riskReduction: number, specialized: boolean): number {
  const dicePool = skillRating + attributeRating + (specialized ? 2 : 0);
  return Math.round(dicePool / 3) + riskReduction + 1;
}

export type ArmorCategory = 'clothes' | 'light' | 'heavy';

export const ARMOR_ITEMS: { name: string; category: ArmorCategory }[] = [
  { name: 'Armored clothes', category: 'clothes' },
  { name: 'Armored clothing with heavy coat', category: 'clothes' },
  { name: 'Lined coat', category: 'light' },
  { name: 'Armored vest', category: 'light' },
  { name: 'Full body armor', category: 'heavy' },
  { name: 'SWAT armor', category: 'heavy' },
];

/** Rulebook wound-threshold examples (On-the-Fly NPCs, p. 82-83), extended slightly
 * (average+heavy) by the same pattern for coverage. [light, serious, deadly]. */
export const WOUND_THRESHOLDS: {
  physical: Record<'average' | 'robust', Record<ArmorCategory, [number, number, number]>>;
  mental: Record<'average' | 'strongMinded', [number, number, number]>;
} = {
  physical: {
    average: { clothes: [3, 6, 9], light: [5, 8, 11], heavy: [6, 9, 12] },
    robust: { clothes: [4, 7, 10], light: [6, 9, 12], heavy: [7, 10, 13] },
  },
  mental: {
    average: [2, 5, 8],
    strongMinded: [3, 6, 9],
  },
};

export const RANGED_WEAPON_NAMES = [
  'Hold-out pistol', 'Light pistol', 'Heavy pistol', 'Machine pistol', 'Submachine gun', 'Assault rifle', 'Shotgun', 'Sniper rifle',
];

export const MELEE_WEAPON_NAMES = ['Knife', 'Combat axe', 'Katana', 'Extendable baton', 'Stun baton'];

export const SOCIAL_GEAR = ['Tailored suit', 'Encrypted commlink', 'Recording pin'];
export const TECH_GEAR = ['Cyberdeck', 'Diagnostic rig', 'Signal scanner'];
export const MAGIC_GEAR = ['Spell focus', 'Grimoire', 'Ritual materials'];
export const RIGGER_GEAR = ['Command console', 'Drone toolkit', 'Spare rotor drone'];
