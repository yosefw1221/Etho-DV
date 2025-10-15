'use client';

import React, { useState, useEffect } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import Modal from './Modal';
import { 
  EthiopianDate, 
  GregorianDate,
  ETHIOPIAN_MONTHS,
  gregorianToEthiopian,
  ethiopianToGregorian,
  formatEthiopianDate,
  parseEthiopianDate,
  isValidEthiopianDate,
  calculateEthiopianAge
} from '@/lib/ethiopianCalendar';

interface EthiopianDateInputProps {
  label: string;
  value: string; // Gregorian date string (YYYY-MM-DD)
  onChange: (gregorianDate: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

const EthiopianDateInput: React.FC<EthiopianDateInputProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  helpText,
  className = ''
}) => {
  const [showEthiopianInput, setShowEthiopianInput] = useState(false);
  const [ethiopianDate, setEthiopianDate] = useState<EthiopianDate>({ year: 2017, month: 1, day: 1 });
  const [showHelp, setShowHelp] = useState(false);

  // Convert Gregorian value to Ethiopian when value changes
  useEffect(() => {
    if (value) {
      try {
        const gregorianDate = new Date(value);
        if (!isNaN(gregorianDate.getTime())) {
          const ethDate = gregorianToEthiopian(gregorianDate);
          setEthiopianDate(ethDate);
        }
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }
  }, [value]);

  const handleEthiopianDateChange = (field: keyof EthiopianDate, newValue: string) => {
    const numValue = parseInt(newValue, 10);
    if (isNaN(numValue)) return;

    const updatedDate = { ...ethiopianDate, [field]: numValue };
    setEthiopianDate(updatedDate);

    // Convert to Gregorian and update parent
    if (isValidEthiopianDate(updatedDate)) {
      try {
        const gregorianDate = ethiopianToGregorian(updatedDate);
        const gregorianString = gregorianDate.toISOString().split('T')[0];
        onChange(gregorianString);
      } catch (error) {
        console.error('Error converting Ethiopian date to Gregorian:', error);
      }
    }
  };

  const handleGregorianChange = (gregorianValue: string) => {
    onChange(gregorianValue);
  };

  const toggleCalendarType = () => {
    setShowEthiopianInput(!showEthiopianInput);
  };

  // Generate year options (current Ethiopian year ± 100 years)
  const currentEthiopianYear = gregorianToEthiopian(new Date()).year;
  const yearOptions = [];
  for (let i = currentEthiopianYear - 100; i <= currentEthiopianYear + 10; i++) {
    yearOptions.push({ value: i.toString(), label: i.toString() });
  }

  // Generate day options
  const dayOptions = [];
  for (let i = 1; i <= 30; i++) {
    dayOptions.push({ value: i.toString(), label: i.toString() });
  }

  const monthOptions = ETHIOPIAN_MONTHS.map(month => ({
    value: month.value.toString(),
    label: month.label
  }));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleCalendarType}
          className="text-xs"
        >
          {showEthiopianInput ? 'Use Gregorian' : 'Use Ethiopian Calendar'}
        </Button>
      </div>

      {showEthiopianInput ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Select
              label="Day"
              value={ethiopianDate.day.toString()}
              onChange={(e) => handleEthiopianDateChange('day', e.target.value)}
              options={[{ value: '', label: 'Day' }, ...dayOptions]}
              required={required}
            />
            <Select
              label="Month"
              value={ethiopianDate.month.toString()}
              onChange={(e) => handleEthiopianDateChange('month', e.target.value)}
              options={[{ value: '', label: 'Month' }, ...monthOptions]}
              required={required}
            />
            <Select
              label="Year"
              value={ethiopianDate.year.toString()}
              onChange={(e) => handleEthiopianDateChange('year', e.target.value)}
              options={[{ value: '', label: 'Year' }, ...yearOptions]}
              required={required}
            />
          </div>
          
          {isValidEthiopianDate(ethiopianDate) && (
            <div className="text-sm text-gray-600">
              Ethiopian Date: {formatEthiopianDate(ethiopianDate)}
              {ethiopianDate.year > 0 && (
                <span className="ml-2">
                  (Age: {calculateEthiopianAge(ethiopianDate)} years)
                </span>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Need help with Ethiopian calendar?
            </button>
          </div>
        </div>
      ) : (
        <Input
          type="date"
          value={value}
          onChange={(e) => handleGregorianChange(e.target.value)}
          error={error}
          required={required}
          placeholder={placeholder}
          max={new Date().toISOString().split('T')[0]}
          min="1900-01-01"
        />
      )}

      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Ethiopian Calendar Help Modal */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Ethiopian Calendar Help"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            The Ethiopian calendar has 13 months and is approximately 7-8 years behind the Gregorian calendar.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-900 mb-2">Ethiopian Months:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              {ETHIOPIAN_MONTHS.map((month, index) => (
                <div key={month.value}>
                  {month.value}. {month.label} ({month.days} days)
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• The Ethiopian New Year starts around September 11</li>
              <li>• Each of the first 12 months has exactly 30 days</li>
              <li>• The 13th month (Pagume) has 5 days (6 in leap years)</li>
              <li>• This converter provides an approximation for convenience</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> This is a simplified converter. For official documents, 
            please verify dates with Ethiopian calendar authorities.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default EthiopianDateInput;
