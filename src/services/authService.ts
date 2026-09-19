import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminUser } from '../types';

const LOCAL_ADMIN_KEY = 'person_card_admin_session';

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
}

export async function signInAdmin(email: string, password: string): Promise<{ user: AdminUser | null; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email
          }
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      return { user: null, error: message };
    }
  }

  // Preview / Demo fallback when Supabase is not yet configured
  if (!email || !password) {
    return { user: null, error: 'Please enter both email and password.' };
  }

  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters long.' };
  }

  const demoUser: AdminUser = {
    id: 'demo-admin-id',
    email: email.trim().toLowerCase()
  };

  localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(demoUser));
  return { user: demoUser };
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error during Supabase signOut:', err);
    }
  }
  localStorage.removeItem(LOCAL_ADMIN_KEY);
}

export async function getInitialAdminSession(): Promise<AdminUser | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        return {
          id: data.session.user.id,
          email: data.session.user.email || ''
        };
      }
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
    }
  }

  // Check local demo session
  const stored = localStorage.getItem(LOCAL_ADMIN_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as AdminUser;
    } catch {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
    }
  }

  return null;
}
