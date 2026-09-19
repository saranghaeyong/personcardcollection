import { Person, PersonFormData, FilterOptions } from '../types';
import {
  getStoredPeople,
  addPerson as addPersonToStorage,
  updatePerson as updatePersonInStorage,
  deletePerson as deletePersonFromStorage,
  resetToSamplePeople,
  savePeople
} from './localStorageService';

/**
 * Fetch people collection from browser localStorage.
 * Automatically applies search queries and filters.
 */
export async function fetchPeople(filters?: FilterOptions): Promise<Person[]> {
  const people = getStoredPeople();

  if (!filters) {
    return people;
  }

  let filtered = [...people];

  // 1. Search Query: matches name, age, or date of birth
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    filtered = filtered.filter((person) => {
      const matchName = person.name.toLowerCase().includes(q);
      const matchAge = person.age.toString() === q || person.age.toString().includes(q);
      const dob = person.dateOfBirth || person.date_of_birth || '';
      const matchDOB = dob.toLowerCase().includes(q);
      return matchName || matchAge || matchDOB;
    });
  }

  // 2. Age Range filter
  if (filters.minAge !== null && filters.minAge !== undefined) {
    filtered = filtered.filter((p) => p.age >= (filters.minAge as number));
  }
  if (filters.maxAge !== null && filters.maxAge !== undefined) {
    filtered = filtered.filter((p) => p.age <= (filters.maxAge as number));
  }

  // 3. Sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'alpha-asc':
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        case 'alpha-desc':
          return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
        case 'age-asc':
          return a.age - b.age;
        case 'age-desc':
          return b.age - a.age;
        case 'oldest': {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateA - dateB;
        }
        case 'newest':
        default: {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        }
      }
    });
  }

  return filtered;
}

/**
 * Create a new person card and save to localStorage.
 */
export async function createPerson(formData: PersonFormData): Promise<Person> {
  const ageNumber = typeof formData.age === 'number' ? formData.age : parseInt(formData.age, 10) || 0;
  const dob = formData.dateOfBirth;
  const image = formData.image;

  const result = addPersonToStorage({
    name: formData.name,
    age: ageNumber,
    dateOfBirth: dob,
    image
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result.person;
}

/**
 * Update an existing person card.
 */
export async function updatePerson(id: string, formData: PersonFormData): Promise<Person> {
  const ageNumber = typeof formData.age === 'number' ? formData.age : parseInt(formData.age, 10) || 0;

  const result = updatePersonInStorage(id, {
    name: formData.name,
    age: ageNumber,
    dateOfBirth: formData.dateOfBirth,
    image: formData.image
  });

  if (result.error || !result.person) {
    throw new Error(result.error || 'Failed to update person');
  }

  return result.person;
}

/**
 * Delete a person card.
 */
export async function deletePerson(id: string): Promise<void> {
  deletePersonFromStorage(id);
}

/**
 * Reset collection to default sample cards.
 */
export async function resetDatabaseToDefaults(): Promise<{ count: number }> {
  const restored = resetToSamplePeople();
  return { count: restored.length };
}

export { resetToSamplePeople };
