'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { supabase, setStoragePreference } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

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
  const [showPassword, setShowPassword] = useState(false);

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

    // Validation
    if (!formData.email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

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
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      // Always keep OAuth users logged in
      setStoragePreference(true);
      
      // Initiate OAuth flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left side - Gradient Background */}
      <div className="hidden md:flex md:w-1/2 items-center justify-end pl-2 pr-0 py-2">
        <div
          className="w-full h-full max-w-[450px] max-h-[721px] rounded-[68px]"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)",
          }}
        ></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-start px-4 sm:px-6 md:pl-0 py-6 md:py-12">
        <div className="w-full max-w-md md:max-w-lg md:pl-12 lg:pl-16 xl:pl-20">
          {/* Logo */}
          <div className="mb-6 md:text-left text-center">
            <Image
              src="/logo/LogoIcon.svg"
              alt="HeyProData"
              width={200}
              height={60}
              className="h-14 md:h-12 mb-4 md:mb-8 w-auto mx-auto md:mx-0 "
            />
            <p className="text-2xl md:text-3xl font-light text-gray-900">
              Login to
              <span className="font-semibold text-pink"> Hey</span>
              <span className="font-semibold text-black">Pro</span>
              <span className="font-semibold text-light-green">Data</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
            {/* Email Field */}
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (error) setError('');
                }}
                className="h-11 md:h-12 text-sm md:text-base border-gray-300 rounded-xl focus:border-pink focus:ring-pink transition-all duration-300"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (error) setError('');
                }}
                className="h-11 md:h-12 text-sm md:text-base border-gray-300 rounded-xl focus:border-[#FA6E80] focus:ring-[#FA6E80] pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember Password Checkbox */}
            <div className="flex items-center flex-row justify-between mb-4">
              <span className="flex items-center space-x-2 md:space-x-3">
                <Checkbox
                  id="remember"
                  checked={formData.keepLoggedIn}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, keepLoggedIn: checked as boolean })
                  }
                  className="border-gray-400 data-[state=checked]:bg-pink data-[state=checked]:border-pink"
                />
                <label
                  htmlFor="remember"
                  className="text-xs md:text-sm text-gray-600 cursor-pointer select-none"
                >
                  Keep me logged in
                </label>
              </span>

              <Link
                href="/forget-password"
                className="text-xs md:text-sm text-light-green font-medium hover:underline transition-all duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-[40px] md:h-[50px] bg-pink hover:bg-[#f95569] text-white text-sm md:text-lg font-medium rounded-[15px] transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer",
                loading && "opacity-70 cursor-progress"
              )}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5 md:my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 md:px-4 text-gray-500 text-xs md:text-sm">
              or
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-row w-full gap-3 md:gap-4 justify-center">
            <Button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-[45px] md:h-[40px] bg-white border border-gray-300 rounded-[12px] md:rounded-[15px] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center p-3 md:p-6"
            >
              <Image
                src="/assets/icons/google.svg"
                alt="Google Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </Button>
          </div>

          {/* Sign up Link */}
          <div className="text-center mt-5 md:mt-8">
            <span className="text-gray-600 text-xs md:text-base">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="text-[#4A90E2] font-medium hover:underline transition-all duration-200 text-xs md:text-base bg-transparent shadow-none hover:shadow-none"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

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
