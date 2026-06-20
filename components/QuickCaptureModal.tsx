"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { getLink as getLinkUtil } from '@/lib/getLink';
import { X } from 'lucide-react';

const supabase = createClient();

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  isMarketingDomain: boolean;
}

export default function QuickCaptureModal({ isOpen, onClose, domain, isMarketingDomain }: QuickCaptureModalProps) {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const getLink = (path: string) => getLinkUtil(path, domain, isMarketingDomain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Query for exact VIN or ilike match (for last 6)
      const { data, error: supabaseError } = await supabase
        .from('vehicles')
        .select('vin')
        .or(`vin.eq.${vin},vin.ilike.%${vin}`)
        .limit(1);

      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const targetVin = data[0].vin;
        router.push(getLink(`/inventory/${targetVin}/capture`));
        onClose();
      } else {
        setError('// VEHICLE_NOT_FOUND');
      }
    } catch (err) {
      console.error(err);
      setError('// SYSTEM_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#09090b] border-4 border-white p-8 md:p-12 relative shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:rotate-90 transition-transform p-2"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0055FF] mb-2">Manual Asset Entry</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
            Enter VIN
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <input
              autoFocus
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="ASSET_IDENTIFIER_OR_LAST_6"
              className="w-full bg-transparent border-b-8 border-white p-6 text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white placeholder:opacity-10 focus:outline-none focus:border-[#0055FF] transition-colors"
            />
            {error && (
              <p className="text-[#E63946] font-mono text-sm font-black tracking-widest animate-pulse">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !vin}
            className="w-full bg-[#0055FF] text-white p-8 text-2xl font-black uppercase italic tracking-[0.2em] border-b-8 border-r-8 border-black hover:translate-x-1 hover:translate-y-1 hover:border-b-4 hover:border-r-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '// SEARCHING_DATABASE...' : '// INITIATE_ASSET_CAPTURE'}
          </button>
        </form>

        <div className="mt-12 flex justify-between font-mono text-[10px] font-bold opacity-30 text-white uppercase tracking-widest">
            <span>Terminal_01</span>
            <span>Waiting_for_input</span>
            <span>Secure_Link</span>
        </div>
      </div>
    </div>
  );
}
