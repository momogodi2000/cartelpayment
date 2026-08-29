// ============================================================
// animals.ts — unified catalogue: dogs + cats
// ============================================================

import dogsData, { type Dog, type AnimalSpecies } from './dogs';
import catsData from './cats';

export type { Dog, AnimalSpecies };
export type Animal = Dog;

/** Every listing, species normalised (legacy dog entries have no `species`). */
export const animals: Animal[] = [
  ...dogsData.map((d) => ({ ...d, species: 'dog' as const })),
  ...catsData.map((c) => ({ ...c, species: 'cat' as const })),
];

export const dogs: Animal[] = animals.filter((a) => a.species === 'dog');
export const cats: Animal[] = animals.filter((a) => a.species === 'cat');

export function getSpecies(a: Animal): AnimalSpecies {
  return a.species ?? 'dog';
}

export default animals;
