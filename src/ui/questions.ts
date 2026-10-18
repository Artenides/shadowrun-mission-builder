import type {
  CampaignInputs,
  PartyRole,
  PowerTier,
  Region,
  Tone,
  AntagonistFlavor,
  MoralComplexity,
  CityScope,
  CityTier,
} from '../engine/types';
import { MISSION_TYPES } from '../content/missionContent';

export const PARTY_ROLES: PartyRole[] = [
  'Street Samurai', 'Mage', 'Decker', 'Rigger', 'Face', 'Adept', 'Technomancer', 'Mixed-generalist',
];

export const POWER_TIERS: PowerTier[] = ['Street-level', 'Professional', 'Veteran', 'Elite'];

export const CITY_SIZES: { value: CityTier; hint: string }[] = [
  { value: 'Megacity Sprawl', hint: '8M–25M people. Vertical, dense, corp-saturated.' },
  { value: 'Major Metro', hint: '1.5M–8M people. A proper big city, but not a sprawl.' },
  { value: 'Mid-size Hub', hint: '150k–1.5M people. Fewer players, tighter politics.' },
  { value: 'Frontier Town', hint: '5k–150k people. Small, exposed, thin on authority.' },
];

export const REGIONS: Region[] = [
  'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania & Pacific Rim', 'Off-grid',
];

export const CITY_SCOPES: { value: CityScope; label: string; hint: string }[] = [
  { value: 'single', label: 'Single anchor city', hint: 'Missions orbit one generated city.' },
  { value: 'multi', label: 'Multiple cities & roaming jobs', hint: 'Outlier jobs may happen far from the home city.' },
];

export const TONES: Tone[] = ['Gritty noir', 'Pulpy action', 'Corporate intrigue', 'Horror-tinged', 'Comedic chaos'];

export const ANTAGONIST_FLAVORS: AntagonistFlavor[] = [
  'Megacorp', 'Organized crime', 'Gang', 'Insect spirits or horror', 'Government black-ops',
  'Dragon / high-powered metahuman', 'Let the tool decide',
];

export const MORAL_COMPLEXITIES: MoralComplexity[] = [
  'Clear-cut villains', 'Shades of grey', 'The client is the real threat',
];

export const MISSION_TYPE_OPTIONS = MISSION_TYPES;

export const OUTLIER_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 10, label: 'Tightly woven', hint: 'Almost every job ties into the same arc.' },
  { value: 45, label: 'Balanced', hint: 'A few standalone jobs mixed into a connected arc.' },
  { value: 80, label: 'Loosely connected', hint: 'Mostly flavor jobs, with a thin thread tying some together.' },
];

export const DEFAULT_INPUTS: CampaignInputs = {
  partyRoles: ['Mixed-generalist'],
  partySize: 4,
  powerTier: 'Professional',
  cityNameOverride: '',
  citySize: 'Megacity Sprawl',
  region: 'North America',
  cityScope: 'single',
  urbanFrontier: 50,
  tone: 'Gritty noir',
  antagonistFlavor: 'Let the tool decide',
  moralComplexity: 'Shades of grey',
  missionCount: 6,
  enabledMissionTypes: [...MISSION_TYPES],
  outlierRatio: 45,
  includeNpcs: true,
  npcCrunch: 'quick',
  seedPhrase: '',
};
