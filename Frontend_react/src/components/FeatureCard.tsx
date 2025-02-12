import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  comingSoon?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  comingSoon = false
}) => {
  return (
    <div
      onClick={!comingSoon ? onClick : undefined}
      className={`
        p-6 rounded-xl shadow-md bg-white border-2 transition-all duration-200
        ${!comingSoon && onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}
        ${comingSoon ? 'opacity-75' : ''}
      `}
    >
      <div className="flex flex-col items-center text-center">
        <Icon className="w-12 h-12 text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
        {comingSoon && (
          <span className="mt-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;