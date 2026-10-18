// Deterministic PRNG utilities. The same seed string always produces the
// same campaign, which is what lets a DM share a seed (via the URL) instead
// of the app storing anything server-side.

export type Rng = () => number;

// cyrb53-style string hash -> 32-bit int, decent distribution for short strings.
function hashString(str: string): number {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0) ^ (h2 >>> 0);
}

/** mulberry32 — small, fast, good enough for flavor-text generation. */
export function makeRng(seed: string): Rng {
  let a = hashString(seed) || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED_WORDS = [
  'NEON', 'CHROME', 'ASH', 'STATIC', 'RAZOR', 'GHOST', 'CIRCUIT', 'RAIN', 'VOLT', 'SMOKE',
];

/** Used only when the DM leaves the seed phrase blank at generation time. */
export function randomSeedPhrase(): string {
  const r = () => Math.floor(Math.random() * SEED_WORDS.length);
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${SEED_WORDS[r()]}-${SEED_WORDS[r()]}-${n}`;
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Picks n distinct items (no repeats) from arr, order randomized. */
export function pickN<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export function weightedPick<T>(rng: Rng, items: readonly { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const item of items) {
    if (r < item.weight) return item.value;
    r -= item.weight;
  }
  return items[items.length - 1].value;
}

export function intBetween(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}
