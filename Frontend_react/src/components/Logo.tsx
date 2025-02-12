import React, { useState } from 'react';

const Logo: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error('Logo image failed to load');
    setImageError(true);
  };

  return (
    <div className="flex items-center gap-3">
      {!imageError ? (
        <div className="relative">
          {/* Logo backlight effect */}
          <div className="absolute inset-0 bg-black opacity-10 blur-md rounded-full" />
          <img 
            src="images/Quicksend_logo_new.png"
            alt="QuickSend AI"
            className="w-16 h-16 object-contain relative z-10"
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-full">
          <span className="text-xs text-gray-500">Logo</span>
        </div>
      )}
      <span className="text-2xl font-bold text-gray-900">
        QuickSend AI
      </span>
    </div>
  );
};

export default Logo;