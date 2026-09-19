import { Person } from '../types';
import { SAMPLE_PEOPLE } from '../data/initialPeople';

export const STORAGE_KEY = 'person-card-collection';

/**
 * Check if an error is a browser QuotaExceededError
 */
export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: string; code?: number; number?: number };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014 ||
    e.number === -2147024882
  );
}

/**
 * Normalizes a stored item to ensure required fields (id, name, age, dateOfBirth, image, createdAt)
 */
function normalizePerson(item: any): Person {
  const dateOfBirth = item.dateOfBirth || item.date_of_birth || '';
  const image = item.image || item.photo_url || '';
  const createdAt = item.createdAt || item.created_at || new Date().toISOString();

  return {
    id: item.id || `person-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: item.name || 'Unnamed Person',
    age: typeof item.age === 'number' ? item.age : parseInt(item.age, 10) || 0,
    dateOfBirth,
    image,
    createdAt,
    // Aliases for compatibility
    date_of_birth: dateOfBirth,
    photo_url: image,
    created_at: createdAt
  };
}

/**
 * Get all people from localStorage.
 * If empty on first visit, populates with built-in sample cards.
 */
export function getStoredPeople(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit: initialize with built-in sample cards
      savePeople(SAMPLE_PEOPLE);
      return SAMPLE_PEOPLE;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizePerson);
    }

    // If array was empty or invalid, return empty or fallback
    return Array.isArray(parsed) ? [] : SAMPLE_PEOPLE;
  } catch (err) {
    console.warn('Error reading person cards from localStorage:', err);
    return SAMPLE_PEOPLE;
  }
}

/**
 * Persist people collection into localStorage.
 * Gracefully handles localStorage quota limits.
 */
export function savePeople(people: Person[]): { success: boolean; error?: string } {
  try {
    const normalized = people.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      dateOfBirth: p.dateOfBirth || p.date_of_birth,
      image: p.image || p.photo_url,
      createdAt: p.createdAt || p.created_at || new Date().toISOString()
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return { success: true };
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    if (isQuotaExceededError(err)) {
      return {
        success: false,
        error: 'Browser storage limit reached. Please delete some existing cards to free up space.'
      };
    }
    return {
      success: false,
      error: 'Could not save card to browser storage. Please try again.'
    };
  }
}

/**
 * Add a new person card immediately to localStorage.
 */
export function addPerson(data: {
  name: string;
  age: number;
  dateOfBirth: string;
  image: string;
}): { person: Person; error?: string } {
  const newPerson: Person = {
    id: `person-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: data.name.trim(),
    age: data.age,
    dateOfBirth: data.dateOfBirth,
    image: data.image,
    createdAt: new Date().toISOString(),
    date_of_birth: data.dateOfBirth,
    photo_url: data.image,
    created_at: new Date().toISOString()
  };

  const currentPeople = getStoredPeople();
  const updated = [newPerson, ...currentPeople];

  const saveResult = savePeople(updated);
  if (!saveResult.success) {
    return { person: newPerson, error: saveResult.error };
  }

  return { person: newPerson };
}

/**
 * Update an existing person card.
 */
export function updatePerson(
  id: string,
  updates: Partial<Omit<Person, 'id' | 'createdAt'>>
): { person?: Person; error?: string } {
  const currentPeople = getStoredPeople();
  const index = currentPeople.findIndex((p) => p.id === id);

  if (index === -1) {
    return { error: 'Person card not found.' };
  }

  const existing = currentPeople[index];
  const updatedPerson: Person = {
    ...existing,
    ...updates,
    date_of_birth: updates.dateOfBirth || existing.dateOfBirth,
    photo_url: updates.image || existing.image
  };

  currentPeople[index] = updatedPerson;
  const saveResult = savePeople(currentPeople);

  if (!saveResult.success) {
    return { error: saveResult.error };
  }

  return { person: updatedPerson };
}

/**
 * Delete a person card from localStorage.
 */
export function deletePerson(id: string): Person[] {
  const current = getStoredPeople();
  const filtered = current.filter((p) => p.id !== id);
  savePeople(filtered);
  return filtered;
}

/**
 * Reset localStorage to the original built-in sample cards.
 */
export function resetToSamplePeople(): Person[] {
  savePeople(SAMPLE_PEOPLE);
  return SAMPLE_PEOPLE;
}
