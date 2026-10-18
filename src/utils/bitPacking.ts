/**
 * Minimal bit-level packer/unpacker used to squeeze the whole campaign
 * questionnaire (and theme) into a handful of bytes instead of ~17 separate
 * query-string params spelled out as full words. Written by hand rather than
 * reaching for a dependency — the format is tiny and fully owned here.
 */

export class BitWriter {
  private bytes: number[] = [];
  private current = 0;
  private bitsInCurrent = 0;

  writeBits(value: number, bitCount: number): void {
    for (let i = bitCount - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      this.current = (this.current << 1) | bit;
      this.bitsInCurrent++;
      if (this.bitsInCurrent === 8) {
        this.bytes.push(this.current);
        this.current = 0;
        this.bitsInCurrent = 0;
      }
    }
  }

  writeByte(value: number): void {
    this.writeBits(value & 0xff, 8);
  }

  writeBytes(bytes: Uint8Array): void {
    for (const b of bytes) this.writeByte(b);
  }

  finish(): Uint8Array {
    if (this.bitsInCurrent > 0) {
      this.current <<= 8 - this.bitsInCurrent;
      this.bytes.push(this.current);
      this.current = 0;
      this.bitsInCurrent = 0;
    }
    return new Uint8Array(this.bytes);
  }
}

export class BitReader {
  private pos = 0;
  private bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  readBits(bitCount: number): number {
    let value = 0;
    for (let i = 0; i < bitCount; i++) {
      const byteIndex = this.pos >>> 3;
      const bitIndex = 7 - (this.pos % 8);
      const byte = this.bytes[byteIndex] ?? 0;
      value = (value << 1) | ((byte >>> bitIndex) & 1);
      this.pos++;
    }
    return value >>> 0;
  }

  readByte(): number {
    return this.readBits(8);
  }

  readBytes(count: number): Uint8Array {
    const out = new Uint8Array(count);
    for (let i = 0; i < count; i++) out[i] = this.readByte();
    return out;
  }
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(token: string): Uint8Array {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function bitmaskFromSelection<T>(all: readonly T[], selected: readonly T[]): number {
  let mask = 0;
  all.forEach((item, i) => {
    if (selected.includes(item)) mask |= 1 << i;
  });
  return mask;
}

export function selectionFromBitmask<T>(all: readonly T[], mask: number): T[] {
  return all.filter((_, i) => (mask & (1 << i)) !== 0);
}

export function indexOrFallback<T>(all: readonly T[], value: T, fallbackIndex = 0): number {
  const i = all.indexOf(value);
  return i >= 0 ? i : fallbackIndex;
}

export function nearestIndex(all: readonly number[], value: number): number {
  let bestIndex = 0;
  let bestDiff = Infinity;
  all.forEach((candidate, i) => {
    const diff = Math.abs(candidate - value);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  });
  return bestIndex;
}
