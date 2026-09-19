import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Person, PersonFormData, FilterOptions, AdminUser } from './types';
import { fetchPeople, createPerson, updatePerson, deletePerson } from './services/peopleService';
import { getInitialAdminSession, signInAdmin, signOutAdmin } from './services/authService';
import { Header } from './components/Header';
import { CollectionPage } from './pages/CollectionPage';
import { AddEditPersonPage } from './pages/AddEditPersonPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PersonDetailModal } from './components/PersonDetailModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<'collection' | 'add-person' | 'admin' | 'admin-login'>('collection');
  
  // Data State
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Filter & Search State
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    sortBy: 'newest',
    minAge: null,
    maxAge: null
  });

  // Modal / Interaction States
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load Admin session
  useEffect(() => {
    getInitialAdminSession().then((user) => {
      setAdminUser(user);
    });
  }, []);

  // Fetch People
  const loadPeople = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPeople(filters);
      setPeople(data);
    } catch (err) {
      console.error('Failed to load people:', err);
      showToast('Error loading people collection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  // Handle URL sync on mount and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/add-person' || path === '/admin/add') {
        setCurrentView('add-person');
      } else if (path === '/admin/login') {
        setCurrentView('admin-login');
      } else if (path.startsWith('/admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('collection');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (view: 'collection' | 'add-person' | 'admin' | 'admin-login') => {
    setCurrentView(view);
    let targetPath = '/';
    if (view === 'add-person') targetPath = '/add-person';
    if (view === 'admin-login') targetPath = '/admin/login';
    if (view === 'admin') targetPath = '/admin';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Person (Add or Edit)
  const handleSavePerson = async (formData: PersonFormData, id?: string, oldPhotoUrl?: string) => {
    try {
      if (id) {
        await updatePerson(id, formData, oldPhotoUrl);
        showToast('Person updated successfully.');
      } else {
        await createPerson(formData);
        showToast('Person added successfully.');
      }
      setPersonToEdit(null);
      await loadPeople();
      navigateTo(adminUser ? 'admin' : 'collection');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save person.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Delete Person Flow
  const handleConfirmDelete = async () => {
    if (!personToDelete) return;
    setIsDeleting(true);
    try {
      await deletePerson(personToDelete.id, personToDelete.photo_url);
      showToast('Person deleted successfully.');
      setPersonToDelete(null);
      setSelectedPerson(null);
      await loadPeople();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete person.';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Admin Auth handlers
  const handleAdminLogin = async (email: string, pass: string) => {
    const result = await signInAdmin(email, pass);
    if (result.user) {
      setAdminUser(result.user);
      showToast(`Welcome, administrator!`);
      navigateTo('admin');
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const handleAdminLogout = async () => {
    await signOutAdmin();
    setAdminUser(null);
    showToast('Logged out of admin area.');
    navigateTo('collection');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F2421] selection:bg-[#EAE4DC] selection:text-[#1F2421]">
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'add-person') {
            setPersonToEdit(null);
          }
          navigateTo(view);
        }}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        onFocusSearch={() => {
          if (currentView !== 'collection') {
            navigateTo('collection');
          }
          setTimeout(() => {
            searchInputRef.current?.focus();
            searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
              : 'bg-[#1F2421] text-white border-[#333A36]'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* View Switcher */}
      <div className="flex-grow">
        {currentView === 'collection' && (
          <CollectionPage
            people={people}
            loading={loading}
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={() =>
              setFilters({
                searchQuery: '',
                sortBy: 'newest',
                minAge: null,
                maxAge: null
              })
            }
            onCardClick={(person) => setSelectedPerson(person)}
            onAddPersonClick={() => {
              setPersonToEdit(null);
              navigateTo('add-person');
            }}
            searchInputRef={searchInputRef}
          />
        )}

        {currentView === 'add-person' && (
          <AddEditPersonPage
            personToEdit={personToEdit}
            isAdmin={!!adminUser}
            onRequireAdmin={() => {
              showToast('Administrator privileges required to add or edit.', 'error');
              navigateTo('admin-login');
            }}
            onSave={handleSavePerson}
            onCancel={() => {
              setPersonToEdit(null);
              navigateTo(adminUser ? 'admin' : 'collection');
            }}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onLogin={handleAdminLogin}
            onCancel={() => navigateTo('collection')}
          />
        )}

        {currentView === 'admin' && (
          adminUser ? (
            <AdminDashboardPage
              adminUser={adminUser}
              people={people}
              onAddPerson={() => {
                setPersonToEdit(null);
                navigateTo('add-person');
              }}
              onEditPerson={(person) => {
                setPersonToEdit(person);
                navigateTo('add-person');
              }}
              onDeletePerson={(person) => setPersonToDelete(person)}
              onViewPerson={(person) => setSelectedPerson(person)}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminLoginPage
              onLogin={handleAdminLogin}
              onCancel={() => navigateTo('collection')}
            />
          )
        )}
      </div>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        adminUser={adminUser}
        onEdit={(person) => {
          setSelectedPerson(null);
          setPersonToEdit(person);
          navigateTo('add-person');
        }}
        onDelete={(person) => {
          setPersonToDelete(person);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!personToDelete}
        title="Delete Person Card"
        message={`Are you sure you want to delete ${personToDelete?.name}? This will remove their record from the database and delete their photo from storage.`}
        confirmLabel="Delete Person"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPersonToDelete(null)}
      />

      {/* Supabase Setup Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#EAE4DC] py-8 bg-[#F4EFEB]/60 text-center text-xs text-[#8C847B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Person Card Collection — Digital Personal Archive</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="text-[#706A62] hover:text-[#1F2421] transition-colors"
            >
              Supabase Configuration
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo(adminUser ? 'admin' : 'admin-login')}
              className="text-[#706A62] hover:text-[#1F2421] transition-colors"
            >
              {adminUser ? 'Admin Dashboard' : 'Admin Login'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
