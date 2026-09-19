import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginPageProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSupabaseActive = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await onLogin(email.trim(), password);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@collection.com');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      {/* Back to Collection Link */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-[#706A62] hover:text-[#1F2421] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-8 border border-[#EDE8E1] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] flex items-center justify-center mx-auto text-[#1F2421]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#1F2421] font-display">
            Administrator Login
          </h2>
          <p className="text-xs text-[#706A62]">
            {isSupabaseActive
              ? 'Log in using your Supabase administrator account'
              : 'Sign in to access add, edit, and delete controls'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-xs text-[#B91C1C] text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-[#423E39] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C847B]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] text-[#1F2421] rounded-xl border border-[#D5CDC4] focus:outline-none focus:border-[#1F2421] focus:ring-1 focus:ring-[#1F2421] text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-[#423E39] mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C847B]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] text-[#1F2421] rounded-xl border border-[#D5CDC4] focus:outline-none focus:border-[#1F2421] focus:ring-1 focus:ring-[#1F2421] text-sm transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            id="admin-login-submit-btn"
            disabled={isLoading}
            className="w-full py-3 bg-[#1F2421] hover:bg-[#333A36] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Mode Quick Fill Helper if Supabase is unconfigured */}
        {!isSupabaseActive && (
          <div className="pt-4 border-t border-[#EAE4DC] text-center space-y-2">
            <p className="text-[11px] text-[#8C847B]">
              Testing in preview? Click below to auto-fill demo credentials:
            </p>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs font-semibold text-[#529E72] hover:underline"
            >
              Fill Demo Admin (admin@collection.com / admin123)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
