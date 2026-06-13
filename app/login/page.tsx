"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/admin/vehicles");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for a confirmation link!");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">LotEngine</h1>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-8">Secure Terminal Access</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Staff Email</label>
            <input 
              type="email" 
              className="w-full border-2 border-black p-4 font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Access Key</label>
            <input 
              type="password" 
              className="w-full border-2 border-black p-4 font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-4 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-brand-primary transition-colors disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="w-full border-2 border-black py-4 font-black uppercase tracking-widest hover:bg-zinc-100 transition-colors text-xs"
            >
              Request New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
