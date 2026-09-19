import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Person, PersonFormData, FilterOptions } from './types';
import { fetchPeople, createPerson, updatePerson, deletePerson, resetToSamplePeople } from './services/peopleService';
import { Header } from './components/Header';
import { CollectionPage } from './pages/CollectionPage';
import { AddEditPersonPage } from './pages/AddEditPersonPage';
import { PersonDetailModal } from './components/PersonDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { ShieldCheck, RotateCcw } from 'lucide-react';

export default function App() {
  // Current view state
  const [currentView, setCurrentView] = useState<'collection' | 'add-person'>('collection');

  // People collection state
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    sortBy: 'newest',
    minAge: null,
    maxAge: null
  });

  // Modal states
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load people from localStorage with applied filters
  const loadPeople = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPeople(filters);
      setPeople(data);
    } catch (err) {
      console.warn('Notice loading people from local storage:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  // Handle URL sync
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/add-person') {
        setCurrentView('add-person');
      } else {
        setCurrentView('collection');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (view: 'collection' | 'add-person') => {
    setCurrentView(view);
    const targetPath = view === 'add-person' ? '/add-person' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Person (Create or Update)
  const handleSavePerson = async (formData: PersonFormData, id?: string) => {
    try {
      if (id) {
        await updatePerson(id, formData);
        showToast('Person card updated successfully.');
      } else {
        await createPerson(formData);
        showToast('Person card created and added to collection.');
      }
      setPersonToEdit(null);
      await loadPeople();
      navigateTo('collection');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save person card.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Delete Person Flow
  const handleConfirmDelete = async (person: Person) => {
    try {
      await deletePerson(person.id);
      showToast(`Deleted card for ${person.name}.`);
      setPersonToDelete(null);
      if (selectedPerson?.id === person.id) {
        setSelectedPerson(null);
      }
      await loadPeople();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete person.';
      showToast(msg, 'error');
    }
  };

  // Reset to sample fictional cards
  const handleResetSampleData = async () => {
    try {
      const restored = resetToSamplePeople();
      setIsResetModalOpen(false);
      setSelectedPerson(null);
      setPersonToEdit(null);
      await loadPeople();
      showToast(`Sample cards restored (${restored.length} cards).`);
    } catch (err) {
      console.warn('Error resetting sample data:', err);
      showToast('Failed to reset sample data.', 'error');
    }
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
        onOpenResetModal={() => setIsResetModalOpen(true)}
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

      {/* Main View Switcher */}
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
            onDeletePerson={(person) => setPersonToDelete(person)}
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
            onSave={handleSavePerson}
            onCancel={() => {
              setPersonToEdit(null);
              navigateTo('collection');
            }}
          />
        )}
      </div>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
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
      <DeleteConfirmModal
        person={personToDelete}
        isOpen={!!personToDelete}
        onClose={() => setPersonToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Reset Sample Data Confirmation Dialog */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetSampleData}
      />

      {/* Privacy Architecture Footer */}
      <footer className="mt-auto border-t border-[#EAE4DC] py-8 bg-[#F4EFEB]/60 text-center text-xs text-[#8C847B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-[#529E72] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#529E72]" />
            <span className="text-[#423E39]">
              Your cards are stored locally in this browser. No external database or server required.
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              id="footer-reset-sample-btn"
              onClick={() => setIsResetModalOpen(true)}
              className="text-[#706A62] hover:text-[#1F2421] transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
            <span>•</span>
            <p>© {new Date().getFullYear()} Person Card Collection</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
