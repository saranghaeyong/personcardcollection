import React, { useState, useMemo } from 'react';
import { Person, AdminUser } from '../types';
import { formatDisplayDate } from '../utils/dateAndAge';
import {
  Users,
  Clock,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  LogOut,
  Calendar,
  Layers
} from 'lucide-react';

interface AdminDashboardPageProps {
  adminUser: AdminUser;
  people: Person[];
  onAddPerson: () => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (person: Person) => void;
  onViewPerson: (person: Person) => void;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  adminUser,
  people,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  onViewPerson,
  onLogout
}) => {
  const [adminSearch, setAdminSearch] = useState('');

  // Filter people list for the management table
  const filteredPeople = useMemo(() => {
    if (!adminSearch.trim()) return people;
    const q = adminSearch.trim().toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.age).includes(q) ||
        p.date_of_birth.includes(q)
    );
  }, [people, adminSearch]);

  // Metrics
  const totalCount = people.length;
  const recentCount = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return people.filter((p) => new Date(p.created_at || 0).getTime() > oneWeekAgo).length;
  }, [people]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE4DC]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EAE4DC] text-[#2D2A26]">
              Admin Workspace
            </span>
            <span className="text-xs text-[#7A746E]">
              Signed in as <strong className="text-[#1F2421]">{adminUser.email}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1F2421] font-display mt-1">
            Collection Management
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            id="admin-add-person-btn"
            onClick={onAddPerson}
            className="px-5 py-2.5 bg-[#1F2421] hover:bg-[#333A36] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Person</span>
          </button>

          <button
            type="button"
            id="admin-logout-btn"
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl border border-[#D5CDC4] text-sm font-semibold text-[#5C5650] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/40 transition-colors flex items-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total People */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8E1] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#F4EFEB] flex items-center justify-center text-[#1F2421] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C847B]">
              Total People
            </p>
            <p className="text-2xl font-extrabold text-[#1F2421] mt-0.5">
              {totalCount}
            </p>
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8E1] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#059669] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C847B]">
              Recently Added (7d)
            </p>
            <p className="text-2xl font-extrabold text-[#1F2421] mt-0.5">
              {recentCount}
            </p>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8E1] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-[#B45309] shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C847B]">
              Collection Status
            </p>
            <p className="text-base font-bold text-[#1F2421] mt-0.5">
              Live & Synced
            </p>
          </div>
        </div>
      </div>

      {/* People Management Section */}
      <div className="bg-white rounded-3xl border border-[#EDE8E1] shadow-sm overflow-hidden space-y-4">
        {/* Table Controls */}
        <div className="p-5 sm:p-6 border-b border-[#EAE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1F2421]">Manage Collection</h3>
            <p className="text-xs text-[#706A62]">
              Edit records, update portraits, or remove person cards.
            </p>
          </div>

          {/* Search within Admin */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C847B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="Filter people..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] text-xs sm:text-sm text-[#1F2421] rounded-xl border border-[#D5CDC4] focus:outline-none focus:border-[#1F2421] focus:ring-1 focus:ring-[#1F2421]"
            />
          </div>
        </div>

        {/* Table / List View */}
        {filteredPeople.length === 0 ? (
          <div className="p-12 text-center text-[#8C847B] space-y-2">
            <p className="font-semibold text-[#423E39]">No people found.</p>
            <p className="text-xs text-[#706A62]">
              {adminSearch ? 'Try a different search term.' : 'Start by adding a new person.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE4DC] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#706A62]">
                  <th className="py-3.5 px-4 sm:px-6">Person</th>
                  <th className="py-3.5 px-4">Age</th>
                  <th className="py-3.5 px-4">Date of Birth</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4DC] text-sm">
                {filteredPeople.map((person) => {
                  const formattedDOB = formatDisplayDate(person.date_of_birth);
                  return (
                    <tr
                      key={person.id}
                      className="hover:bg-[#FAF8F5]/80 transition-colors group"
                    >
                      {/* Photo & Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-11 h-14 rounded-lg overflow-hidden bg-[#E2DBD1] shrink-0 shadow-2xs">
                            <img
                              src={person.photo_url}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#1F2421] uppercase tracking-wide text-xs sm:text-sm">
                              {person.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => onViewPerson(person)}
                              className="text-[11px] text-[#706A62] hover:text-[#1F2421] flex items-center space-x-1 mt-0.5"
                            >
                              <span>View Card</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="py-3.5 px-4 font-semibold text-[#2D2A26]">
                        {person.age}
                      </td>

                      {/* DOB */}
                      <td className="py-3.5 px-4 text-[#5C5650] text-xs">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#9E968D]" />
                          <span>{formattedDOB}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          <button
                            type="button"
                            onClick={() => onEditPerson(person)}
                            className="p-2 rounded-lg text-[#5C5650] hover:text-[#1F2421] hover:bg-[#EAE4DC] transition-colors"
                            title="Edit Person"
                            aria-label={`Edit ${person.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeletePerson(person)}
                            className="p-2 rounded-lg text-[#8C847B] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/60 transition-colors"
                            title="Delete Person"
                            aria-label={`Delete ${person.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
