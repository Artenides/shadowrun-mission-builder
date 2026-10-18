import { pick, chance, type Rng } from '../rng/seed';
import type { CampaignInputs, CityProfile, Stakeholder } from './types';

const TITLE_TEMPLATES = [
  'The {city} Contracts', 'Shadows Over {city}', '{city} Static', 'The {city} Job',
  'Ghosts of {city}', '{city}: Open Season', 'Static Over {city}', 'The Long Night in {city}',
  '{city} Burning', 'Wires Crossed in {city}',
];

const CODE_WORDS = ['NIGHTGLASS', 'REDLINE', 'DEADWEIGHT', 'HOLLOWPOINT', 'BLACKWATER', 'GREYMARKET', 'FIREBREAK'];

export function generateCampaignTitle(city: CityProfile, rng: Rng): string {
  const title = pick(rng, TITLE_TEMPLATES).replace('{city}', city.name);
  if (chance(rng, 0.35)) {
    return `Operation ${pick(rng, CODE_WORDS)}: ${title}`;
  }
  return title;
}

export function generateCampaignSummary(
  city: CityProfile,
  inputs: CampaignInputs,
  mainStakeholder: Stakeholder | null,
): string {
  const ambience = city.ambienceTags.join(', ');
  const lede = `${city.name} is a ${city.tier.toLowerCase()} of roughly ${city.population} people${
    ambience ? `, ${ambience}` : ''
  }.`;
  const engine =
    city.economicEngine.length > 0 ? ` Its economy runs on ${city.economicEngine.join(' and ').toLowerCase()}.` : '';
  const orbit = mainStakeholder
    ? ` Over ${inputs.missionCount} jobs, the party will find themselves pulled — quietly at first — into ${mainStakeholder.name}'s orbit.`
    : ` Over ${inputs.missionCount} jobs, the party will work their way through the city's underbelly without ever quite seeing the whole picture.`;
  const outlierNote =
    inputs.outlierRatio > 50
      ? " A fair number of these jobs are unconnected flavor — don't force a thread where there isn't one."
      : " Most of these jobs trace back to the same handful of players, even when it doesn't look that way at first.";
  return `${lede}${engine}${orbit}${outlierNote}`;
}
