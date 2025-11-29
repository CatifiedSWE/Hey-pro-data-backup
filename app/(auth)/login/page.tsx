'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, setStoragePreference } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Login Form Component containing the logic using useSearchParams
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // On page load: Check if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Get existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;  // Not logged in, show login form
        
        // User already authenticated, check profile
        const token = session.access_token;
        
        const response = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        // Route based on profile
        if (data.success && data.data) {
          router.replace('/slate');
        } else {
          router.replace('/form');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }

      // Check for error in URL
      const errorParam = searchParams.get('error');
      if (errorParam === 'authentication_failed') {
        setError('Authentication failed. Please try again.');
      }
    };
    
    checkExistingSession();
  }, [router, searchParams]);

  // On form submit: Email/Password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Set storage preference BEFORE login
      setStoragePreference(formData.keepLoggedIn);

      // Step 2: Normalize email to lowercase
      const email = formData.email.toLowerCase().trim();

      // Step 3: Sign in with Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      });

      if (loginError) {
        // Provide user-friendly error messages
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in. Check your inbox for the verification code.');
        } else {
          setError(loginError.message);
        }
        setLoading(false);
        return;
      }

      // Step 4: Get access token
      const token = data.session?.access_token;

      if (!token) {
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      // Step 5: Check profile via API
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const profileData = await response.json();

      // Step 6: Route based on profile
      if (profileData.success && profileData.data) {
        toast.success('Login successful!');
        router.push('/slate');
      } else {
        router.push('/form');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // OAuth login
  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (provider === 'apple') {
      return; // Apple login not implemented
    }

    setLoading(true);
    setError('');

    try {
      // Always keep OAuth users logged in
      setStoragePreference(true);
      
      // Initiate OAuth flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/callback`
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // OAuth redirects to callback page
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT GRADIENT PART */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <div className="w-full h-full rounded-3xl" style={{background: 'conic-gradient(from 180deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)'}}></div>
      </div>

      {/* RIGHT LOGIN PART */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <img src="/logo/logo.svg" alt="Logo" width="60" className="mb-8" />
          </div>

          <h2 className="text-3xl font-medium mb-8">
            Login to <span className="text-gray-900">HeyPro</span><span className="text-[#00bcd4]">Data</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between mb-6 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.keepLoggedIn}
                  onChange={(e) => setFormData({ ...formData, keepLoggedIn: e.target.checked })}
                  className="mr-2"
                  disabled={loading}
                />
                Keep me logged in
              </label>
              <Link href="/forget-password" className="text-[#00bcd4] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff6b9d] hover:bg-[#ff5a8f] text-white py-3 rounded-lg font-medium mb-6 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/assets/google-icon.png" width="20" alt="Google" />
              Google
            </button>
            <button 
              disabled
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
            >
              <img src="/assets/apple-icon.png" width="20" alt="Apple" />
              Apple
            </button>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an account? <Link href="/signup" className="text-[#0066ff] hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Page Component
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading login...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
