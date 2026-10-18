import type {
  CampaignInputs,
  PartyRole,
  PowerTier,
  Region,
  Tone,
  AntagonistFlavor,
  MoralComplexity,
  CityScope,
} from '../engine/types';

export const PARTY_ROLES: PartyRole[] = [
  'Street Samurai', 'Mage', 'Decker', 'Rigger', 'Face', 'Adept', 'Technomancer', 'Mixed-generalist',
];

export const POWER_TIERS: PowerTier[] = ['Street-level', 'Professional', 'Veteran', 'Elite'];

export const REGIONS: Region[] = [
  'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania & Pacific Rim', 'Off-grid',
];

export const TONES: Tone[] = ['Gritty noir', 'Pulpy action', 'Corporate intrigue', 'Horror-tinged', 'Comedic chaos'];

export const ANTAGONIST_FLAVORS: AntagonistFlavor[] = [
  'Megacorp', 'Organized crime', 'Gang', 'Insect spirits or horror', 'Government black-ops',
  'Dragon / high-powered metahuman', 'Let the tool decide',
];

export const MORAL_COMPLEXITIES: MoralComplexity[] = [
  'Clear-cut villains', 'Shades of grey', 'The client is the real threat',
];

export const CITY_SCOPES: { value: CityScope; label: string; hint: string }[] = [
  { value: 'single', label: 'Single anchor city', hint: 'Missions orbit one generated city.' },
  { value: 'multi', label: 'Multiple cities & roaming jobs', hint: 'Outlier jobs may happen far from the home city.' },
];

export const DEFAULT_INPUTS: CampaignInputs = {
  partyRoles: ['Mixed-generalist'],
  partySize: 4,
  powerTier: 'Professional',
  region: 'North America',
  urbanFrontier: 20,
  missionCount: 6,
  tone: 'Gritty noir',
  antagonistFlavor: 'Let the tool decide',
  moralComplexity: 'Shades of grey',
  outlierRatio: 25,
  includeNpcs: true,
  npcCrunch: 'quick',
  seedPhrase: '',
  cityNameOverride: '',
  cityScope: 'single',
};
