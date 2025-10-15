/**
 * Simple Ethiopian Calendar Converter
 * 
 * The Ethiopian calendar is approximately 7-8 years behind the Gregorian calendar
 * and has 13 months (12 months of 30 days each + 1 month of 5-6 days)
 * 
 * This is a simplified converter for basic date conversion needs
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

// Ethiopian months
export const ETHIOPIAN_MONTHS = [
  { value: 1, label: 'Meskerem', days: 30 },
  { value: 2, label: 'Tikimt', days: 30 },
  { value: 3, label: 'Hidar', days: 30 },
  { value: 4, label: 'Tahsas', days: 30 },
  { value: 5, label: 'Tir', days: 30 },
  { value: 6, label: 'Yekatit', days: 30 },
  { value: 7, label: 'Megabit', days: 30 },
  { value: 8, label: 'Miazia', days: 30 },
  { value: 9, label: 'Ginbot', days: 30 },
  { value: 10, label: 'Sene', days: 30 },
  { value: 11, label: 'Hamle', days: 30 },
  { value: 12, label: 'Nehase', days: 30 },
  { value: 13, label: 'Pagume', days: 5 } // 6 days in leap years
];

/**
 * Check if an Ethiopian year is a leap year
 */
export function isEthiopianLeapYear(year: number): boolean {
  return (year % 4) === 3;
}

/**
 * Convert Gregorian date to Ethiopian date (simplified approximation)
 * Note: This is a simplified conversion and may not be 100% accurate for all dates
 */
export function gregorianToEthiopian(gregorianDate: Date): EthiopianDate {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1; // JavaScript months are 0-indexed
  const day = gregorianDate.getDate();
  
  // Ethiopian New Year starts around September 11 (or 12 in leap years)
  // This is a simplified calculation
  let ethiopianYear: number;
  let ethiopianMonth: number;
  let ethiopianDay: number;
  
  if (month >= 9 && (month > 9 || day >= 11)) {
    // After Ethiopian New Year
    ethiopianYear = year - 7;
  } else {
    // Before Ethiopian New Year
    ethiopianYear = year - 8;
  }
  
  // Simplified month/day conversion
  // This is an approximation and should be refined for production use
  if (month >= 9) {
    ethiopianMonth = month - 8;
    ethiopianDay = Math.min(day, 30);
  } else {
    ethiopianMonth = month + 4;
    ethiopianDay = Math.min(day, 30);
  }
  
  // Adjust for Pagume (13th month)
  if (ethiopianMonth > 12) {
    ethiopianMonth = 13;
    ethiopianDay = Math.min(day, isEthiopianLeapYear(ethiopianYear) ? 6 : 5);
  }
  
  return {
    year: ethiopianYear,
    month: ethiopianMonth,
    day: ethiopianDay
  };
}

/**
 * Convert Ethiopian date to Gregorian date (simplified approximation)
 */
export function ethiopianToGregorian(ethiopianDate: EthiopianDate): Date {
  const { year, month, day } = ethiopianDate;
  
  // Simplified conversion - add 7-8 years and adjust months
  let gregorianYear = year + 7;
  let gregorianMonth: number;
  let gregorianDay = day;
  
  if (month <= 4) {
    // First 4 Ethiopian months correspond to Sept-Dec of previous Gregorian year
    gregorianYear = year + 7;
    gregorianMonth = month + 8;
  } else if (month <= 12) {
    // Ethiopian months 5-12 correspond to Jan-Aug of current Gregorian year
    gregorianYear = year + 8;
    gregorianMonth = month - 4;
  } else {
    // Pagume (13th month) corresponds to early September
    gregorianYear = year + 8;
    gregorianMonth = 9;
    gregorianDay = Math.min(day + 5, 10);
  }
  
  return new Date(gregorianYear, gregorianMonth - 1, gregorianDay);
}

/**
 * Format Ethiopian date as string
 */
export function formatEthiopianDate(ethiopianDate: EthiopianDate): string {
  const monthName = ETHIOPIAN_MONTHS.find(m => m.value === ethiopianDate.month)?.label || 'Unknown';
  return `${ethiopianDate.day} ${monthName} ${ethiopianDate.year}`;
}

/**
 * Parse Ethiopian date string (DD/MM/YYYY format)
 */
export function parseEthiopianDate(dateString: string): EthiopianDate | null {
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 13) return null;
  if (day < 1 || day > 30) return null;
  if (month === 13 && day > 6) return null;
  
  return { year, month, day };
}

/**
 * Get current Ethiopian date
 */
export function getCurrentEthiopianDate(): EthiopianDate {
  return gregorianToEthiopian(new Date());
}

/**
 * Calculate age in Ethiopian calendar
 */
export function calculateEthiopianAge(birthDate: EthiopianDate): number {
  const today = getCurrentEthiopianDate();
  let age = today.year - birthDate.year;
  
  // Adjust if birthday hasn't occurred this year
  if (today.month < birthDate.month || 
      (today.month === birthDate.month && today.day < birthDate.day)) {
    age--;
  }
  
  return age;
}

/**
 * Validate Ethiopian date
 */
export function isValidEthiopianDate(ethiopianDate: EthiopianDate): boolean {
  const { year, month, day } = ethiopianDate;
  
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 13) return false;
  if (day < 1) return false;
  
  if (month === 13) {
    // Pagume month
    const maxDays = isEthiopianLeapYear(year) ? 6 : 5;
    return day <= maxDays;
  } else {
    return day <= 30;
  }
}
