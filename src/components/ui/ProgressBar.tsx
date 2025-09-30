import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  showSteps?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  showSteps = true, 
  className 
}) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showSteps && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {current} of {total}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;