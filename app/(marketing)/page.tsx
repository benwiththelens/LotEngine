"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Camera, BarChart3, Share2 } from "lucide-react";

function DemoTerminal() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      const res = await fetch('/api/send-demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full bg-zinc-900 border border-zinc-800 p-5 flex items-center justify-center min-h-[66px]">
        <p className="font-mono text-[10px] text-[#0055FF] font-black uppercase tracking-[0.2em] animate-pulse">
          // REQUEST_RECEIVED: CHECK_YOUR_INBOX_SHORTLY
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 p-5 flex flex-col items-start gap-2">
      <p className="font-mono text-[9px] text-zinc-500 font-black uppercase tracking-widest">
        // REQUEST_DEMO_ACCESS
      </p>
      <form onSubmit={handleSubmit} className="w-full flex items-center gap-4">
        <input 
          type="email"
          placeholder="EMAIL ADDRESS"
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs font-black text-white placeholder:text-zinc-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          required
        />
        {status === 'loading' && <div className="w-4 h-4 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />}
        {status === 'error' && <p className="font-mono text-[9px] text-red-500 font-black">!! RETRY</p>}
      </form>
    </div>
  );
}

export default function MarketingPage() {
  const marqueeItems = [
    "+18% REVENUE PER BAY",
    "ZERO-HARDWARE PIPELINE",
    "25% FASTER TURNAROUND",
    "+18% REVENUE PER BAY",
    "ZERO-HARDWARE PIPELINE",
    "25% FASTER TURNAROUND",
  ];

  const pillars = [
    {
      title: "Pro-Grade Asset Capture",
      description: "Pro-photographer designed mobile wireframes ensure every unit is captured with technical precision. No specialized hardware required.",
      icon: <Camera size={24} className="text-[#0055FF]" />,
      detail: "Sequential mapping engine",
      hasPreview: true
    },
    {
      title: "The 18% Revenue Engine",
      description: "An industrial 5-stage Kanban bay built to eliminate idle lift time. Built-in performance analytics track every minute of the repair lifecycle.",
      icon: <BarChart3 size={24} className="text-[#0055FF]" />,
      detail: "Tactical bay management"
    },
    {
      title: "Zero-Tax Syndication",
      description: "Generate raw markdown Ad Kits for instant, low-friction deployment to social marketplaces. Stop paying for third-party luxury bloat.",
      icon: <Share2 size={24} className="text-[#0055FF]" />,
      detail: "Raw markdown syndication"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#0055FF]/30">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="LotEngine Logo" className="w-8 h-8 object-contain" />
            <span className="font-black uppercase tracking-tighter text-xl italic text-white">LotEngine</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            <a href="#demo" className="hover:text-white transition-colors">Workflow</a>
            <a href="#infrastructure" className="hover:text-white transition-colors">Pricing</a>
            <a href="#deploy" className="hover:text-white transition-colors">Deploy</a>
        </div>
        <Link 
            href="/login"
            className="bg-zinc-900 border border-zinc-800 px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all text-white"
        >
            Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="p-8 md:p-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">
            <Zap size={12} className="text-[#0055FF]" />
            v0.3.0: The Multi-Tenant Update
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            The Headless Dealership <br />
            <span className="text-[#0055FF]">Operating System</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12">
            Abstracting away legacy bloat with high-density, industrial-grade dealership infrastructure. Built for performance on the lot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <div className="w-full max-w-md">
              <DemoTerminal />
            </div>
            <button className="bg-transparent border-2 border-zinc-800 text-white px-12 py-5 text-sm font-black uppercase tracking-widest hover:bg-zinc-900 transition-all w-full sm:w-auto h-[78px]">
              View Specs
            </button>
          </div>
        </motion.div>

        {/* Video Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-24 w-full max-w-6xl aspect-video border-2 border-zinc-800 bg-zinc-900 flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="flex flex-col items-center gap-4 text-zinc-700">
             <div className="w-20 h-20 border-4 border-zinc-800 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-zinc-800 border-b-[15px] border-b-transparent ml-2" />
             </div>
             <p className="font-mono text-xs font-black uppercase tracking-[0.5em]">SYSTEM PREVIEW // 16:9 LOOP</p>
          </div>
        </motion.div>
      </section>

      {/* Data Marquee */}
      <section className="bg-zinc-900 border-y-2 border-zinc-800 py-6 overflow-hidden text-white">
        <div className="flex whitespace-nowrap">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-20 items-center"
          >
            {marqueeItems.map((item, i) => (
              <span key={i} className="font-mono text-xs font-black uppercase tracking-[0.8em] text-zinc-500 italic">
                // {item}
              </span>
            ))}
          </motion.div>
          {/* Duplicate for seamless scrolling */}
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-20 items-center text-white"
          >
            {marqueeItems.map((item, i) => (
              <span key={i} className="font-mono text-xs font-black uppercase tracking-[0.8em] text-zinc-500 italic">
                // {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* #demo Section (Workflow) */}
      <section id="demo" className="min-h-screen py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2 text-white">System Workflow</p>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">Operational Engine</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-2 border-l-2 border-zinc-800 text-white">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-12 border-r-2 border-b-2 border-zinc-800 flex flex-col justify-between group hover:bg-zinc-900/30 transition-colors"
            >
              <div>
                <div className="mb-8">{pillar.icon}</div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6 text-white">{pillar.title}</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-12">
                  {pillar.description}
                </p>
                {pillar.hasPreview && (
                  <div className="aspect-video bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-12">
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-center px-4">
                      // ASSET_PENDING: AWAITING_RENDER_PIPELINE....
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 text-white">
                <div className="font-mono text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700">INFRASTRUCTURE // {pillar.detail}</div>
                <div className="w-12 h-1 bg-zinc-800 group-hover:w-full group-hover:bg-[#0055FF] transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* #infrastructure Section (Pricing) */}
      <section id="infrastructure" className="min-h-screen py-24 px-8 max-w-7xl mx-auto border-t-2 border-zinc-800">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4 text-white">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2 text-white">Pricing Protocols</p>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">Infrastructure Tiers</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
          {/* The Engine */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-black border border-zinc-800 p-12 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-8 text-white">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">The Engine</h3>
                <div className="text-right">
                  <p className="font-mono text-3xl font-black text-white">$499</p>
                  <p className="font-mono text-[10px] font-bold uppercase text-zinc-500 mt-1">/ Month</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm font-medium mb-10 leading-relaxed">The core headless operating system for rapid lot management.</p>
              
              <ul className="space-y-4 mb-12 text-white">
                {["Multi-Tenant Database Access", "Mobile Asset Capture Wireframe", "5-Stage Service Kanban", "Automated Syndication Kits"].map((feat) => (
                  <li key={feat} className="flex gap-3 items-center text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <div className="w-1.5 h-1.5 bg-zinc-800" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full bg-transparent border-2 border-zinc-800 text-white py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all text-white">
              Deploy Engine
            </button>
          </motion.div>

          {/* The Custom Chassis */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-black border border-zinc-800 p-12 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#0055FF] text-white text-[8px] font-black uppercase px-3 py-1 tracking-widest italic">Enterprise</div>
            <div>
              <div className="flex justify-between items-start mb-8 text-white">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">The Custom Chassis</h3>
                <div className="text-right text-white">
                  <p className="font-mono text-lg font-black text-zinc-500 text-white">$4,500 Setup</p>
                  <p className="font-mono text-3xl font-black text-white text-white">$499 <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">/mo</span></p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm font-medium mb-10 leading-relaxed">Enterprise infrastructure and high-fidelity physical onboarding.</p>
              
              <ul className="space-y-4 mb-12 text-white">
                {["Everything in The Engine", "Custom Next.js Storefront on Your Domain", "On-Site Workflow Integration", "Mechanic Camera Training"].map((feat) => (
                  <li key={feat} className="flex gap-3 items-center text-[11px] font-bold uppercase tracking-wider text-white">
                    <div className="w-1.5 h-1.5 bg-[#0055FF]" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full bg-[#0055FF] text-white py-5 text-xs font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-[8px_8px_0px_0px_rgba(0,85,255,0.1)] text-white">
              Request Enterprise Build
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section id="deploy" className="p-8 md:p-32 text-center border-t-2 border-zinc-800 bg-[#09090b]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-16 text-white">
            Ready to Deploy?
          </h2>
          <div className="max-w-md mx-auto">
            <DemoTerminal />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="p-12 border-t-2 border-zinc-800 bg-[#09090b]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-500">
          <div className="flex items-center gap-4 text-white">
            <img src="/logo.png" alt="LotEngine Logo" className="w-6 h-6 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest italic text-white">LotEngine OS // v0.3.0</span>
          </div>
          <div className="flex gap-8 font-mono text-[8px] font-black uppercase tracking-[0.5em] text-white">
            <span>© 2026 LotEngine Inc.</span>
            <span className="text-zinc-700">Built for the Asphalt.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
