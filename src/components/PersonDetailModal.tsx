import React, { useEffect } from 'react';
import { Person, AdminUser } from '../types';
import { formatDisplayDate } from '../utils/dateAndAge';
import { ArrowLeft, Edit3, Trash2, Calendar, User, X } from 'lucide-react';

interface PersonDetailModalProps {
  person: Person | null;
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  adminUser: AdminUser | null;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  onClose,
  onEdit,
  onDelete,
  adminUser
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && person) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [person, onClose]);

  if (!person) return null;

  const formattedDOB = formatDisplayDate(person.date_of_birth);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="person-detail-name"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#EDE8E1] my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/80 hover:bg-white text-[#2D2A26] rounded-full backdrop-blur-md flex items-center justify-center shadow-xs transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className="flex flex-col md:flex-row">
          {/* Large Photo Section (4:5 Portrait) */}
          <div className="md:w-1/2 bg-[#F4EFEB] relative overflow-hidden aspect-[4/5] md:aspect-auto">
            <img
              src={person.photo_url}
              alt={`Photo of ${person.name}`}
              className="w-full h-full object-cover min-h-[300px] md:min-h-[440px]"
            />
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Back Link */}
              <button
                type="button"
                id="modal-back-btn"
                onClick={onClose}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-[#706A62] hover:text-[#1F2421] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Collection</span>
              </button>

              {/* Person Name */}
              <div>
                <span className="text-[11px] font-semibold text-[#8C847B] uppercase tracking-wider">
                  Person Profile
                </span>
                <h2
                  id="person-detail-name"
                  className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-[#1F2421] mt-0.5"
                >
                  {person.name}
                </h2>
              </div>

              {/* Data List */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EAE4DC] space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-[#EAE4DC]/60">
                  <div className="flex items-center space-x-2 text-sm text-[#706A62]">
                    <User className="w-4 h-4 text-[#8C847B]" />
                    <span className="font-medium">Age</span>
                  </div>
                  <span className="text-base font-bold text-[#1F2421]">{person.age}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2 text-sm text-[#706A62]">
                    <Calendar className="w-4 h-4 text-[#8C847B]" />
                    <span className="font-medium">Date of Birth</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1F2421] text-right">{formattedDOB}</span>
                </div>
              </div>

              {/* Meta / Date added if present */}
              {person.created_at && (
                <p className="text-[11px] text-[#A39B92]">
                  Added: {new Date(person.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Action Buttons: Back, Edit, Delete */}
            <div className="pt-4 border-t border-[#EAE4DC] flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                id="person-detail-back-action-btn"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#D5CDC4] text-xs font-semibold text-[#423E39] hover:bg-[#F4EFEB] transition-colors"
              >
                Back
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="person-detail-edit-btn"
                  onClick={() => onEdit(person)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5CDC4] hover:bg-[#EAE4DC] text-xs font-semibold text-[#1F2421] transition-colors flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  id="person-detail-delete-btn"
                  onClick={() => onDelete(person)}
                  className="px-4 py-2.5 rounded-xl bg-[#FEE2E2]/70 hover:bg-[#FEE2E2] text-xs font-semibold text-[#B91C1C] transition-colors flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
