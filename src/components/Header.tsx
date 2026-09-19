import React from 'react';
import { Users, PlusCircle, RotateCcw, ShieldCheck, Search } from 'lucide-react';

interface HeaderProps {
  currentView: 'collection' | 'add-person';
  onNavigate: (view: 'collection' | 'add-person') => void;
  onOpenResetModal: () => void;
  onFocusSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenResetModal,
  onFocusSearch
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE4DC] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('collection')}
            className="cursor-pointer group flex flex-col justify-center"
            id="brand-header-link"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F2421] group-hover:scale-125 transition-transform duration-300" />
              <h1 className="text-lg sm:text-xl font-bold tracking-wider text-[#1F2421] uppercase">
                Person Card Collection
              </h1>
            </div>
            <p className="text-xs text-[#7A746E] pl-4 font-normal hidden sm:block">
              A simple and elegant collection of people.
            </p>
          </div>

          {/* Navigation & Actions */}
          <nav className="flex items-center space-x-1.5 sm:space-x-2.5" aria-label="Main Navigation">
            {/* Collection */}
            <button
              id="nav-collection-btn"
              onClick={() => onNavigate('collection')}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors duration-150 flex items-center space-x-1.5 ${
                currentView === 'collection'
                  ? 'bg-[#EAE4DC] text-[#1F2421]'
                  : 'text-[#5C5650] hover:text-[#1F2421] hover:bg-[#F2ECE4]'
              }`}
            >
              <Users className="w-4 h-4 text-[#7A746E]" />
              <span className="hidden sm:inline">Collection</span>
            </button>

            {/* Search (Focus search on collection view) */}
            <button
              id="nav-search-btn"
              onClick={() => {
                if (currentView !== 'collection') {
                  onNavigate('collection');
                  setTimeout(() => onFocusSearch?.(), 100);
                } else {
                  onFocusSearch?.();
                }
              }}
              className="px-3 py-2 text-sm font-medium rounded-xl text-[#5C5650] hover:text-[#1F2421] hover:bg-[#F2ECE4] transition-colors duration-150 flex items-center space-x-1.5"
              aria-label="Search Collection"
            >
              <Search className="w-4 h-4 text-[#7A746E]" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Add Person */}
            <button
              id="nav-add-btn"
              onClick={() => onNavigate('add-person')}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors duration-150 flex items-center space-x-1.5 ${
                currentView === 'add-person'
                  ? 'bg-[#1F2421] text-white shadow-xs'
                  : 'bg-[#EAE4DC]/80 text-[#1F2421] hover:bg-[#E0D8CE]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Person</span>
            </button>

            {/* Reset Sample Data Button */}
            <button
              id="nav-reset-sample-btn"
              onClick={onOpenResetModal}
              title="Reset sample data back to initial cards"
              className="px-2.5 py-2 text-xs font-medium rounded-xl text-[#706A62] hover:text-[#1F2421] hover:bg-[#F2ECE4] transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Sample Data</span>
            </button>

            {/* Privacy indicator badge */}
            <div
              id="local-storage-indicator"
              title="Your cards are stored locally in this browser. No external server or database used."
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#F4EFEB] border border-[#E5DFD6] text-xs text-[#529E72] font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#529E72]" />
              <span className="text-[11px] text-[#423E39]">Local Storage</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
