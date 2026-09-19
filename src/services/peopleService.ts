import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Person, PersonFormData, FilterOptions } from '../types';
import { INITIAL_PEOPLE } from '../data/initialPeople';

const LOCAL_STORAGE_KEY = 'person_card_collection_data';

// Helper to get local data when Supabase is unconfigured or offline
function getLocalPeople(): Person[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PEOPLE));
    return [...INITIAL_PEOPLE];
  }
  try {
    return JSON.parse(data) as Person[];
  } catch {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PEOPLE));
    return [...INITIAL_PEOPLE];
  }
}

function saveLocalPeople(people: Person[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(people));
}

/**
 * Upload a photo to Supabase Storage bucket 'person-photos'
 * Returns the public URL of the uploaded image
 */
export async function uploadPersonPhoto(file: File): Promise<string> {
  if (isSupabaseConfigured()) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'webp';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('person-photos')
      .upload(filePath, file, {
        contentType: file.type || 'image/webp',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('person-photos')
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
      throw new Error('Could not retrieve public URL for uploaded photo.');
    }

    return publicData.publicUrl;
  }

  // Fallback for local preview: Store as readable data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to process image preview locally'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Delete a photo from Supabase Storage if it belongs to 'person-photos'
 */
export async function deleteStoragePhoto(photoUrl: string): Promise<void> {
  if (!isSupabaseConfigured() || !photoUrl) return;

  try {
    if (photoUrl.includes('/person-photos/')) {
      const fileName = photoUrl.split('/person-photos/').pop();
      if (fileName) {
        await supabase.storage.from('person-photos').remove([fileName]);
      }
    }
  } catch (err) {
    console.warn('Could not remove photo from storage:', err);
  }
}

/**
 * Fetch people with search, filtering, and sorting
 */
export async function fetchPeople(filterOptions?: FilterOptions): Promise<Person[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('people').select('*');

      // Search by name
      if (filterOptions?.searchQuery && filterOptions.searchQuery.trim().length > 0) {
        query = query.ilike('name', `%${filterOptions.searchQuery.trim()}%`);
      }

      // Age range filter
      if (filterOptions?.minAge !== undefined && filterOptions.minAge !== null) {
        query = query.gte('age', filterOptions.minAge);
      }
      if (filterOptions?.maxAge !== undefined && filterOptions.maxAge !== null) {
        query = query.lte('age', filterOptions.maxAge);
      }

      // Sorting
      switch (filterOptions?.sortBy) {
        case 'alpha-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'alpha-desc':
          query = query.order('name', { ascending: false });
          break;
        case 'age-asc':
          query = query.order('age', { ascending: true });
          break;
        case 'age-desc':
          query = query.order('age', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase fetchPeople error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // If database is completely empty upon initial setup, return empty or handle gracefully
      return (data as Person[]) || [];
    } catch (err: unknown) {
      console.warn('Falling back to local storage data due to error:', err);
      // Fallback
    }
  }

  // Fallback / Demo data processing
  let items = getLocalPeople();

  if (filterOptions?.searchQuery && filterOptions.searchQuery.trim().length > 0) {
    const q = filterOptions.searchQuery.trim().toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }

  if (filterOptions?.minAge !== undefined && filterOptions.minAge !== null) {
    items = items.filter((p) => p.age >= filterOptions.minAge!);
  }
  if (filterOptions?.maxAge !== undefined && filterOptions.maxAge !== null) {
    items = items.filter((p) => p.age <= filterOptions.maxAge!);
  }

  // Sort
  items.sort((a, b) => {
    switch (filterOptions?.sortBy) {
      case 'alpha-asc':
        return a.name.localeCompare(b.name);
      case 'alpha-desc':
        return b.name.localeCompare(a.name);
      case 'age-asc':
        return a.age - b.age;
      case 'age-desc':
        return b.age - a.age;
      case 'oldest':
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      case 'newest':
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  return items;
}

/**
 * Get a person by ID
 */
export async function getPersonById(id: string): Promise<Person | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Person;
    } catch (err) {
      console.warn('Error fetching person by id from Supabase:', err);
    }
  }

  const people = getLocalPeople();
  return people.find((p) => p.id === id) || null;
}

/**
 * Create a new Person in the database
 */
export async function createPerson(formData: PersonFormData): Promise<Person> {
  let photoUrl = formData.photo_url;

  // Upload photo if a file is attached
  if (formData.photo_file) {
    photoUrl = await uploadPersonPhoto(formData.photo_file);
  }

  if (!photoUrl) {
    throw new Error('Photo is required to create a person card.');
  }

  const numericAge = parseInt(String(formData.age), 10);
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('people')
      .insert([
        {
          name: formData.name.trim(),
          age: numericAge,
          date_of_birth: formData.date_of_birth,
          photo_url: photoUrl,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase createPerson error:', error);
      throw new Error(`Failed to save person: ${error.message}`);
    }

    return data as Person;
  }

  // Local fallback
  const newPerson: Person = {
    id: `person-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: formData.name.trim(),
    age: numericAge,
    date_of_birth: formData.date_of_birth,
    photo_url: photoUrl,
    created_at: now,
    updated_at: now
  };

  const people = getLocalPeople();
  const updatedList = [newPerson, ...people];
  saveLocalPeople(updatedList);

  return newPerson;
}

/**
 * Update an existing Person
 */
export async function updatePerson(
  id: string,
  formData: Partial<PersonFormData>,
  oldPhotoUrl?: string
): Promise<Person> {
  let finalPhotoUrl = formData.photo_url || oldPhotoUrl || '';

  // If a new photo file is provided, upload it and clean up old photo if possible
  if (formData.photo_file) {
    finalPhotoUrl = await uploadPersonPhoto(formData.photo_file);
    if (oldPhotoUrl && oldPhotoUrl !== finalPhotoUrl) {
      await deleteStoragePhoto(oldPhotoUrl);
    }
  }

  const updates: Partial<Person> = {
    updated_at: new Date().toISOString()
  };

  if (formData.name) updates.name = formData.name.trim();
  if (formData.age !== undefined && formData.age !== '') {
    updates.age = parseInt(String(formData.age), 10);
  }
  if (formData.date_of_birth) updates.date_of_birth = formData.date_of_birth;
  if (finalPhotoUrl) updates.photo_url = finalPhotoUrl;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('people')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updatePerson error:', error);
      throw new Error(`Failed to update person: ${error.message}`);
    }

    return data as Person;
  }

  // Local fallback
  const people = getLocalPeople();
  const index = people.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Person not found.');
  }

  const updatedPerson: Person = {
    ...people[index],
    ...updates
  };

  people[index] = updatedPerson;
  saveLocalPeople(people);

  return updatedPerson;
}

/**
 * Delete a Person and their associated photo from storage
 */
export async function deletePerson(id: string, photoUrl?: string): Promise<void> {
  if (isSupabaseConfigured()) {
    // 1. Delete from database
    const { error } = await supabase.from('people').delete().eq('id', id);

    if (error) {
      console.error('Supabase deletePerson error:', error);
      throw new Error(`Failed to delete person: ${error.message}`);
    }

    // 2. Remove photo from storage if stored there
    if (photoUrl) {
      await deleteStoragePhoto(photoUrl);
    }
    return;
  }

  // Local fallback
  const people = getLocalPeople();
  const filtered = people.filter((p) => p.id !== id);
  saveLocalPeople(filtered);
}
