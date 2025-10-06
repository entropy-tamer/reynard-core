/**
 * Date Validation Utilities
 * Functions for validating dates and age
 */

/**
 * Date validation (checks if date is valid and optionally in range)
 */
export function isValidDate(date: string | Date, minDate?: Date, maxDate?: Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  // Check min date
  if (minDate && dateObj < minDate) {
    return false;
  }

  // Check max date
  if (maxDate && dateObj > maxDate) {
    return false;
  }

  return true;
}

/**
 * Age validation (checks if person is at least a certain age)
 */
export function isValidAge(birthDate: string | Date, minAge: number): boolean {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
}
