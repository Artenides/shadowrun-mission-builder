import { pick, pickN, intBetween, chance, weightedPick, type Rng } from '../rng/seed';
import { CITY_NAME_PARTS } from '../content/cityNames';
import {
  CORP_INDUSTRY_WORDS,
  CORP_SUFFIXES,
  LOCAL_CORP_SUFFIXES,
  GANG_ADJECTIVES,
  GANG_NOUNS,
  ORGANIZED_CRIME_NAMES,
  WILDCARD_FACTION_NAMES,
  GOV_AUTHORITY_NAMES,
} from '../content/corpGangNames';
import { DISTRICT_TEMPLATES } from '../content/districts';
import { SECRET_AGENDAS, KNOWN_ASSETS, ECONOMIC_ENGINES, AMBIENCE_TAGS } from '../content/stakeholderContent';
import type {
  CampaignInputs,
  CityProfile,
  CityTier,
  District,
  Stakeholder,
  StakeholderType,
  PowerLevel,
  Disposition,
  RelationshipKind,
} from './types';

const POPULATION_RANGES: Record<CityTier, [number, number]> = {
  'Megacity Sprawl': [8_000_000, 25_000_000],
  'Major Metro': [1_500_000, 8_000_000],
  'Mid-size Hub': [150_000, 1_500_000],
  'Frontier Town': [5_000, 150_000],
};

/**
 * City size (tier) is now its own direct choice (Q: "City size") rather than
 * derived from the urban/frontier slider. The slider still matters, but only
 * as a density/lawlessness lean WITHIN the chosen tier's population range —
 * e.g. a frontier-leaning "Major Metro" sits toward the low end of Metro
 * population, a sprawl-leaning one toward the high end.
 */
function populationForTier(tier: CityTier, urbanFrontier: number, rng: Rng): string {
  const [popMin, popMax] = POPULATION_RANGES[tier];
  const lean = urbanFrontier / 100; // 0 = dense sprawl .. 1 = frontier-ish
  const target = popMax - (popMax - popMin) * lean;
  const spread = (popMax - popMin) * 0.25;
  const low = Math.max(popMin, Math.round(target - spread));
  const high = Math.min(popMax, Math.round(target + spread));
  return formatPopulation(intBetween(rng, low, high));
}

const DISTRICT_COUNT: Record<CityTier, number> = {
  'Megacity Sprawl': 6,
  'Major Metro': 5,
  'Mid-size Hub': 4,
  'Frontier Town': 3,
};

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  return `${Math.round(n / 1000)}k`;
}

function generateCityName(inputs: CampaignInputs, rng: Rng): string {
  const override = inputs.cityNameOverride.trim();
  if (override) return override;
  const parts = CITY_NAME_PARTS[inputs.region];
  const base = `${pick(rng, parts.prefixes)}${pick(rng, parts.suffixes)}`;
  if (chance(rng, 0.3)) {
    return `${pick(rng, parts.epithets)} ${base}`;
  }
  return base;
}

function generateMetahumanMix(rng: Rng) {
  const human = intBetween(rng, 50, 72);
  let remainder = 100 - human;
  const elf = intBetween(rng, 2, Math.max(2, Math.floor(remainder * 0.4)));
  remainder -= elf;
  const dwarf = intBetween(rng, 2, Math.max(2, Math.floor(remainder * 0.4)));
  remainder -= dwarf;
  const ork = intBetween(rng, 2, Math.max(2, Math.floor(remainder * 0.6)));
  remainder -= ork;
  const troll = Math.max(1, remainder);
  return { human, elf, dwarf, ork, troll };
}

function corpName(rng: Rng, local = false): string {
  const industry = pick(rng, CORP_INDUSTRY_WORDS);
  const suffix = local ? pick(rng, LOCAL_CORP_SUFFIXES) : pick(rng, CORP_SUFFIXES);
  return local ? `${industry} ${suffix}` : `${industry}${suffix}`;
}

function gangName(rng: Rng): string {
  return `the ${pick(rng, GANG_ADJECTIVES)} ${pick(rng, GANG_NOUNS)}`;
}

function nameForStakeholderType(type: StakeholderType, rng: Rng): string {
  switch (type) {
    case 'AAA Megacorp':
    case 'AA Corp':
      return corpName(rng, false);
    case 'Local Corp':
      return corpName(rng, true);
    case 'Organized Crime':
      return pick(rng, ORGANIZED_CRIME_NAMES);
    case 'Street Gang':
      return gangName(rng);
    case 'Government/Authority':
      return pick(rng, GOV_AUTHORITY_NAMES);
    case 'Wildcard':
      return pick(rng, WILDCARD_FACTION_NAMES);
  }
}

const POWER_LEVELS: { value: PowerLevel; weight: number }[] = [
  { value: 'Dominant', weight: 1 },
  { value: 'Established', weight: 3 },
  { value: 'Rising', weight: 3 },
  { value: 'Fringe', weight: 2 },
];

const DISPOSITIONS: { value: Disposition; weight: number }[] = [
  { value: 'Friendly', weight: 2 },
  { value: 'Neutral', weight: 4 },
  { value: 'Hostile', weight: 3 },
];

const RELATIONSHIP_KINDS: RelationshipKind[] = ['Rivalry', 'Alliance', 'Debt', 'Infiltration'];

/** Which stakeholder type(s) the DM's chosen antagonist flavor should bias toward being "Dominant". */
function antagonistTypeHint(flavor: CampaignInputs['antagonistFlavor']): StakeholderType | null {
  switch (flavor) {
    case 'Megacorp':
      return 'AAA Megacorp';
    case 'Organized crime':
      return 'Organized Crime';
    case 'Gang':
      return 'Street Gang';
    case 'Government black-ops':
      return 'Government/Authority';
    case 'Insect spirits or horror':
    case 'Dragon / high-powered metahuman':
      return 'Wildcard';
    default:
      return null;
  }
}

function buildStakeholderRoster(inputs: CampaignInputs, tier: CityTier, rng: Rng): StakeholderType[] {
  const roster: StakeholderType[] = [];
  const corpSlots = tier === 'Frontier Town' ? intBetween(rng, 0, 1) : intBetween(rng, 1, 2);
  for (let i = 0; i < corpSlots; i++) {
    roster.push(tier === 'Megacity Sprawl' || tier === 'Major Metro' ? 'AAA Megacorp' : 'AA Corp');
  }
  if (tier === 'Frontier Town' && roster.length === 0) roster.push('Local Corp');
  const crimeSlots = intBetween(rng, 1, 2);
  for (let i = 0; i < crimeSlots; i++) {
    roster.push(chance(rng, 0.5) ? 'Organized Crime' : 'Street Gang');
  }
  roster.push('Government/Authority');
  roster.push('Wildcard');

  const hint = antagonistTypeHint(inputs.antagonistFlavor);
  if (hint && !roster.includes(hint)) roster.push(hint);

  return roster;
}

function generateStakeholders(inputs: CampaignInputs, tier: CityTier, rng: Rng): Stakeholder[] {
  const roster = buildStakeholderRoster(inputs, tier, rng);
  const hint = antagonistTypeHint(inputs.antagonistFlavor);
  const usedNames = new Set<string>();

  const stakeholders: Stakeholder[] = roster.map((type, i) => {
    let name = nameForStakeholderType(type, rng);
    let attempts = 0;
    while (usedNames.has(name) && attempts < 5) {
      name = nameForStakeholderType(type, rng);
      attempts++;
    }
    usedNames.add(name);

    const forceDominant = hint === type && i === roster.indexOf(hint);
    const powerLevel = forceDominant ? 'Dominant' : weightedPick(rng, POWER_LEVELS);

    return {
      id: `sh-${i}-${name.replace(/\s+/g, '').toLowerCase()}`,
      name,
      type,
      powerLevel,
      disposition: weightedPick(rng, DISPOSITIONS),
      knownAssets: pickN(rng, KNOWN_ASSETS, intBetween(rng, 1, 2)),
      secretAgenda: pick(rng, SECRET_AGENDAS),
      relationship: null,
    };
  });

  // Give most stakeholders a relationship to another, for flavor and future thread-web use.
  for (const s of stakeholders) {
    if (stakeholders.length < 2) break;
    if (!chance(rng, 0.7)) continue;
    const others = stakeholders.filter((o) => o.id !== s.id);
    const target = pick(rng, others);
    s.relationship = { targetId: target.id, kind: pick(rng, RELATIONSHIP_KINDS) };
  }

  return stakeholders;
}

function generateDistricts(tier: CityTier, rng: Rng): District[] {
  const count = DISTRICT_COUNT[tier];
  const templates = pickN(rng, DISTRICT_TEMPLATES, count);
  return templates.map((t, i) => ({
    id: `dist-${i}`,
    name: `${pick(rng, t.namePrefix)} ${pick(rng, t.nameNoun)}`,
    role: t.role,
    flavor: pick(rng, t.flavorOptions),
    missionAffinity: t.missionAffinity,
  }));
}

export function generateCity(inputs: CampaignInputs, rng: Rng): CityProfile {
  const tier = inputs.citySize;
  const population = populationForTier(tier, inputs.urbanFrontier, rng);

  const ambienceTags = pickN(rng, AMBIENCE_TAGS, intBetween(rng, 2, 3));
  const economicEngine = pickN(rng, ECONOMIC_ENGINES, intBetween(rng, 1, 2));

  return {
    name: generateCityName(inputs, rng),
    region: inputs.region,
    tier,
    population,
    metahumanMix: generateMetahumanMix(rng),
    awakenedFraction: intBetween(rng, 2, 15),
    economicEngine,
    ambienceTags,
    districts: generateDistricts(tier, rng),
    stakeholders: generateStakeholders(inputs, tier, rng),
  };
}
