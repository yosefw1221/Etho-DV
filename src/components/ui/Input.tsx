import React from 'react';
import { cn } from '@/lib/utils';
import InfoPopup from './InfoPopup';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  infoContent?: string | React.ReactNode;
  infoTitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, infoContent, infoTitle, size = 'md', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {infoContent && (
              <div className="ml-2">
                <InfoPopup
                  content={infoContent}
                  title={infoTitle}
                  placement="top"
                />
              </div>
            )}
          </div>
        )}
        <input
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            size === 'sm' && 'px-2 py-1 text-sm',
            size === 'lg' && 'px-4 py-3 text-lg',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helpText && !error && <p className="mt-1 text-sm text-gray-600">{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;