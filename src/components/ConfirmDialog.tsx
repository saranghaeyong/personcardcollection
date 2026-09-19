import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Delete Person',
  message = 'Are you sure you want to delete this person? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#EDE8E1] space-y-4"
      >
        <div className="flex items-start space-x-3.5">
          {isDestructive && (
            <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#B91C1C]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div className="space-y-1">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-[#1F2421]">
              {title}
            </h3>
            <p className="text-sm text-[#706A62] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            id="confirm-dialog-cancel-btn"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#4A453F] bg-[#F2EDE6] hover:bg-[#E5DFD6] rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            id="confirm-dialog-confirm-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 ${
              isDestructive
                ? 'bg-[#B91C1C] hover:bg-[#991B1B]'
                : 'bg-[#1F2421] hover:bg-[#333A36]'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
