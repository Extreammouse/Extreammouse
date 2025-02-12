import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1497864149936-d3163f0c0f4b?auto=format&fit=crop&q=80)',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <div>
          <Link to="/" className="flex justify-center">
            <Logo />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;