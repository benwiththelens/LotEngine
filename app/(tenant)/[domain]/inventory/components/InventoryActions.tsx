"use client";

import React, { useState } from 'react';
import QuickCaptureModal from '@/components/QuickCaptureModal';

interface InventoryActionsProps {
  domain: string;
  isMarketingDomain: boolean;
}

export default function InventoryActions({ domain, isMarketingDomain }: InventoryActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-[#0055FF] text-white px-8 py-4 font-black uppercase italic tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
      >
        // INITIATE_ASSET_CAPTURE
      </button>

      <QuickCaptureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        domain={domain}
        isMarketingDomain={isMarketingDomain}
      />
    </>
  );
}
