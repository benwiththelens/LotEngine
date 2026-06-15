"use client";

import { useState, use, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function LoginContent({ host }: { host: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'info' | 'error', text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const getLink = (path: string) => {
    if (typeof window === 'undefined') return path;
    const hostname = window.location.hostname;
    const isMarketingDomain = hostname === 'localhost' || hostname === 'lot-engine.com' || hostname === 'www.lot-engine.com';
    
    if (!isMarketingDomain) return path;
    return `/${host}${path === '/' ? '' : path}`;
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message.toUpperCase() });
    } else {
      const next = searchParams.get('next');
      if (next) {
        router.push(getLink(next));
      } else {
        router.push(getLink("/admin/vehicles"));
      }
    }
    setLoading(false);
  }

  async function handleMagicLink() {
    if (!email) {
      setMessage({ type: 'error', text: "STAFF EMAIL REQUIRED FOR SECURE LINK" });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    const next = searchParams.get('next');
    const redirectPath = next ? getLink(next) : getLink("/admin/vehicles");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${redirectPath}` : undefined,
      }
    });

    if (error) {
      setMessage({ type: 'error', text: error.message.toUpperCase() });
    } else {
      setMessage({ type: 'info', text: "SECURE LINK DEPLOYED TO INBOX" });
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md bg-black border border-zinc-800 p-10 flex flex-col items-center">
      {/* The Brand */}
      <div className="mb-10">
        <img src="/logo.png" alt="LotEngine Logo" className="w-12 h-12 object-contain" />
      </div>

      <div className="w-full mb-10 text-center text-white">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">System Authorization</h1>
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-zinc-500 mt-2">LotEngine Terminal // v0.3.0</p>
      </div>
      
      <form onSubmit={handleLogin} className="w-full space-y-8">
        {message && (
          <div className={`p-4 border font-mono text-[10px] font-black uppercase tracking-widest animate-pulse ${
            message.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[#0055FF]/10 border-[#0055FF] text-[#0055FF]'
          }`}>
            {message.type === 'error' ? '!! ' : '// '}{message.text}
          </div>
        )}

        <div className="text-white">
          <label className="block text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-3 text-zinc-400">Staff Email</label>
          <input 
            type="email" 
            placeholder="OPERATOR_ID"
            className="w-full bg-zinc-900 border border-zinc-800 p-4 font-mono font-bold text-white outline-none focus:border-[#0055FF] transition-colors placeholder:opacity-20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="text-white">
          <label className="block text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-3 text-zinc-400">Access Key</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full bg-zinc-900 border border-zinc-800 p-4 font-mono font-bold text-white outline-none focus:border-[#0055FF] transition-colors placeholder:opacity-20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-6 pt-4 items-center">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0055FF] text-white py-5 font-black uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all disabled:opacity-50 active:translate-y-0.5"
          >
            {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
          </button>
          
          <button 
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="font-mono text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white transition-colors"
          >
            // Request Secure Link
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: host } = use(params);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 font-sans selection:bg-[#0055FF]/30 text-white">
      <Suspense fallback={<div className="text-white font-mono text-[10px] animate-pulse uppercase tracking-[0.4em]">Initializing Security Protocol...</div>}>
        <LoginContent host={host} />
      </Suspense>

      {/* Infrastructure Note */}
      <div className="mt-8 flex items-center gap-4 text-zinc-700 font-mono text-[8px] font-black uppercase tracking-[0.5em]">
        <span>Encrypted Pipeline</span>
        <div className="w-1 h-1 bg-zinc-800 rounded-full" />
        <span>Hardware Isolation</span>
      </div>
    </div>
  );
}
