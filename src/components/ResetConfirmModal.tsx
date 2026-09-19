import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#EDE8E1] animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          aria-label="Cancel reset"
          className="absolute top-4 right-4 text-[#8C847B] hover:text-[#1F2421] p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 id="reset-confirm-title" className="text-lg font-bold text-[#1F2421]">
              Reset Sample Data?
            </h3>
            <p className="text-xs text-[#706A62]">
              Restore the original fictional sample cards.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#6B655E] mb-5 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE4DC]">
          This will replace your current collection with the default sample cards. Any cards you created will be removed from your browser storage.
        </p>

        <div className="flex items-center justify-end space-x-2.5">
          <button
            type="button"
            id="cancel-reset-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#423E39] hover:bg-[#F2EDE6] rounded-xl border border-[#D5CDC4] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="confirm-reset-btn"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1F2421] hover:bg-[#000000] rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Sample Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
