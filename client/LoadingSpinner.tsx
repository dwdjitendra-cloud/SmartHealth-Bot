import React from 'react';
import { Heart, Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'heart' | 'pulse' | 'minimal';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...',
  variant = 'heart'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerSizeClasses = {
    sm: 'min-h-[100px]',
    md: 'min-h-[200px]',
    lg: 'min-h-[300px]'
  };

  if (variant === 'heart') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} space-y-4`}>
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-healthcare animate-pulse-soft">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-healthcare-accent-500 rounded-full animate-ping"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-healthcare-neutral-600 text-sm font-medium">{text}</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-healthcare-primary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-healthcare-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-healthcare-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} space-y-4`}>
        <div className="relative">
          <Activity className={`${sizeClasses[size]} text-healthcare-primary-600 animate-pulse`} />
          <div className="absolute inset-0 rounded-full border-2 border-healthcare-primary-300 animate-ping"></div>
        </div>
        <p className="text-healthcare-neutral-600 text-sm font-medium">{text}</p>
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={`flex items-center justify-center ${containerSizeClasses[size]} space-x-3`}>
      <div className="relative">
        <div className="w-6 h-6 border-2 border-healthcare-primary-200 border-t-healthcare-primary-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-healthcare-neutral-600 text-sm font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;