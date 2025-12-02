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

// Password Generator Icon Component
const PasswordGeneratorIcon = () => (
  <svg width="31" height="16" viewBox="0 0 31 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_3390_4127" fill="white">
      <path d="M0 0.414062H31V15.4141H0V0.414062Z"/>
    </mask>
    <path d="M31 15.4141V13.4141H0V15.4141V17.4141H31V15.4141Z" fill="currentColor" mask="url(#path-1-inside-1_3390_4127)"/>
    <path d="M8.127 1.34406L8.883 2.70906L5.964 3.92706L8.904 5.12406L8.106 6.53106L5.565 4.68306L5.901 7.85406H4.326L4.641 4.68306L2.1 6.55206L1.281 5.12406L4.2 3.90606L1.281 2.73006L2.058 1.32306L4.662 3.19206L4.326 6.19292e-05H5.922L5.565 3.19206L8.127 1.34406ZM18.3399 1.34406L19.0959 2.70906L16.1769 3.92706L19.1169 5.12406L18.3189 6.53106L15.7779 4.68306L16.1139 7.85406H14.5389L14.8539 4.68306L12.3129 6.55206L11.4939 5.12406L14.4129 3.90606L11.4939 2.73006L12.2709 1.32306L14.8749 3.19206L14.5389 6.19292e-05H16.1349L15.7779 3.19206L18.3399 1.34406ZM28.5528 1.34406L29.3088 2.70906L26.3898 3.92706L29.3298 5.12406L28.5318 6.53106L25.9908 4.68306L26.3268 7.85406H24.7518L25.0668 4.68306L22.5258 6.55206L21.7068 5.12406L24.6258 3.90606L21.7068 2.73006L22.4838 1.32306L25.0878 3.19206L24.7518 6.19292e-05H26.3478L25.9908 3.19206L28.5528 1.34406Z" fill="currentColor"/>
  </svg>
);

interface PasswordValidation {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center my-5 md:my-8">
    <div className="flex-1 border-t border-gray-300"></div>
    <span className="px-3 md:px-4 text-gray-500 text-xs md:text-sm">
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
    hasMinLength: false,
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
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  });

  // Generate secure random password
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';
    
    // Ensure at least one of each required type
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill the rest with random characters from all sets
    const allChars = uppercase + lowercase + numbers + specialChars;
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to randomize positions
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData({ ...formData, password });
    setPasswordValidation(validatePassword(password));
    setShowPassword(true); // Show the generated password
    if (error) setError('');
    toast.success('Password generated successfully!');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordValidation(validatePassword(newPassword));
    if (error) setError('');
  };

  const isPasswordValid = () => {
    return (
      passwordValidation.hasMinLength &&
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
    <div className="flex min-h-screen items-center justify-center overflow-hidden mx-auto max-w-7xl bg-white">
      <div className="w-full flex px-4 sm:px-6 py-6 mx-auto">
        <div className="flex w-full flex-col md:flex-row gap-8 mx-auto justify-center items-center">
          {/* Left Side - Signup Form */}
          <div className="w-full max-w-md md:max-w-full md:p-32 md:pr-8 flex flex-col justify-center mx-auto">
            <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
              <div className="mb-6 md:mb-12 md:text-left text-center">
                <Image
                  src="/logo/LogoIcon.svg"
                  alt="HeyProData"
                  width={200}
                  height={60}
                  className="h-14 md:h-12 mb-4 md:mb-8 w-auto mx-auto md:mx-0"
                />
                <p className="text-2xl md:text-3xl font-light text-gray-900">
                  Sign up to
                  <span className="font-semibold text-pink"> Hey</span>
                  <span className="font-semibold text-black">Pro</span>
                  <span className="font-semibold text-light-green"> Data</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="">
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (error) setError('');
                  }}
                  className="h-11 md:h-12 text-sm md:text-base border-gray-300 rounded-xl focus:border-[#FA6E80] focus:ring-[#FA6E80]"
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
                  className="h-11 md:h-12 text-sm md:text-base border-gray-300 rounded-xl focus:border-[#FA6E80] focus:ring-[#FA6E80] pr-24"
                  required
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    title="Generate secure password"
                    disabled={loading}
                  >
                    <PasswordGeneratorIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {formData.password && (
                <div className="space-y-1.5 md:space-y-2">
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
                className="w-full h-[40px] md:h-[50px] bg-[#FA6E80] hover:bg-[#f95569] text-white text-sm md:text-lg font-medium rounded-[15px]"
              >
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </form>

            <Divider label="or" />

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

            <div className="text-center mt-5 md:mt-8">
              <span className="text-gray-600 text-xs md:text-base">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-[#4A90E2] font-medium hover:underline text-xs md:text-base"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Side - Gradient Background */}
          <div className="hidden md:flex w-full items-center justify-start py-6 md:py-0">
            <div
              className="w-full md:h-[50rem] max-w-[450px] rounded-[40px] md:rounded-[68px]"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
