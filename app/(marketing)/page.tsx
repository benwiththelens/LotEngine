"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Camera, BarChart3, Share2 } from "lucide-react";

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
      title: "Studio-Grade Asset Capture",
      description: "Pro-photographer designed mobile wireframes ensure every unit is captured with technical precision. No specialized hardware required.",
      icon: <Camera size={24} className="text-[#0055FF]" />,
      detail: "Sequential mapping engine"
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
            <a href="#pillars" className="hover:text-white transition-colors">Architecture</a>
            <a href="#demo" className="hover:text-white transition-colors">Operations</a>
            <a href="#pricing" className="hover:text-white transition-colors">Infrastructure</a>
        </div>
        <Link 
            href="/login"
            className="bg-zinc-900 border border-zinc-800 px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
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
            v0.2.0: The Rugged Update
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            The Headless Dealership <br />
            <span className="text-[#0055FF]">Operating System</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12">
            Abstracting away legacy bloat with high-density, industrial-grade dealership infrastructure. Built for performance on the lot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-[#0055FF] text-white px-12 py-5 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all w-full sm:w-auto">
              Book Demo
            </button>
            <button className="bg-transparent border-2 border-zinc-800 text-white px-12 py-5 text-sm font-black uppercase tracking-widest hover:bg-zinc-900 transition-all w-full sm:w-auto">
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
      <section className="bg-zinc-900 border-y-2 border-zinc-800 py-6 overflow-hidden">
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
            className="flex gap-20 items-center"
          >
            {marqueeItems.map((item, i) => (
              <span key={i} className="font-mono text-xs font-black uppercase tracking-[0.8em] text-zinc-500 italic">
                // {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section id="pillars" className="p-8 md:p-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-2 border-l-2 border-zinc-800">
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
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">{pillar.title}</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-12">
                  {pillar.description}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="font-mono text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700">INFRASTRUCTURE // {pillar.detail}</div>
                <div className="w-12 h-1 bg-zinc-800 group-hover:w-full group-hover:bg-[#0055FF] transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Industrial Quote / Bottom CTA */}
      <section className="p-8 md:p-24 text-center border-t-2 border-zinc-800">
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-12">
          Ready to Deploy?
        </h2>
        <button className="bg-[#0055FF] text-white px-16 py-6 text-sm font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-[8px_8px_0px_0px_rgba(0,85,255,0.2)]">
          Schedule Infrastructure Audit
        </button>
      </section>

      {/* Footer */}
      <footer className="p-12 border-t-2 border-zinc-800 bg-[#09090b]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-500">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="LotEngine Logo" className="w-6 h-6 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest italic">LotEngine OS // v0.2.0</span>
          </div>
          <div className="flex gap-8 font-mono text-[8px] font-black uppercase tracking-[0.5em]">
            <span>© 2026 LotEngine Inc.</span>
            <span className="text-zinc-700">Built for the Asphalt.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
