export type PartyRole =
  | 'Street Samurai'
  | 'Mage'
  | 'Decker'
  | 'Rigger'
  | 'Face'
  | 'Adept'
  | 'Technomancer'
  | 'Mixed-generalist';

export type PowerTier = 'Street-level' | 'Professional' | 'Veteran' | 'Elite';

export type Region =
  | 'North America'
  | 'South America'
  | 'Europe'
  | 'Asia'
  | 'Africa'
  | 'Oceania & Pacific Rim'
  | 'Off-grid';

export type Tone = 'Gritty noir' | 'Pulpy action' | 'Corporate intrigue' | 'Horror-tinged' | 'Comedic chaos';

export type AntagonistFlavor =
  | 'Megacorp'
  | 'Organized crime'
  | 'Gang'
  | 'Insect spirits or horror'
  | 'Government black-ops'
  | 'Dragon / high-powered metahuman'
  | 'Let the tool decide';

export type MoralComplexity = 'Clear-cut villains' | 'Shades of grey' | 'The client is the real threat';

export type NpcCrunch = 'quick' | 'full';
export type CityScope = 'single' | 'multi';

export interface CampaignInputs {
  partyRoles: PartyRole[];
  partySize: number;
  powerTier: PowerTier;
  cityNameOverride: string;
  citySize: CityTier;
  region: Region;
  cityScope: CityScope;
  urbanFrontier: number; // density/lawlessness lean within the chosen city size — 0 = dense sprawl .. 100 = frontier-ish
  tone: Tone;
  antagonistFlavor: AntagonistFlavor;
  moralComplexity: MoralComplexity;
  missionCount: number;
  enabledMissionTypes: MissionType[];
  outlierRatio: number; // 0 = tightly woven .. 100 = loosely connected (driven by a 3-way preset, not a free slider)
  includeNpcs: boolean;
  npcCrunch: NpcCrunch;
  seedPhrase: string;
}

export type StakeholderType =
  | 'AAA Megacorp'
  | 'AA Corp'
  | 'Local Corp'
  | 'Organized Crime'
  | 'Street Gang'
  | 'Government/Authority'
  | 'Wildcard';

export type PowerLevel = 'Dominant' | 'Established' | 'Rising' | 'Fringe';
export type Disposition = 'Friendly' | 'Neutral' | 'Hostile';
export type RelationshipKind = 'Rivalry' | 'Alliance' | 'Debt' | 'Infiltration';

export interface Stakeholder {
  id: string;
  name: string;
  type: StakeholderType;
  powerLevel: PowerLevel;
  disposition: Disposition;
  knownAssets: string[];
  secretAgenda: string;
  relationship: { targetId: string; kind: RelationshipKind } | null;
}

export type MissionType =
  | 'Infiltration'
  | 'Theft/Extraction'
  | 'Wet work'
  | 'Smash-and-grab'
  | 'Deception/Social engineering'
  | 'Sabotage'
  | 'Protection/Escort'
  | 'Reconnaissance'
  | 'Data run'
  | 'Rescue'
  | 'Negotiation-gone-wrong';

export interface District {
  id: string;
  name: string;
  role: string;
  flavor: string;
  missionAffinity: MissionType[];
}

export type CityTier = 'Megacity Sprawl' | 'Major Metro' | 'Mid-size Hub' | 'Frontier Town';

export interface MetahumanMix {
  human: number;
  elf: number;
  dwarf: number;
  ork: number;
  troll: number;
}

export interface CityProfile {
  name: string;
  region: Region;
  tier: CityTier;
  population: string;
  metahumanMix: MetahumanMix;
  awakenedFraction: number;
  economicEngine: string[];
  ambienceTags: string[];
  districts: District[];
  stakeholders: Stakeholder[];
}

export type ThreatTier = 'Mook' | 'Named' | 'Boss';

export type Metatype = 'Human' | 'Elf' | 'Dwarf' | 'Ork' | 'Troll';

export type AttributeKey = 'strength' | 'agility' | 'willpower' | 'logic' | 'charisma';

/** The 5 Anarchy 2.0 Attributes (Strength, Agility, Willpower, Logic, Charisma), rated 1-4 for
 * most metatypes (higher for some — see content/anarchyRules.ts). Edge is tracked separately,
 * only on Named/Boss NPCs (the "Prime NPC" convention — Regular NPCs don't get Edge). */
export interface NpcAttributes {
  strength: number;
  agility: number;
  willpower: number;
  logic: number;
  charisma: number;
}

/** One Skill line in the book's own notation: average hits is the precomputed threshold a GM
 * rolls against (Regular NPC convention), with the underlying Skill rating + linked Attribute
 * shown alongside it, e.g. "Ranged Weapons 5 (pistols) (6+A, RR 1)". */
export interface NpcSkillLine {
  name: string;
  rating: number; // Skill rating, 0-8
  attribute: AttributeKey;
  specialization?: string;
  riskReduction: number; // RR 0-3
  averageHits: number; // precomputed threshold: round((rating + attribute [+2 if specialized]) / 3) + RR + 1
}

export interface NpcBlock {
  name: string;
  roleTag: string;
  metatype: Metatype;
  threatTier: ThreatTier;
  headcount?: number; // present for Mook squads
  attributes: NpcAttributes;
  edge?: number; // Named/Boss only (Prime NPC convention)
  skills: NpcSkillLine[];
  equipment: string[]; // 2-3 flavorful items, no attached stats
  woundThresholds: { physical: [number, number, number]; mental: [number, number, number] };
  fightingSpirit: 'Null' | 'Low' | 'High' | 'Extreme';
  quickLine: string;
}

export type RevealStage = 'plant' | 'develop' | 'payoff';

export interface MissionPlan {
  missionId: string;
  isOutlier: boolean;
  redHerring: boolean;
  clusterId: string | null;
  stakeholderId: string | null;
  revealStage: RevealStage | null;
}

export interface ThreadLink {
  id: string;
  kind: 'Shared Stakeholder' | 'Recurring NPC' | 'Recurring District' | 'Rumor Payoff';
  missionIds: string[];
  stakeholderId: string | null;
}

export interface Mission {
  id: string;
  index: number;
  title: string;
  type: MissionType;
  districtId: string | null;
  locationName: string;
  hook: string;
  complications: string[];
  narrativeThreadNote: string;
  isOutlier: boolean;
  clientStakeholderId: string | null;
  npcs: NpcBlock[];
}

export interface Campaign {
  seed: string;
  inputs: CampaignInputs;
  title: string;
  summary: string;
  city: CityProfile;
  missions: Mission[];
  plans: MissionPlan[];
  threadLinks: ThreadLink[];
}
