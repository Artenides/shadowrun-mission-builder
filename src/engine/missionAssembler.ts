import { pick, pickN, intBetween, chance, weightedPick, type Rng } from '../rng/seed';
import { AWAY_LOCATIONS } from '../content/cityNames';
import {
  MISSION_TYPES,
  VERB_PHRASES,
  ASSET_WORDS,
  DEADLINE_CLAUSES,
  FIXER_DESCRIPTORS,
  COMPLICATIONS_GENERAL,
  COMPLICATIONS_BY_TONE,
  TITLE_TEMPLATES,
  OUTLIER_NOTES_PURE,
  OUTLIER_NOTES_RED_HERRING,
  THREAD_NOTE_PLANT,
  THREAD_NOTE_DEVELOP,
  THREAD_NOTE_PAYOFF,
} from '../content/missionContent';
import type { CampaignInputs, CityProfile, District, Mission, MissionPlan, MissionType, PartyRole, Stakeholder } from './types';
import { agree, isPluralStakeholder, possessive } from './grammar';

const ROLE_WEIGHTS: Partial<Record<PartyRole, Partial<Record<MissionType, number>>>> = {
  'Street Samurai': { 'Wet work': 3, 'Smash-and-grab': 2, 'Protection/Escort': 2 },
  Mage: { Reconnaissance: 2, 'Wet work': 1, Sabotage: 1 },
  Decker: { 'Data run': 4, Infiltration: 1, Sabotage: 1 },
  Rigger: { 'Protection/Escort': 3, 'Smash-and-grab': 2, Reconnaissance: 1 },
  Face: { 'Deception/Social engineering': 4, 'Negotiation-gone-wrong': 2 },
  Adept: { Infiltration: 2, 'Wet work': 2, Rescue: 1 },
  Technomancer: { 'Data run': 4, Reconnaissance: 1 },
};

function pickMissionType(inputs: CampaignInputs, prevType: MissionType | null, rng: Rng): MissionType {
  // Restrict to whatever the DM left checked in "Mission types to include" — falling back to
  // the full list only if they somehow unchecked everything, so generation never breaks.
  const candidates = inputs.enabledMissionTypes.length > 0 ? inputs.enabledMissionTypes : MISSION_TYPES;
  const weights = candidates.map((type) => {
    let w = 1;
    for (const role of inputs.partyRoles) {
      w += ROLE_WEIGHTS[role]?.[type] ?? 0;
    }
    if (type === prevType) w *= 0.15;
    return { value: type, weight: w };
  });
  return weightedPick(rng, weights);
}

interface ResolvedLocation {
  districtId: string | null;
  locationName: string;
  hookPhrase: string;
  flavor: string | null;
}

function resolveLocation(city: CityProfile, plan: MissionPlan, type: MissionType, rng: Rng): ResolvedLocation {
  const useAway = plan.isOutlier && chance(rng, 0.5);
  if (useAway || city.districts.length === 0) {
    const away = pick(rng, AWAY_LOCATIONS);
    return {
      districtId: null,
      locationName: away.charAt(0).toUpperCase() + away.slice(1) + '.',
      hookPhrase: away,
      flavor: null,
    };
  }
  const matching = city.districts.filter((d) => d.missionAffinity.includes(type));
  const pool = matching.length > 0 ? matching : city.districts;
  const district: District = pick(rng, pool);
  const alreadyHasArticle = /^the\s/i.test(district.name);
  return {
    districtId: district.id,
    locationName: `${district.name} (${city.name})`,
    hookPhrase: alreadyHasArticle ? district.name : `the ${district.name}`,
    flavor: district.flavor,
  };
}

function resolveThreadStakeholder(city: CityProfile, plan: MissionPlan): Stakeholder | null {
  if (!plan.stakeholderId) return null;
  return city.stakeholders.find((s) => s.id === plan.stakeholderId) ?? null;
}

interface VisibleClient {
  hookLabel: string;
  stakeholder: Stakeholder | null;
}

/**
 * Decides who the hook text actually names as the client. This is kept
 * deliberately separate from the thread web's hidden stakeholder (see
 * resolveThreadStakeholder) for all but the payoff mission in a cluster —
 * otherwise every connected mission would openly name the same client and
 * the "hidden" connection would be obvious from mission one.
 */
function resolveVisibleClient(city: CityProfile, plan: MissionPlan, threadStakeholder: Stakeholder | null, rng: Rng): VisibleClient {
  if (plan.isOutlier) {
    if (city.stakeholders.length === 0 || chance(rng, 0.6)) {
      return { hookLabel: pick(rng, FIXER_DESCRIPTORS), stakeholder: null };
    }
    const stakeholder = pick(rng, city.stakeholders);
    return { hookLabel: stakeholder.name, stakeholder };
  }

  // The payoff mission is where the thread surfaces: the client IS the stakeholder it traces to.
  if (threadStakeholder && plan.revealStage === 'payoff') {
    return { hookLabel: threadStakeholder.name, stakeholder: threadStakeholder };
  }

  // Plant/develop stages: never name the thread's real stakeholder here, or the connection
  // would be obvious immediately instead of surfacing gradually through the DM's notes.
  const pool = city.stakeholders.filter((s) => s.id !== threadStakeholder?.id);
  if (pool.length > 0 && chance(rng, 0.7)) {
    const stakeholder = pick(rng, pool);
    return { hookLabel: stakeholder.name, stakeholder };
  }
  return { hookLabel: pick(rng, FIXER_DESCRIPTORS), stakeholder: null };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildHook(type: MissionType, client: VisibleClient, location: ResolvedLocation, rng: Rng): string {
  let verb = pick(rng, VERB_PHRASES[type]);
  if (verb.includes('{asset}')) {
    verb = verb.replace('{asset}', pick(rng, ASSET_WORDS));
  }
  const deadline = chance(rng, 0.5) ? `, ${pick(rng, DEADLINE_CLAUSES)}` : '';
  const needsVerb = agree(isPluralStakeholder(client.stakeholder), 'needs', 'need');
  return capitalize(`${client.hookLabel} ${needsVerb} the party to ${verb} ${location.hookPhrase}${deadline}.`);
}

function pickComplications(inputs: CampaignInputs, rng: Rng): string[] {
  const pool = [...COMPLICATIONS_GENERAL, ...COMPLICATIONS_BY_TONE[inputs.tone]];
  return pickN(rng, pool, intBetween(rng, 1, 3));
}

function buildThreadNote(plan: MissionPlan, stakeholder: Stakeholder | null, rng: Rng): string {
  if (plan.isOutlier) {
    return plan.redHerring ? pick(rng, OUTLIER_NOTES_RED_HERRING) : pick(rng, OUTLIER_NOTES_PURE);
  }
  const who = stakeholder ? stakeholder.name : 'a stakeholder yet to be named';
  const isAre = agree(isPluralStakeholder(stakeholder), 'is', 'are');
  switch (plan.revealStage) {
    case 'plant':
      return `${pick(rng, THREAD_NOTE_PLANT)} (The thread traces back to ${who}.)`;
    case 'develop':
      return `${pick(rng, THREAD_NOTE_DEVELOP)} (This confirms ${possessive(who)} involvement, if the party is looking.)`;
    case 'payoff':
    default:
      return `${pick(rng, THREAD_NOTE_PAYOFF)} (${who} ${isAre} behind it — or at least, ${isAre} who the trail leads to.)`;
  }
}

function buildTitle(type: MissionType, location: ResolvedLocation, rng: Rng): string {
  const base = pick(rng, TITLE_TEMPLATES[type]);
  return chance(rng, 0.5) && location.flavor ? `${base}: ${location.locationName.split(' (')[0]}` : base;
}

export function assembleMission(
  index: number,
  inputs: CampaignInputs,
  city: CityProfile,
  plan: MissionPlan,
  rng: Rng,
  prevType: MissionType | null,
): Mission {
  const type = pickMissionType(inputs, prevType, rng);
  const location = resolveLocation(city, plan, type, rng);
  const threadStakeholder = resolveThreadStakeholder(city, plan);
  const client = resolveVisibleClient(city, plan, threadStakeholder, rng);

  return {
    id: plan.missionId,
    index,
    title: buildTitle(type, location, rng),
    type,
    districtId: location.districtId,
    locationName: location.locationName,
    hook: buildHook(type, client, location, rng),
    complications: pickComplications(inputs, rng),
    narrativeThreadNote: buildThreadNote(plan, threadStakeholder, rng),
    isOutlier: plan.isOutlier,
    clientStakeholderId: client.stakeholder?.id ?? null,
    npcs: [],
  };
}
