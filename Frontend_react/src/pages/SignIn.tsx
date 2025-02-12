import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn, resetPassword, signInWithGoogle, loading } = useFirebaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showResetPassword) {
      await resetPassword(email);
      setShowResetPassword(false);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <AuthLayout 
      title={showResetPassword ? "Reset Password" : "Sign in to your account"}
      subtitle={showResetPassword 
        ? "Enter your email to receive a password reset link"
        : "Don't have an account yet? Sign up for free"}
    >
      <div className="mt-8 space-y-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            
            {!showResetPassword && (
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {showResetPassword ? "Back to sign in" : "Forgot your password?"}
            </button>
            
            {!showResetPassword && (
              <Link
                to="/signup"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Create new account
              </Link>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              showResetPassword ? "Send reset link" : "Sign in"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignIn;