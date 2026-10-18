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

export interface NpcBlock {
  name: string;
  roleTag: string;
  threatTier: ThreatTier;
  headcount?: number; // present for Mook squads
  dicePool: number;
  soak: number;
  conditionBoxes: number;
  edge?: number;
  specials: string[];
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
