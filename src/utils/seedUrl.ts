import type { CampaignInputs } from '../engine/types';

const KEYS = {
  partyRoles: 'pr',
  partySize: 'ps',
  powerTier: 'pt',
  region: 'rg',
  urbanFrontier: 'uf',
  missionCount: 'mc',
  tone: 'tn',
  antagonistFlavor: 'af',
  moralComplexity: 'mx',
  outlierRatio: 'or',
  includeNpcs: 'in',
  npcCrunch: 'nc',
  seedPhrase: 'sd',
  cityNameOverride: 'cn',
  cityScope: 'cs',
} as const;

export function inputsToSearchParams(inputs: CampaignInputs): URLSearchParams {
  const params = new URLSearchParams();
  params.set(KEYS.partyRoles, inputs.partyRoles.join('|'));
  params.set(KEYS.partySize, String(inputs.partySize));
  params.set(KEYS.powerTier, inputs.powerTier);
  params.set(KEYS.region, inputs.region);
  params.set(KEYS.urbanFrontier, String(inputs.urbanFrontier));
  params.set(KEYS.missionCount, String(inputs.missionCount));
  params.set(KEYS.tone, inputs.tone);
  params.set(KEYS.antagonistFlavor, inputs.antagonistFlavor);
  params.set(KEYS.moralComplexity, inputs.moralComplexity);
  params.set(KEYS.outlierRatio, String(inputs.outlierRatio));
  params.set(KEYS.includeNpcs, inputs.includeNpcs ? '1' : '0');
  params.set(KEYS.npcCrunch, inputs.npcCrunch);
  params.set(KEYS.seedPhrase, inputs.seedPhrase);
  params.set(KEYS.cityNameOverride, inputs.cityNameOverride);
  params.set(KEYS.cityScope, inputs.cityScope);
  return params;
}

export function searchParamsToInputs(params: URLSearchParams, fallback: CampaignInputs): CampaignInputs {
  const get = (k: string, def: string) => params.get(k) ?? def;
  return {
    partyRoles: get(KEYS.partyRoles, fallback.partyRoles.join('|'))
      .split('|')
      .filter(Boolean) as CampaignInputs['partyRoles'],
    partySize: Number(get(KEYS.partySize, String(fallback.partySize))),
    powerTier: get(KEYS.powerTier, fallback.powerTier) as CampaignInputs['powerTier'],
    region: get(KEYS.region, fallback.region) as CampaignInputs['region'],
    urbanFrontier: Number(get(KEYS.urbanFrontier, String(fallback.urbanFrontier))),
    missionCount: Number(get(KEYS.missionCount, String(fallback.missionCount))),
    tone: get(KEYS.tone, fallback.tone) as CampaignInputs['tone'],
    antagonistFlavor: get(KEYS.antagonistFlavor, fallback.antagonistFlavor) as CampaignInputs['antagonistFlavor'],
    moralComplexity: get(KEYS.moralComplexity, fallback.moralComplexity) as CampaignInputs['moralComplexity'],
    outlierRatio: Number(get(KEYS.outlierRatio, String(fallback.outlierRatio))),
    includeNpcs: get(KEYS.includeNpcs, fallback.includeNpcs ? '1' : '0') === '1',
    npcCrunch: get(KEYS.npcCrunch, fallback.npcCrunch) as CampaignInputs['npcCrunch'],
    seedPhrase: get(KEYS.seedPhrase, fallback.seedPhrase),
    cityNameOverride: get(KEYS.cityNameOverride, fallback.cityNameOverride),
    cityScope: get(KEYS.cityScope, fallback.cityScope) as CampaignInputs['cityScope'],
  };
}

export function buildShareUrl(inputs: CampaignInputs): string {
  const params = inputsToSearchParams(inputs);
  const url = new URL(window.location.href);
  url.search = params.toString();
  return url.toString();
}

export function readInputsFromLocation(fallback: CampaignInputs): CampaignInputs | null {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return null;
  return searchParamsToInputs(params, fallback);
}
