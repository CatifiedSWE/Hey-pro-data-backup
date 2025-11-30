'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { supabase, setStoragePreference } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordValidation {
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordRuleProps {
  label: string;
  valid: boolean;
  color?: "green" | "red";
}

const PasswordRule: React.FC<PasswordRuleProps> = ({
  label,
  valid,
  color = "green",
}) => (
  <div className="flex items-center space-x-2">
    <div
      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${valid
        ? color === "red"
          ? "bg-red-500"
          : "bg-green-500"
        : "bg-gray-300"
        }`}
    ></div>
    <span
      className={`text-xs sm:text-sm transition-colors duration-300 ${valid
        ? color === "red"
          ? "text-red-500"
          : "text-green-500"
        : "text-gray-400"
        }`}
    >
      Password must contain <span className="font-medium">{label}</span>
    </span>
  </div>
);

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center my-8">
    <div className="flex-1 border-t border-gray-300"></div>
    <span className="px-4 text-gray-500 text-sm">
      {label}
    </span>
    <div className="flex-1 border-t border-gray-300"></div>
  </div>
);

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // On page load: Check if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        // Already logged in, check profile
        const token = session.access_token;
        const response = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
          router.replace('/slate');
        } else {
          router.replace('/form');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkExistingSession();
  }, [router]);

  const validatePassword = (password: string): PasswordValidation => ({
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordValidation(validatePassword(newPassword));
    if (error) setError('');
  };

  const isPasswordValid = () => {
    return (
      formData.password.length >= 8 &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecialChar
    );
  };

  // On form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid()) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Normalize email
      const email = formData.email.toLowerCase().trim();

      // Step 2: Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`
        }
      });

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setError('This email is already registered. Please login instead or use a different email.');
        } else if (signUpError.message.includes('Email rate limit exceeded')) {
          setError('Too many signup attempts. Please try again in a few minutes.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // If user already exists (identities array is empty), show appropriate message
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered. Please login instead.');
        setLoading(false);
        return;
      }

      // Step 3: Handle two scenarios
      if (data.user && !data.session) {
        // Email confirmation required
        toast.success('Verification code sent to your email!');
        // Redirect to OTP page as per existing logic
        router.push(`/otp?email=${encodeURIComponent(email)}`);
      } else if (data.session) {
        // Auto-confirmed, redirect to profile form
        router.push('/form');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // OAuth sign up
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      // Google OAuth defaults to "keep me logged in"
      setStoragePreference(true);
      
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
    } catch (err) {
      setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 md:px-12 py-8 order-2 lg:order-1">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="mb-8 text-center lg:text-left">
            <Image
              src="/logo/LogoIcon.svg"
              alt="HeyProData"
              width={200}
              height={60}
              className="h-12 sm:h-14 mb-6 w-auto mx-auto lg:mx-0"
            />
            <p className="text-2xl sm:text-3xl font-light text-gray-900">
              Sign up to
              <span className="font-semibold text-pink"> Hey</span>
              <span className="font-semibold text-black">Pro</span>
              <span className="font-semibold text-light-green"> Data</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="">
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (error) setError('');
                }}
                className="h-12 text-base border-gray-300 rounded-xl focus:border-[#FA6E80] focus:ring-[#FA6E80]"
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
                className="h-12 text-base border-gray-300 rounded-xl focus:border-[#FA6E80] focus:ring-[#FA6E80] pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-0 h-full pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {formData.password && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <PasswordRule
                  label="at least one uppercase"
                  valid={passwordValidation.hasUppercase}
                />
                <PasswordRule
                  label="at least one number"
                  valid={passwordValidation.hasNumber}
                />
                <PasswordRule
                  label="at least one special character"
                  valid={passwordValidation.hasSpecialChar}
                  color="green"
                />
                <PasswordRule
                  label="minimum 8 characters"
                  valid={formData.password.length >= 8}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isPasswordValid()}
              className={cn(
                "w-full h-12 bg-[#FA6E80] hover:bg-[#f95569] text-white text-lg font-medium rounded-[15px] transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer mt-2",
                loading && "opacity-70 cursor-progress",
                !isPasswordValid() && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none"
              )}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>

          <Divider label="or" />

          <div className="flex flex-row w-full justify-center">
            <Button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-12 bg-white border border-gray-300 rounded-[15px] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center"
            >
              <Image
                src="/assets/icons/google.svg"
                alt="Google Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="ml-2 text-gray-700 font-medium">Continue with Google</span>
            </Button>
          </div>

          <div className="text-center mt-8">
            <span className="text-gray-600 text-base">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="text-[#4A90E2] font-medium hover:underline transition-all duration-200 text-base"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Gradient Background 
          Responsive: Hidden on mobile, visible from lg.
          Layout: Uses max-h-[90vh] to respect screen height, preserving aspect ratio.
      */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-start p-8 h-screen sticky top-0 order-1 lg:order-2">
        <div
          className="w-auto h-auto max-w-[450px] max-h-[90vh] aspect-[450/721] rounded-[68px] shadow-2xl"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)",
          }}
        ></div>
      </div>
    </div>
  );
}
