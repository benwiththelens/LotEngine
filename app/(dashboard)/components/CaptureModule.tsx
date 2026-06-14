"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Camera, Upload, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface Shot {
  id: string;
  name: string;
  description: string;
}

const INTAKE_SHOTS: Shot[] = [
  { id: 'left_rear_three_quarter', name: 'Left Rear Three-Quarter', description: "Rear-facing angle showing the driver's side and the rear of the vehicle." },
  { id: 'drivers_side_profile', name: "Driver's Side Profile", description: "Straight-on side view capturing the full profile length of the vehicle." },
  { id: 'left_front_three_quarter', name: 'Left Front Three-Quarter', description: "Front-facing angle showing the driver's side and the grille/front bumper." },
  { id: 'passengers_side_profile', name: "Passenger's Side Profile", description: "Straight-on side view of the passenger side." },
  { id: 'right_rear_three_quarter', name: 'Right Rear Three-Quarter', description: "Rear-facing angle showing the passenger's side and the rear of the vehicle." },
];

const RETAIL_SHOTS: Shot[] = [
  // Exterior
  { id: 'left_rear_three_quarter', name: 'Left Rear Three-Quarter', description: "Rear-facing angle showing the driver's side and the rear of the vehicle." },
  { id: 'drivers_side_profile', name: "Driver's Side Profile", description: "Straight-on side view capturing the full profile length of the vehicle." },
  { id: 'right_front_three_quarter', name: 'Right Front Three-Quarter', description: "Front-facing angle showing the passenger's side and the grille/front bumper." },
  { id: 'front_straight_on', name: 'Front Straight-On', description: "Directly centered on the front grille." },
  { id: 'left_front_three_quarter', name: 'Left Front Three-Quarter', description: "Front-facing angle showing the driver's side and the grille/front bumper." },
  { id: 'passengers_side_profile', name: "Passenger's Side Profile", description: "Straight-on side view of the passenger side." },
  { id: 'rear_straight_on_trunk_open', name: 'Rear Straight-On (Trunk Open)', description: "Centered shot of the rear with the liftgate open." },
  { id: 'rear_straight_on_trunk_closed', name: 'Rear Straight-On (Trunk Closed)', description: "Centered shot of the rear tail." },
  // Detail
  { id: 'wheel_tire_detail', name: 'Wheel/Tire Detail', description: "Close-up shot focused on the wheel rim, tire condition, and tread." },
  { id: 'engine_bay', name: 'Engine Bay', description: "Open-hood shot showcasing the engine bay cleanliness and components." },
  // Interior
  { id: 'interior_door_panel', name: 'Interior Door Panel', description: "Interior view of the driver's side door panel and controls." },
  { id: 'driver_cockpit_dashboard', name: 'Driver Cockpit/Dashboard', description: "Wide view of the dashboard, steering wheel, and primary driver controls." },
  { id: 'passenger_front_seat', name: 'Passenger Front Seat', description: "Interior view focused on the passenger seating area." },
  { id: 'rear_seating_area', name: 'Rear Seating Area', description: "Interior view showing the rear cabin and seating arrangement." },
  { id: 'center_stack_infotainment', name: 'Center Stack/Infotainment', description: "Focused shot of the center console, climate controls, and head unit." },
  { id: 'infotainment_screen', name: 'Infotainment Screen', description: "Close-up of the infotainment screen showing the main interface." },
  { id: 'backup_camera_view', name: 'Backup Camera View', description: "Capture of the screen displaying the backup camera feed." },
  { id: 'instrument_cluster', name: 'Instrument Cluster', description: "Close-up of the gauge/instrument panel with the engine on." },
];

interface CaptureModuleProps {
  vin: string;
  mode: 'intake' | 'retail';
  tenantBrandColor?: string;
}

export default function CaptureModule({ vin, mode, tenantBrandColor = '#0047AB' }: CaptureModuleProps) {
  const shots = mode === 'intake' ? INTAKE_SHOTS : RETAIL_SHOTS;
  
  const [capturedShots, setCapturedShots] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(shots[0]?.id || null);
  
  const isComplete = useMemo(() => shots.every(s => capturedShots[s.id]), [shots, capturedShots]);

  // The Observer Effect for Auto-Advance
  React.useEffect(() => {
    const nextUncaptured = shots.find(shot => !capturedShots[shot.id]);
    if (nextUncaptured) {
      setExpandedId(nextUncaptured.id);
      setTimeout(() => {
        document.getElementById(nextUncaptured.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } else {
      setExpandedId(null);
    }
  }, [capturedShots, shots]);

  const handleCapture = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedShots(prev => ({ ...prev, [id]: url }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div 
        className="flex flex-col min-h-screen bg-zinc-50 text-black font-sans p-4 md:p-8 pb-40"
        style={{ '--tenant-accent': tenantBrandColor } as React.CSSProperties}
    >
      {/* Header */}
      <header className="mb-10 bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden text-black">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--tenant-accent)] opacity-5 -rotate-12 translate-x-16 -translate-y-16" />
        
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tenant-accent)] mb-1">Imaging Terminal // {mode.toUpperCase()} MODE</p>
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-6 text-black">
          {vin || "NULL_ASSET_ID"}
        </h1>
        
        <div className="space-y-2">
            <div className="flex justify-between items-end text-black">
                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest text-black">Protocol Progress</p>
                <p className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 italic text-white">{Math.round((Object.keys(capturedShots).length / shots.length) * 100)}% COMPLETE</p>
            </div>
            <div className="h-6 w-full bg-zinc-100 border-2 border-black overflow-hidden relative">
                <div 
                    className="h-full bg-[var(--tenant-accent)] transition-all duration-700 ease-out flex items-center justify-end px-2" 
                    style={{ width: `${(Object.keys(capturedShots).length / shots.length) * 100}%` }}
                >
                    <div className="w-1 h-full bg-white/20" />
                </div>
            </div>
            <div className="flex justify-between font-mono text-[9px] font-bold opacity-30 uppercase text-black">
                <span>Phase_Start</span>
                <span>{Object.keys(capturedShots).length} OF {shots.length} ASSETS_RECORDED</span>
                <span>Phase_End</span>
            </div>
        </div>
      </header>

      {/* Shot List */}
      <div className="space-y-4 max-w-4xl mx-auto w-full text-black">
        {shots.map((shot) => {
          const isCaptured = !!capturedShots[shot.id];
          const isExpanded = expandedId === shot.id;

          return (
            <div 
                key={shot.id} 
                id={shot.id}
                className={`bg-white border-4 border-black transition-all group ${
                    isExpanded 
                    ? 'shadow-[8px_8px_0px_0px_var(--tenant-accent)] -translate-x-1 -translate-y-1' 
                    : isCaptured 
                        ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] opacity-80' 
                        : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              <div 
                onClick={() => toggleExpand(shot.id)}
                className="flex items-center justify-between p-4 md:p-6 cursor-pointer text-black"
              >
                <div className="flex items-center gap-6 text-black">
                    {isCaptured ? (
                        <div className="w-16 h-16 border-2 border-black overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <img src={capturedShots[shot.id]} alt={shot.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`w-16 h-16 border-4 border-dashed flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'border-[var(--tenant-accent)] bg-[var(--tenant-accent)] opacity-10' : 'border-black/10'}`}>
                            <Camera className={`w-6 h-6 ${isExpanded ? 'text-[var(--tenant-accent)] animate-pulse' : 'opacity-20'}`} />
                        </div>
                    )}
                    <div>
                        <h3 className={`font-black uppercase italic text-lg md:text-xl tracking-tighter leading-none mb-1 transition-colors ${isCaptured ? 'text-black/40' : 'text-black'}`}>
                            {shot.name}
                        </h3>
                        <p className={`text-[10px] md:text-xs font-bold uppercase tracking-tight transition-opacity ${isCaptured ? 'opacity-20' : 'opacity-50'} text-black`}>
                            {shot.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-black">
                    {isCaptured && (
                        <div className="bg-green-500 text-white p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-black`}>
                        <ChevronDown className={`w-6 h-6 ${isExpanded ? 'text-[var(--tenant-accent)]' : 'opacity-20'}`} />
                    </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 md:p-8 pt-0 border-t-2 border-black/5 bg-zinc-50/50 animate-in fade-in slide-in-from-top-2 text-black">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="relative flex items-center justify-center gap-3 bg-black text-white border-2 border-black p-5 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-[var(--tenant-accent)] hover:border-[var(--tenant-accent)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-1 active:translate-y-1 text-white">
                            <Camera className="w-5 h-5 text-white" />
                            <span>INITIATE_CAPTURE</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                className="hidden" 
                                onChange={(e) => handleCapture(shot.id, e)}
                            />
                        </label>
                        <label className="relative flex items-center justify-center gap-3 bg-white text-black border-4 border-black p-5 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-zinc-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 text-black">
                            <Upload className="w-5 h-5 text-black" />
                            <span>UPLOAD_LOCAL_DISK</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleCapture(shot.id, e)}
                            />
                        </label>
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 bg-white/90 backdrop-blur-md border-t-4 border-black z-[100]">
        <div className="max-w-4xl mx-auto">
            <button
                disabled={!isComplete}
                className={`w-full py-6 md:py-8 font-black uppercase tracking-[0.4em] italic text-sm md:text-lg border-b-8 border-r-8 transition-all relative overflow-hidden ${
                    isComplete 
                    ? 'bg-[var(--tenant-accent)] border-black text-white shadow-2xl hover:-translate-y-1 active:translate-y-1 active:border-b-4 active:border-r-4' 
                    : 'bg-black border-black text-white cursor-not-allowed border-b-8 border-r-8 opacity-[0.85]'
                }`}
            >
                {isComplete ? (
                    <span className="flex items-center justify-center gap-4 text-white">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                        TRANSMIT_INVENTORY_PAYLOAD
                    </span>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase opacity-40 mb-1">
                           [ SECURE_TERMINAL_STANDBY ]
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[var(--tenant-accent)] animate-pulse shadow-[0_0_8px_color-mix(in_srgb,var(--tenant-accent)_80%,transparent)]" />
                            <span className="text-white text-[10px] md:text-xs tracking-[0.2em]">
                                AWAITING_ASSET_ACQUISITION ({Object.keys(capturedShots).length}/{shots.length})
                            </span>
                        </div>
                    </div>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
