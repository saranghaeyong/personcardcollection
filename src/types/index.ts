export interface Person {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string; // YYYY-MM-DD
  image: string; // Base64 Data URL or image URL
  createdAt: string; // ISO timestamp string

  // Compatibility aliases
  date_of_birth?: string;
  photo_url?: string;
  created_at?: string;
}

export interface PersonFormData {
  name: string;
  age: number | string;
  dateOfBirth: string;
  image: string;
}

export type SortOption = 'newest' | 'oldest' | 'alpha-asc' | 'alpha-desc' | 'age-asc' | 'age-desc';

export interface FilterOptions {
  searchQuery: string;
  sortBy: SortOption;
  minAge?: number | null;
  maxAge?: number | null;
}

export interface ValidationErrors {
  name?: string;
  age?: string;
  dateOfBirth?: string;
  image?: string;
  general?: string;
}
