import { makeRng, randomSeedPhrase } from '../rng/seed';
import { generateCity } from './cityGenerator';
import { buildThreadWeb } from './threadWeb';
import { assembleMission } from './missionAssembler';
import { generateNpcsForMission } from './npcGenerator';
import { generateCampaignTitle, generateCampaignSummary } from './campaignText';
import type { Campaign, CampaignInputs, Mission, MissionType } from './types';

function pickMainStakeholder(campaign: Pick<Campaign, 'city' | 'threadLinks'>) {
  if (campaign.threadLinks.length === 0) return null;
  const biggest = [...campaign.threadLinks].sort((a, b) => b.missionIds.length - a.missionIds.length)[0];
  if (!biggest.stakeholderId) return null;
  return campaign.city.stakeholders.find((s) => s.id === biggest.stakeholderId) ?? null;
}

export function generateCampaign(inputs: CampaignInputs): Campaign {
  const seed = inputs.seedPhrase.trim() || randomSeedPhrase();
  const resolvedInputs: CampaignInputs = { ...inputs, seedPhrase: seed };
  const rng = makeRng(seed);

  const city = generateCity(resolvedInputs, rng);
  const { plans, links } = buildThreadWeb(resolvedInputs, city, rng);

  const missions: Mission[] = [];
  let prevType: MissionType | null = null;
  for (let i = 0; i < resolvedInputs.missionCount; i++) {
    const mission = assembleMission(i, resolvedInputs, city, plans[i], rng, prevType);
    prevType = mission.type;
    if (resolvedInputs.includeNpcs) {
      mission.npcs = generateNpcsForMission(mission, resolvedInputs, city, rng);
    }
    missions.push(mission);
  }

  const partial = { city, threadLinks: links };
  const mainStakeholder = pickMainStakeholder(partial);

  return {
    seed,
    inputs: resolvedInputs,
    title: generateCampaignTitle(city, rng),
    summary: generateCampaignSummary(city, resolvedInputs, mainStakeholder),
    city,
    missions,
    plans,
    threadLinks: links,
  };
}

/** Re-rolls only the city's name, leaving districts/stakeholders/missions untouched. */
export function regenerateCityName(campaign: Campaign, nonce: number): { cityName: string; title: string } {
  const rng = makeRng(`${campaign.seed}:cityname:${nonce}`);
  const fresh = generateCity({ ...campaign.inputs, cityNameOverride: '' }, rng);
  const renamedCity = { ...campaign.city, name: fresh.name };
  return { cityName: renamedCity.name, title: generateCampaignTitle(renamedCity, rng) };
}
