"use client";

import React, { useState } from 'react';

interface VehicleImage {
  storage_url: string;
  is_primary?: boolean;
  sort_order?: number;
}

interface VehicleGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export default function VehicleGallery({ images, vehicleName }: VehicleGalleryProps) {
  // Sort images: primary first, then by sort_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const [activeIndex, setActiveIndex] = useState(0);

  if (sortedImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-zinc-100 border-4 border-black flex flex-col items-center justify-center p-8 text-center">
          <p className="text-sm font-black uppercase italic tracking-tighter text-black opacity-30 mb-2">
            Primary Asset Capture Pending
          </p>
          <p className="text-[10px] font-mono uppercase text-black opacity-40">
            LotEngine Digital Twin Pipeline Active
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="aspect-square bg-zinc-50 border-2 border-black/10 border-dashed flex items-center justify-center text-[10px] font-mono text-black/20"
            >
              ANGLE_{i}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeImage = sortedImages[activeIndex] || sortedImages[0];

  return (
    <div className="space-y-6">
      {/* Active Hero Image */}
      <div className="aspect-square bg-zinc-100 border-4 border-black relative overflow-hidden group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <img 
          src={activeImage.storage_url} 
          alt={`${vehicleName} - View ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-350"
        />
        <div className="absolute bottom-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest">
          IMAGE {activeIndex + 1} OF {sortedImages.length}
        </div>
      </div>

      {/* Thumbnail Selection Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
        {sortedImages.map((img, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`aspect-square bg-zinc-100 border-2 overflow-hidden transition-all focus:outline-none ${
                isActive 
                  ? 'border-brand-primary scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                  : 'border-black opacity-75 hover:opacity-100 hover:-translate-y-0.5'
              }`}
            >
              <img 
                src={img.storage_url} 
                alt={`${vehicleName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
