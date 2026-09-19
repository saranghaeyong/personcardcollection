import { ValidationErrors, PersonFormData } from '../types';

/**
 * Reusable utility for calculating age from a Date of Birth string.
 * Keeps user-entered age intact in the database while allowing optional calculation.
 */
export function calculateAgeFromDOB(dobString: string): number {
  if (!dobString) return 0;
  
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Formats date into standard elegant format: e.g. "15 January 2001"
 */
export function formatDisplayDate(dateString: string): string {
  if (!dateString) return 'Not specified';

  try {
    // Handle YYYY-MM-DD cleanly without timezone offset discrepancies
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const date = new Date(year, monthIndex, day);
      if (!isNaN(date.getTime())) {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${day} ${months[monthIndex]} ${year}`;
      }
    }

    const fallbackDate = new Date(dateString);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  } catch {
    // Return original string if parsing fails
  }

  return dateString;
}

/**
 * Validates Person Form Data before submission
 */
export function validatePersonData(
  data: Partial<PersonFormData>,
  hasExistingPhoto = false
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  // Name validation
  const trimmedName = data.name?.trim() || '';
  if (!trimmedName) {
    errors.name = 'Please enter a name.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (trimmedName.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  // Age validation
  if (data.age === undefined || data.age === null || data.age === '') {
    errors.age = 'Please enter age.';
  } else {
    const numericAge = Number(data.age);
    if (isNaN(numericAge) || !Number.isInteger(numericAge)) {
      errors.age = 'Age must be a valid whole number.';
    } else if (numericAge < 0 || numericAge > 125) {
      errors.age = 'Please enter a sensible age between 0 and 125.';
    }
  }

  // Date of Birth validation
  if (!data.date_of_birth) {
    errors.date_of_birth = 'Please select a date of birth.';
  } else {
    const dob = new Date(data.date_of_birth);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(dob.getTime())) {
      errors.date_of_birth = 'Please enter a valid date.';
    } else if (dob > today) {
      errors.date_of_birth = 'Date of birth cannot be in the future.';
    } else {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 130);
      if (dob < minDate) {
        errors.date_of_birth = 'Date of birth is too far in the past.';
      }
    }
  }

  // Photo validation
  const hasPhoto = !!data.photo_file || (!!data.photo_url && data.photo_url.trim().length > 0) || hasExistingPhoto;
  if (!hasPhoto) {
    errors.photo = 'Please upload a photo.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
