'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InfoPopupProps {
  content: string | React.ReactNode;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  triggerClassName?: string;
}

const InfoPopup: React.FC<InfoPopupProps> = ({
  content,
  title,
  placement = 'top',
  className,
  triggerClassName
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !popupRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - popupRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2) - (popupRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2) - (popupRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (popupRect.height / 2);
        left = triggerRect.left - popupRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (popupRect.height / 2);
        left = triggerRect.right + 8;
        break;
    }

    // Adjust for viewport boundaries
    if (left < 8) left = 8;
    if (left + popupRect.width > viewport.width - 8) {
      left = viewport.width - popupRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + popupRect.height > viewport.height - 8) {
      top = viewport.height - popupRect.height - 8;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible, placement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        triggerRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isVisible]);

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-0 h-0 border-solid';
    
    switch (placement) {
      case 'top':
        return `${baseClasses} border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 border-t-8 border-l-8 border-r-8 top-full left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 border-b-8 border-l-8 border-r-8 bottom-full left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 border-l-8 border-t-8 border-b-8 left-full top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 border-r-8 border-t-8 border-b-8 right-full top-1/2 transform -translate-y-1/2`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors',
          'rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          triggerClassName
        )}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Show help information"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Popup Portal */}
      {isVisible && (
        <div
          className="fixed inset-0 z-50"
          style={{ pointerEvents: 'none' }}
        >
          <div
            ref={popupRef}
            className={cn(
              'absolute bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs p-3',
              'pointer-events-auto z-50',
              className
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {/* Arrow */}
            <div className={getArrowClasses()} />
            
            {/* Content */}
            <div className="relative">
              {title && (
                <div className="font-medium mb-2 text-white">
                  {title}
                </div>
              )}
              <div className="text-gray-200 leading-relaxed">
                {typeof content === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  content
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoPopup;