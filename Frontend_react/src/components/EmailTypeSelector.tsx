import React from 'react';
import { MessageSquare } from 'lucide-react';

interface EmailTypeSelectorProps {
  value: 'long' | 'short';
  onChange: (value: 'long' | 'short') => void;
}

const EmailTypeSelector: React.FC<EmailTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-4 mt-4">
      <button
        type="button"
        onClick={() => onChange('short')}
        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
          value === 'short'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-200'
        }`}
      >
        <MessageSquare className="w-6 h-6 mb-2 mx-auto text-blue-600" />
        <h3 className="font-medium">Short & Concise</h3>
        <p className="text-sm text-gray-600 mt-1">
          Brief and to-the-point email
        </p>
      </button>

      <button
        type="button"
        onClick={() => onChange('long')}
        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
          value === 'long'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-200'
        }`}
      >
        <MessageSquare className="w-6 h-6 mb-2 mx-auto text-blue-600" />
        <h3 className="font-medium">Detailed & Professional</h3>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive email with more details
        </p>
      </button>
    </div>
  );
};

export default EmailTypeSelector;