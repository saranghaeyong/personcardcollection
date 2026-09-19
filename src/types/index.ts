export interface Person {
  id: string;
  name: string;
  age: number;
  date_of_birth: string; // YYYY-MM-DD format
  photo_url: string;
  created_at?: string;
  updated_at?: string;

  // Future-ready extensible architecture (not shown in current UI, but preserved in typing)
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  occupation?: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface PersonFormData {
  name: string;
  age: number | string;
  date_of_birth: string;
  photo_url: string;
  photo_file?: File | null;
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
  date_of_birth?: string;
  photo?: string;
  general?: string;
}

export interface AdminUser {
  id: string;
  email: string;
}
