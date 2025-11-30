'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();

      // Request password reset - this will send reset link to email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        if (resetError.message.includes('rate limit')) {
          setError('Too many requests. Please wait a moment before trying again.');
        } else if (resetError.message.includes('not found')) {
          setError('No account found with this email address.');
        } else {
          setError(resetError.message);
        }
        setLoading(false);
        return;
      }

      // Show success message - don't redirect
      setSuccess(true);
      toast.success('Password reset link sent!');
      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)'
        }}
      />

      {/* Form Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo/LogoIcon.svg" 
            alt="HPD Logo" 
            width={80} 
            height={55}
            priority
          />
        </div>

        <h2 className="text-2xl font-bold text-black text-center mb-3">
          Forgot Password?
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            <p className="font-semibold mb-1">Reset link sent!</p>
            <p>A password reset link has been sent to <span className="font-medium">{email}</span>. Please check your email and click the link to reset your password.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black placeholder-gray-400 transition-colors"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 rounded-xl font-semibold text-white text-lg transition-all transform hover:scale-[1.02] bg-[#FA6E80] hover:bg-[#ff5a75] cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : success ? 'Link Sent' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-[#0066ff] hover:underline text-sm font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
