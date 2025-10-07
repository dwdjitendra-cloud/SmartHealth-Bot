import React from 'react';
import { Clock, Shield } from 'lucide-react';

interface RateLimitInfoProps {
  onClose?: () => void;
}

const RateLimitInfo: React.FC<RateLimitInfoProps> = ({ onClose }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Shield className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Rate Limit Reached
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You've made too many authentication attempts. This is a security measure to protect against automated attacks.
            </p>
            <div className="mt-3 flex items-center text-xs">
              <Clock className="h-4 w-4 mr-1" />
              <span>Please wait 15 minutes before trying again</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="-mx-2 -my-1.5 flex">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitInfo;