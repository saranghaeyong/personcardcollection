import React from 'react';
import { Users, PlusCircle, ShieldCheck, Database, Search, LogOut } from 'lucide-react';
import { AdminUser } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  currentView: 'collection' | 'add-person' | 'admin' | 'admin-login';
  onNavigate: (view: 'collection' | 'add-person' | 'admin' | 'admin-login') => void;
  adminUser: AdminUser | null;
  onLogout: () => void;
  onOpenSetupModal: () => void;
  onFocusSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  adminUser,
  onLogout,
  onOpenSetupModal,
  onFocusSearch,
}) => {
  const isConnected = isSupabaseConfigured();

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

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Main Navigation">
            {/* Collection */}
            <button
              id="nav-collection-btn"
              onClick={() => onNavigate('collection')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex items-center space-x-1.5 ${
                currentView === 'collection'
                  ? 'bg-[#EAE4DC] text-[#1F2421]'
                  : 'text-[#5C5650] hover:text-[#1F2421] hover:bg-[#F2ECE4]'
              }`}
            >
              <Users className="w-4 h-4 text-[#7A746E]" />
              <span className="hidden sm:inline">Collection</span>
            </button>

            {/* Search (Scrolls / focuses search on Home) */}
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
              className="px-3 py-2 text-sm font-medium rounded-lg text-[#5C5650] hover:text-[#1F2421] hover:bg-[#F2ECE4] transition-colors duration-150 flex items-center space-x-1.5"
              aria-label="Search Collection"
            >
              <Search className="w-4 h-4 text-[#7A746E]" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Add Person */}
            <button
              id="nav-add-btn"
              onClick={() => {
                if (adminUser) {
                  onNavigate('add-person');
                } else {
                  // Direct to add-person view (which will prompt login if admin restricted)
                  onNavigate('add-person');
                }
              }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex items-center space-x-1.5 ${
                currentView === 'add-person'
                  ? 'bg-[#EAE4DC] text-[#1F2421]'
                  : 'text-[#5C5650] hover:text-[#1F2421] hover:bg-[#F2ECE4]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#7A746E]" />
              <span className="hidden sm:inline">Add Person</span>
            </button>

            {/* Admin Area */}
            {adminUser ? (
              <div className="flex items-center space-x-1">
                <button
                  id="nav-admin-dashboard-btn"
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex items-center space-x-1.5 ${
                    currentView === 'admin'
                      ? 'bg-[#1F2421] text-white'
                      : 'bg-[#EAE4DC]/80 text-[#1F2421] hover:bg-[#E0D8CE]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#529E72]" />
                  <span className="hidden md:inline">Admin</span>
                </button>
                <button
                  id="nav-admin-logout-btn"
                  onClick={onLogout}
                  title="Log out of Admin"
                  aria-label="Log out of Administrator Account"
                  className="p-2 text-[#7A746E] hover:text-[#B91C1C] hover:bg-[#F2ECE4] rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-admin-login-btn"
                onClick={() => onNavigate('admin-login')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex items-center space-x-1.5 ${
                  currentView === 'admin-login'
                    ? 'bg-[#EAE4DC] text-[#1F2421]'
                    : 'text-[#5C5650] hover:text-[#1F2421] hover:bg-[#F2ECE4]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#7A746E]" />
                <span>Admin</span>
              </button>
            )}

            {/* Database / Supabase indicator badge */}
            <button
              id="supabase-status-pill"
              onClick={onOpenSetupModal}
              title={isConnected ? 'Connected to Supabase' : 'Running in Local Mode - Click for Supabase Setup'}
              className="ml-1 px-2.5 py-1 text-xs rounded-full border flex items-center space-x-1.5 transition-all duration-150 hover:shadow-xs focus:outline-none"
              style={{
                backgroundColor: isConnected ? '#ECFDF5' : '#F7F5F0',
                borderColor: isConnected ? '#A7F3D0' : '#E2DCD5',
                color: isConnected ? '#065F46' : '#706A62'
              }}
            >
              <Database className={`w-3 h-3 ${isConnected ? 'text-[#059669]' : 'text-[#8A847C]'}`} />
              <span className="hidden lg:inline text-[11px] font-medium">
                {isConnected ? 'Supabase Live' : 'Database Setup'}
              </span>
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};
