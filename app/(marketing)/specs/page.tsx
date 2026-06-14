"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Cpu, Database, Globe, Layers, Zap, Smartphone, Terminal, RefreshCw, Share2 } from "lucide-react";

export default function SpecsPage() {
  const techStack = [
    {
      title: "Frontend",
      icon: <Globe size={20} className="text-[#0055FF]" />,
      tech: ["Next.js 16 (App Router)", "React 19", "Tailwind CSS 4", "Framer Motion"]
    },
    {
      title: "Database & Auth",
      icon: <Database size={20} className="text-[#0055FF]" />,
      tech: ["Supabase (PostgreSQL)", "Row Level Security (RLS)", "JWT Authentication", "Edge Functions"]
    },
    {
      title: "Infrastructure",
      icon: <Cpu size={20} className="text-[#0055FF]" />,
      tech: ["Vercel (Edge Runtime)", "Dynamic Proxy Middleware", "Multi-Region Availability", "Asset Mirroring"]
    },
    {
      title: "Integrations",
      icon: <Layers size={20} className="text-[#0055FF]" />,
      tech: ["NHTSA vPIC API", "Resend Email Protocol", "Digital Twin Pipeline", "Ad-Kit Syndication"]
    }
  ];

  const mechanisms = [
    {
      head: "Dynamic Multi-Tenancy",
      body: "Zero-configuration domain mapping with robust lookup fallbacks for Vercel preview environments."
    },
    {
      head: "Rugged Professionalism Aesthetic",
      body: "A high-contrast, flat design system optimized for maximum sunlight readability and industrial performance. (No shadows, sharp 90° corners, pure white/black)."
    },
    {
      head: "Service Kanban Engine",
      body: "An industrial-grade 5-stage workflow for managing repairs on the lot (Intake → Diagnostics → Awaiting Parts → In Progress → Ready)."
    },
    {
      head: "Inventory Terminal",
      body: "A deep-dive management hub for asset capture, VIN decoding, and multi-tenant repository management."
    },
    {
      head: "Smart Sync",
      body: "Built-in support for offline-first data entry with persistent 'SAVED' states."
    },
    {
      head: "Mobile-First Operations",
      body: "Responsive sidebar that collapses into a bottom navigation bar on phones. Tactical hardware-style buttons for high-performance touch interaction."
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
            <Link href="/#demo" className="hover:text-white transition-colors">Workflow</Link>
            <Link href="/#infrastructure" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/#deploy" className="hover:text-white transition-colors">Deploy</Link>
        </div>
        <Link 
            href="/login"
            className="bg-zinc-900 border border-zinc-800 px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all text-white"
        >
            Login
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto py-12 md:py-24 px-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-[#0055FF] transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          // RETURN_TO_ROOT
        </Link>

        <header className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
            System <br />
            <span className="text-[#0055FF]">Specifications</span>
          </h1>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
            Technical Documentation // v0.3.0
          </p>
        </header>

        {/* Section 1: System Architecture */}
        <section className="mb-20">
          <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-[#0055FF]" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">System Architecture</h2>
            </div>
            
            <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-12">
              LotEngine is a lightweight, headless operating system built for independent automotive dealerships. 
              The platform utilizes a true multi-tenant architecture with domain-based routing, serving both the global 
              SaaS marketing site and individual dealer showrooms from a single optimized instance.
            </p>

            <div className="bg-black border border-zinc-800 p-6 md:p-8 font-mono text-[10px] space-y-6">
              <div className="text-zinc-500 uppercase tracking-widest mb-4">// NETWORK_TOPOLOGY_MAP</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="text-[#0055FF] font-black">EDGE_GATEWAY (Dynamic Proxy)</div>
                  <ul className="space-y-2 text-zinc-400 border-l border-zinc-800 pl-4">
                    <li>→ lot-engine.com {"::"} Marketing_Site</li>
                    <li>→ [any_dealer].com {"::"} Tenant_Showroom</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="text-[#0055FF] font-black">THE_HUB (Operations Layer)</div>
                  <ul className="space-y-2 text-zinc-400 border-l border-zinc-800 pl-4">
                    <li>→ SaaS Signup Management</li>
                    <li>→ Real-time Inventory Sync</li>
                    <li>→ Supabase PostgreSQL Engine</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Tech Stack */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-[#0055FF]" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">The Tech Stack</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-zinc-800">
            {techStack.map((stack, i) => (
              <div key={i} className="bg-zinc-900 border-r border-b border-zinc-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  {stack.icon}
                  <h3 className="text-sm font-black uppercase tracking-widest">{stack.title}</h3>
                </div>
                <ul className="space-y-3">
                  {stack.tech.map((item, j) => (
                    <li key={j} className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider flex gap-2">
                      <span className="text-[#0055FF]">{'>'}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Core Mechanisms */}
        <section className="mb-20">
          <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1.5 h-6 bg-[#0055FF]" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Core Mechanisms</h2>
            </div>

            <div className="space-y-12">
              {mechanisms.map((mech, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="font-mono text-xs text-[#0055FF] font-black opacity-30 group-hover:opacity-100 transition-opacity pt-1">
                    0{i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight mb-2 group-hover:text-[#0055FF] transition-colors">
                      {mech.head}
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                      {mech.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure Note */}
        <div className="flex flex-col items-center text-center gap-8 py-12 border-t border-zinc-800">
          <div className="flex items-center gap-4 text-zinc-700 font-mono text-[8px] font-black uppercase tracking-[0.5em]">
            <span>Verified System Spec</span>
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <span>Ready for Deployment</span>
          </div>
          <Link 
            href="/#deploy"
            className="bg-[#0055FF] text-white px-12 py-5 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all"
          >
            Deploy Engine
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-zinc-800 bg-[#09090b]">
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
