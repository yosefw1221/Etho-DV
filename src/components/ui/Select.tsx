import React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  showHelpIcon?: boolean;
  onHelpClick?: () => void;
  options: Option[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helpText, showHelpIcon, onHelpClick, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center mb-2">
            <label className="form-label">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {showHelpIcon && (
              <button
                type="button"
                onClick={onHelpClick}
                className="ml-2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm transition-colors"
                aria-label="Help"
              >
                ?
              </button>
            )}
          </div>
        )}
        <select
          className={cn(
            'input-field',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="form-error">{error}</p>}
        {helpText && !error && <p className="form-help">{helpText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;