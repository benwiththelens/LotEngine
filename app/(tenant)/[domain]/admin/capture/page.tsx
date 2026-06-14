"use client";

import { use, useState } from "react";
import CaptureModule from "@/app/(dashboard)/components/CaptureModule";

export default function CapturePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const [mode, setMode] = useState<'intake' | 'retail'>('retail');

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Protocol Switcher for Demo */}
      <div className="bg-black p-2 flex justify-center gap-4 border-b-4 border-[#0047AB]">
        <button 
          onClick={() => setMode('intake')}
          className={`px-4 py-1 font-black uppercase text-[10px] transition-all ${mode === 'intake' ? 'bg-[#0047AB] text-white' : 'text-zinc-500 hover:text-white'}`}
        >
          // INTAKE_PROTOCOL
        </button>
        <button 
          onClick={() => setMode('retail')}
          className={`px-4 py-1 font-black uppercase text-[10px] transition-all ${mode === 'retail' ? 'bg-[#0047AB] text-white' : 'text-zinc-500 hover:text-white'}`}
        >
          // RETAIL_PROTOCOL
        </button>
      </div>

      <CaptureModule 
        vin="1N4AL3APXFC123456" 
        mode={mode} 
      />
    </main>
  );
}
