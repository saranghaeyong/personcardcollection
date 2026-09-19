import React, { useEffect } from 'react';
import { Person } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (person: Person) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  person,
  isOpen,
  onClose,
  onConfirm
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !person) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#EDE8E1] animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          aria-label="Cancel deletion"
          className="absolute top-4 right-4 text-[#8C847B] hover:text-[#1F2421] p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 id="delete-confirm-title" className="text-lg font-bold text-[#1F2421]">
              Delete Person Card?
            </h3>
            <p className="text-xs text-[#706A62]">
              This action will remove the card from your browser storage.
            </p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-xl p-3.5 mb-5 flex items-center space-x-3">
          <div className="w-10 h-12 rounded-lg bg-[#E2DBD1] overflow-hidden shrink-0">
            {(person.image || person.photo_url) ? (
              <img
                src={person.image || person.photo_url}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#DCD4C8]" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-[#1F2421] truncate uppercase">{person.name}</p>
            <p className="text-xs text-[#706A62]">Age {person.age}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2.5">
          <button
            type="button"
            id="cancel-delete-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#423E39] hover:bg-[#F2EDE6] rounded-xl border border-[#D5CDC4] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="confirm-delete-btn"
            onClick={() => onConfirm(person)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
