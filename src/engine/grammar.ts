import type { Stakeholder } from './types';

/**
 * Gang names (built from GANG_NOUNS, e.g. "the Low-Tide Wolves") are the one
 * stakeholder category that's grammatically plural, like a sports team name
 * ("the Wolves need", "the Wolves are") rather than a singular entity
 * ("the Vultaire Family needs", "the Charter Authority is").
 */
export function isPluralStakeholder(stakeholder: Stakeholder | null): boolean {
  return stakeholder?.type === 'Street Gang';
}

/** Possessive of a name already ending in "s" (most gang names, some corp names) takes a bare apostrophe. */
export function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

export function agree(isPlural: boolean, singular: string, plural: string): string {
  return isPlural ? plural : singular;
}
