import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- 1. Create the 'people' table
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  date_of_birth DATE NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Allow public read access" ON public.people
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.people
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.people
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON public.people
  FOR DELETE TO authenticated USING (true);

-- 4. Storage Bucket 'person-photos'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('person-photos', 'person-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies
CREATE POLICY "Public read person photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'person-photos');

CREATE POLICY "Authenticated upload person photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'person-photos');

CREATE POLICY "Authenticated update person photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'person-photos');

CREATE POLICY "Authenticated delete person photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'person-photos');`;

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isConnected = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EDE8E1] my-8 space-y-6"
      >
        <button
          onClick={onClose}
          aria-label="Close setup modal"
          className="absolute top-5 right-5 text-[#8C847B] hover:text-[#1F2421] p-1.5 rounded-full hover:bg-[#F4EFEB] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FAF5ED] text-[#B45309]'}`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1F2421]">
              Supabase Database Setup
            </h2>
            <div className="flex items-center space-x-2 text-xs mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
              <span className="font-semibold text-[#5C5650]">
                Status: {isConnected ? 'Connected to Supabase' : 'Active in Local / Offline Preview Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="text-sm text-[#5C5650] leading-relaxed bg-[#FAF8F5] p-4 rounded-2xl border border-[#EAE4DC]">
          The application is fully architected for Supabase with PostgreSQL storage and Row Level Security.
          In this environment, you can freely test card creation, editing, deleting, photo uploads, and admin authentication right away. To link your real Supabase project for permanent cross-device production deployment on Vercel:
        </div>

        {/* 3 Step Instructions */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-[#1F2421] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-bold text-[#1F2421]">Create a free Supabase project</p>
              <p className="text-[#706A62]">Go to supabase.com, create a project, and navigate to the SQL Editor.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-[#1F2421] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#1F2421]">Run the Database & Storage SQL Schema</p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-[#1F2421] hover:bg-[#333A36] text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              <div className="mt-2 bg-[#1A1E1B] text-[#A7F3D0] p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 border border-[#2D332F]">
                <pre>{SQL_SCHEMA}</pre>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-[#1F2421] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-bold text-[#1F2421]">Configure Environment Variables</p>
              <p className="text-[#706A62]">
                In your project settings or Vercel deployment dashboard, set:
              </p>
              <code className="block mt-1 bg-[#F4EFEB] px-2 py-1 rounded text-[#1F2421] font-mono text-xs">
                VITE_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co<br/>
                VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#EAE4DC] flex items-center justify-between">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#5C5650] hover:text-[#1F2421] flex items-center space-x-1"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1F2421] text-white rounded-xl text-xs font-semibold hover:bg-[#333A36] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
