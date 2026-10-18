import type { CampaignInputs } from '../engine/types';
import type { ThemeId } from '../ui/themes';
import { encodeShareToken, decodeShareToken, type SharedState } from './compactShare';

const TOKEN_KEY = 'c';

/**
 * Builds a share URL carrying one compact token (bit-packed campaign inputs +
 * theme, base64url-encoded — see utils/compactShare.ts) instead of ~17
 * separate spelled-out query params.
 */
export function buildShareUrl(inputs: CampaignInputs, theme: ThemeId): string {
  const token = encodeShareToken(inputs, theme);
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set(TOKEN_KEY, token);
  return url.toString();
}

/** Reads and decodes the share token from the current URL, if any. */
export function readSharedStateFromLocation(fallback: CampaignInputs): SharedState | null {
  const token = new URLSearchParams(window.location.search).get(TOKEN_KEY);
  if (!token) return null;
  return decodeShareToken(token, fallback);
}
