import React from 'react';
import { Person, FilterOptions } from '../types';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { PersonGrid } from '../components/PersonGrid';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

interface CollectionPageProps {
  people: Person[];
  loading: boolean;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  onCardClick: (person: Person) => void;
  onAddPersonClick: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  people,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onCardClick,
  onAddPersonClick,
  searchInputRef
}) => {
  return (
    <div className="w-full pb-20">
      {/* Hero Section */}
      <section className="pt-8 pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[#1F2421] font-display">
          Person Card Collection
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#6B655E] max-w-xl mx-auto">
          Organize and explore your people collection.
        </p>

        {/* Prominent Search Bar */}
        <div className="mt-8">
          <SearchBar
            inputRef={searchInputRef}
            value={filters.searchQuery}
            onChange={(val) => onFilterChange({ ...filters, searchQuery: val })}
            totalCount={people.length}
            filteredCount={people.length}
          />
        </div>
      </section>

      {/* Main Collection Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filters & Sorting */}
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          onReset={onResetFilters}
        />

        {/* Content States: Loading, Empty, or Grid */}
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : people.length === 0 ? (
          <EmptyState
            isSearch={!!filters.searchQuery.trim() || filters.minAge !== null || filters.maxAge !== null}
            onAddPerson={onAddPersonClick}
            onResetSearch={onResetFilters}
          />
        ) : (
          <PersonGrid
            people={people}
            onCardClick={onCardClick}
          />
        )}
      </main>
    </div>
  );
};
