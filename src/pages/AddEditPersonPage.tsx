import React, { useState, useEffect } from 'react';
import { Person, PersonFormData, ValidationErrors } from '../types';
import { validatePersonData, calculateAgeFromDOB } from '../utils/dateAndAge';
import { ImageUploader } from '../components/ImageUploader';
import { ArrowLeft, CheckCircle2, Sparkles, PlusCircle } from 'lucide-react';

interface AddEditPersonPageProps {
  personToEdit?: Person | null;
  onSave: (formData: PersonFormData, id?: string) => Promise<void>;
  onCancel: () => void;
}

export const AddEditPersonPage: React.FC<AddEditPersonPageProps> = ({
  personToEdit,
  onSave,
  onCancel
}) => {
  const isEdit = !!personToEdit;

  const [formData, setFormData] = useState<PersonFormData>({
    name: personToEdit?.name || '',
    age: personToEdit?.age !== undefined ? personToEdit.age : '',
    dateOfBirth: personToEdit?.dateOfBirth || personToEdit?.date_of_birth || '',
    image: personToEdit?.image || personToEdit?.photo_url || ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (personToEdit) {
      setFormData({
        name: personToEdit.name,
        age: personToEdit.age,
        dateOfBirth: personToEdit.dateOfBirth || personToEdit.date_of_birth || '',
        image: personToEdit.image || personToEdit.photo_url || ''
      });
    }
  }, [personToEdit]);

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDOB = e.target.value;
    const calculatedAge = newDOB ? calculateAgeFromDOB(newDOB) : '';

    setFormData((prev) => ({
      ...prev,
      dateOfBirth: newDOB,
      // If age was empty or matched previous auto-calc, update it
      age: calculatedAge !== '' ? calculatedAge : prev.age
    }));

    if (errors.dateOfBirth) {
      setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
    }
    if (errors.age && calculatedAge !== '') {
      setErrors((prev) => ({ ...prev, age: undefined }));
    }
  };

  const handleAutoCalculateAge = () => {
    if (formData.dateOfBirth) {
      const calculated = calculateAgeFromDOB(formData.dateOfBirth);
      setFormData((prev) => ({
        ...prev,
        age: calculated
      }));
      if (errors.age) {
        setErrors((prev) => ({ ...prev, age: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validation = validatePersonData(formData, isEdit);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSuccessFeedback(null);

    try {
      await onSave(formData, personToEdit?.id);

      if (!isEdit) {
        // Clear the form after creating
        setFormData({
          name: '',
          age: '',
          dateOfBirth: '',
          image: ''
        });
      }

      setSuccessFeedback(
        isEdit ? 'Person card updated successfully!' : 'Person card created successfully!'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while saving.';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#706A62] hover:text-[#1F2421] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EAE4DC] text-[#423E39]">
          {isEdit ? 'Edit Person' : 'Create New Card'}
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EDE8E1] shadow-lg space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1F2421] font-display">
            {isEdit ? 'Edit Person Card' : 'Add Person'}
          </h2>
          <p className="mt-1 text-sm text-[#706A62]">
            {isEdit
              ? 'Update the person portrait, name, age, or date of birth.'
              : 'Fill in the details below to add a new card to your browser collection.'}
          </p>
        </div>

        {/* Success Alert */}
        {successFeedback && (
          <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl flex items-center space-x-2.5 text-[#065F46] text-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
            <div className="flex-grow">
              <p className="font-bold">{successFeedback}</p>
              <p className="text-xs text-[#065F46]/80 mt-0.5">
                Stored in your browser. Visible instantly in your collection.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold underline text-[#065F46] hover:text-[#044e39] ml-2"
            >
              View collection
            </button>
          </div>
        )}

        {/* General Form Error (e.g. Quota Exceeded) */}
        {errors.general && (
          <div className="p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-2xl text-sm text-[#B91C1C]">
            <p className="font-semibold">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Field */}
          <ImageUploader
            currentPhotoUrl={formData.image}
            onImageSelected={(dataUrl) => {
              setFormData((prev) => ({
                ...prev,
                image: dataUrl
              }));
              if (errors.image) {
                setErrors((prev) => ({ ...prev, image: undefined }));
              }
            }}
            onImageRemoved={() => {
              setFormData((prev) => ({
                ...prev,
                image: ''
              }));
            }}
            error={errors.image}
          />

          {/* Name Field */}
          <div>
            <label htmlFor="person-name-input" className="block text-sm font-semibold text-[#1F2421] mb-1.5">
              Name <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="person-name-input"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g. Alex Morgan"
              className="w-full px-4 py-3 bg-[#FAF8F5] text-[#1F2421] placeholder-[#9E968D] rounded-xl border border-[#D5CDC4] focus:outline-none focus:border-[#1F2421] focus:ring-1 focus:ring-[#1F2421] text-sm sm:text-base transition-colors"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-[#B91C1C]">{errors.name}</p>
            )}
          </div>

          {/* Grid of DOB and Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth Field */}
            <div>
              <label htmlFor="person-dob-input" className="block text-sm font-semibold text-[#1F2421] mb-1.5">
                Date of Birth <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="person-dob-input"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleDOBChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#FAF8F5] text-[#1F2421] rounded-xl border border-[#D5CDC4] focus:outline-none focus:border-[#1F2421] focus:ring-1 focus:ring-[#1F2421] text-sm sm:text-base transition-colors"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-[#B91C1C]">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Age Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="person-age-input" className="block text-sm font-semibold text-[#1F2421]">
                  Age <span className="text-[#B91C1C]">*</span>
                </label>
                {formData.dateOfBirth && (
                  <button
                    type="button"
                    onClick={handleAutoCalculateAge}
                    className="text-[11px] text-[#529E72] hover:text-[#387652] font-semibold flex items-center space-x-1"
                    title="Calculate age from selected Date of Birth"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-calc age</span>
                  </button>
                )}
              </div>
              <input
                id="person-age-input"
                type="number"
                min="0"
                max="130"
                value={formData.age}
                onChange={(e) => {
                  setFormData({ ...formData, age: e.target.value });
                  if (errors.age) setErrors({ ...errors, age: undefined });
                }}
                placeholder="e.g. 24"
                className="w-full px-4 py-3 bg-[#FAF8F5] text-[#1F2421] placeholder-[#9E968D] rounded-xl border border-[#D5CDC4] focus:outline-none focus:border-[#1F2421] focus:ring-1 focus:ring-[#1F2421] text-sm sm:text-base transition-colors"
              />
              {errors.age && (
                <p className="mt-1 text-xs text-[#B91C1C]">{errors.age}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#EAE4DC] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#D5CDC4] text-sm font-semibold text-[#5C5650] hover:bg-[#F4EFEB] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="create-card-btn"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#1F2421] hover:bg-[#000000] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEdit ? 'Updating Card...' : 'Creating Card...'}</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>{isEdit ? 'Update Card' : 'Create Card'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
