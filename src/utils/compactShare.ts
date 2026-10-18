import {
  BitWriter,
  BitReader,
  bytesToBase64Url,
  base64UrlToBytes,
  bitmaskFromSelection,
  selectionFromBitmask,
  indexOrFallback,
  nearestIndex,
} from './bitPacking';
import {
  PARTY_ROLES,
  POWER_TIERS,
  CITY_SIZES,
  REGIONS,
  CITY_SCOPES,
  TONES,
  ANTAGONIST_FLAVORS,
  MORAL_COMPLEXITIES,
  MISSION_TYPE_OPTIONS,
  OUTLIER_PRESETS,
} from '../ui/questions';
import { THEME_OPTIONS, DEFAULT_THEME, type ThemeId } from '../ui/themes';
import type { CampaignInputs, NpcCrunch } from '../engine/types';

const CITY_SIZE_VALUES = CITY_SIZES.map((o) => o.value);
const CITY_SCOPE_VALUES = CITY_SCOPES.map((o) => o.value);
const OUTLIER_VALUES = OUTLIER_PRESETS.map((o) => o.value);
const THEME_IDS = THEME_OPTIONS.map((o) => o.id);

/** Bumped whenever the bit layout changes; a mismatched version is rejected rather than misread. */
const FORMAT_VERSION = 1;

const MAX_TEXT_BYTES = 60;

export interface SharedState {
  inputs: CampaignInputs;
  theme: ThemeId;
}

export function encodeShareToken(inputs: CampaignInputs, theme: ThemeId): string {
  const w = new BitWriter();
  w.writeByte(FORMAT_VERSION);
  w.writeBits(bitmaskFromSelection(PARTY_ROLES, inputs.partyRoles), 8);
  w.writeBits(Math.min(7, Math.max(0, inputs.partySize - 1)), 3);
  w.writeBits(indexOrFallback(POWER_TIERS, inputs.powerTier), 2);
  w.writeBits(indexOrFallback(CITY_SIZE_VALUES, inputs.citySize), 2);
  w.writeBits(indexOrFallback(REGIONS, inputs.region), 3);
  w.writeBits(indexOrFallback(CITY_SCOPE_VALUES, inputs.cityScope), 1);
  w.writeBits(Math.min(127, Math.max(0, inputs.urbanFrontier)), 7);
  w.writeBits(indexOrFallback(TONES, inputs.tone), 3);
  w.writeBits(indexOrFallback(ANTAGONIST_FLAVORS, inputs.antagonistFlavor), 3);
  w.writeBits(indexOrFallback(MORAL_COMPLEXITIES, inputs.moralComplexity), 2);
  w.writeBits(Math.min(7, Math.max(0, inputs.missionCount - 3)), 3);
  w.writeBits(bitmaskFromSelection(MISSION_TYPE_OPTIONS, inputs.enabledMissionTypes), 11);
  w.writeBits(nearestIndex(OUTLIER_VALUES, inputs.outlierRatio), 2);
  w.writeBits(inputs.includeNpcs ? 1 : 0, 1);
  w.writeBits(inputs.npcCrunch === 'full' ? 1 : 0, 1);
  w.writeBits(indexOrFallback(THEME_IDS, theme), 2);

  const cityNameBytes = new TextEncoder().encode(inputs.cityNameOverride).slice(0, MAX_TEXT_BYTES);
  const seedBytes = new TextEncoder().encode(inputs.seedPhrase).slice(0, MAX_TEXT_BYTES);
  w.writeByte(cityNameBytes.length);
  w.writeBytes(cityNameBytes);
  w.writeByte(seedBytes.length);
  w.writeBytes(seedBytes);

  return bytesToBase64Url(w.finish());
}

export function decodeShareToken(token: string, fallback: CampaignInputs): SharedState | null {
  try {
    const bytes = base64UrlToBytes(token);
    const r = new BitReader(bytes);

    if (r.readByte() !== FORMAT_VERSION) return null;

    const partyRoles = selectionFromBitmask(PARTY_ROLES, r.readBits(8));
    const partySize = r.readBits(3) + 1;
    const powerTier = POWER_TIERS[r.readBits(2)] ?? fallback.powerTier;
    const citySize = CITY_SIZE_VALUES[r.readBits(2)] ?? fallback.citySize;
    const region = REGIONS[r.readBits(3)] ?? fallback.region;
    const cityScope = CITY_SCOPE_VALUES[r.readBits(1)] ?? fallback.cityScope;
    const urbanFrontier = r.readBits(7);
    const tone = TONES[r.readBits(3)] ?? fallback.tone;
    const antagonistFlavor = ANTAGONIST_FLAVORS[r.readBits(3)] ?? fallback.antagonistFlavor;
    const moralComplexity = MORAL_COMPLEXITIES[r.readBits(2)] ?? fallback.moralComplexity;
    const missionCount = r.readBits(3) + 3;
    const enabledMissionTypes = selectionFromBitmask(MISSION_TYPE_OPTIONS, r.readBits(11));
    const outlierRatio = OUTLIER_VALUES[r.readBits(2)] ?? fallback.outlierRatio;
    const includeNpcs = r.readBits(1) === 1;
    const npcCrunch: NpcCrunch = r.readBits(1) === 1 ? 'full' : 'quick';
    const theme = THEME_IDS[r.readBits(2)] ?? DEFAULT_THEME;

    const cityNameLen = r.readByte();
    const cityNameOverride = new TextDecoder().decode(r.readBytes(cityNameLen));
    const seedLen = r.readByte();
    const seedPhrase = new TextDecoder().decode(r.readBytes(seedLen));

    const inputs: CampaignInputs = {
      partyRoles: partyRoles.length > 0 ? partyRoles : fallback.partyRoles,
      partySize,
      powerTier,
      cityNameOverride,
      citySize,
      region,
      cityScope,
      urbanFrontier,
      tone,
      antagonistFlavor,
      moralComplexity,
      missionCount,
      enabledMissionTypes,
      outlierRatio,
      includeNpcs,
      npcCrunch,
      seedPhrase,
    };

    return { inputs, theme };
  } catch {
    // Malformed/foreign token (hand-edited URL, truncated copy-paste, old format, etc.) —
    // treat exactly like "no shared link" rather than crashing the app.
    return null;
  }
}
