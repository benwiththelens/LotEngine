"use client";

import { useState, useEffect, use, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Maximize2, Plus, CheckCircle2, Circle, Clock, Camera, MessageSquare, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { queueOfflineAction, processOfflineQueue } from "@/lib/sync-engine";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ServiceOrder {
  id: string;
  tenant_id: string;
  vehicle_id: string | null;
  customer_name: string;
  status: string;
  priority: 'critical' | 'high' | 'standard' | 'low';
  last_status_change: string;
  requested_completion: string | null;
  assigned_technician_id: string | null;
  parts_cost: number;
  labor_hours: number;
  labor_cost?: number;
  checklists: Array<{ id: string; label: string; completed: boolean }>;
  technician_notes: string;
  is_internal_recon?: boolean;
  vehicles?: {
    year: number;
    make: string;
    model: string;
    vin: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  intake: { label: "Intake", color: "#64748b", bg: "bg-zinc-200", border: "border-zinc-400" },
  diagnostics: { label: "Diagnostics", color: "#3b82f6", bg: "bg-slate-200", border: "border-slate-400" },
  parts_hold: { label: "Awaiting Parts", color: "#f59e0b", bg: "bg-orange-100", border: "border-orange-300" },
  in_progress: { label: "In Progress", color: "#8b5cf6", bg: "bg-stone-200", border: "border-stone-400" },
  ready: { label: "Ready", color: "#10b981", bg: "bg-emerald-100", border: "border-emerald-300" },
};

const KANBAN_ORDER = ['intake', 'diagnostics', 'parts_hold', 'in_progress', 'ready'];

const priorityColors = {
  critical: 'border-l-red-500',
  high: 'border-l-yellow-500',
  standard: 'border-l-green-500',
  low: 'border-l-blue-500'
};

// --- Sub-Component: Droppable Lane ---
function ShopLane({ id, orders, onExpand, width = "w-72" }: { id: string, orders: ServiceOrder[], onExpand: (order: ServiceOrder) => void, width?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const laneOrders = orders.filter(o => o.status === id);
  const config = STATUS_CONFIG[id];

  return (
    <div className={`flex flex-col h-full ${width} shrink-0 p-2 transition-colors border-r-2 border-black/5 ${config.bg}`}>
      <div className={`p-3 mb-4 flex justify-between items-center border-b-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
        <span className="text-[11px] font-black uppercase tracking-widest text-black">{config.label}</span>
        <span className="font-mono text-[10px] font-black bg-black text-white px-2 py-0.5">{laneOrders.length}</span>
      </div>

      <SortableContext items={laneOrders.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div 
          ref={setNodeRef}
          className={`flex-1 space-y-4 overflow-y-auto pb-20 p-1 transition-colors ${
            isOver ? 'bg-black/[0.03]' : ''
          }`}
        >
          {laneOrders.map((order) => (
            <SortableCard key={order.id} order={order} onExpand={onExpand} />
          ))}
          {laneOrders.length === 0 && (
            <div className="border-4 border-dashed border-black/[0.05] p-12 text-center flex items-center justify-center h-40">
                <p className="text-[10px] font-black uppercase opacity-10 tracking-[0.2em] -rotate-12">No Assets</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// --- Sub-Component: Sortable Card ---
function SortableCard({ order, isOverlay = false, onExpand }: { order: ServiceOrder, isOverlay?: boolean, onExpand?: (order: ServiceOrder) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const cardClasses = `bg-white border-2 border-black border-l-4 ${priorityColors[order.priority] || 'border-l-zinc-300'} p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group cursor-grab active:cursor-grabbing transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
    isOverlay ? 'shadow-[16px_16px_0px_0px_color-mix(in srgb, var(--theme-primary) 20%, transparent)] rotate-2 scale-105 ring-4 ring-brand-primary' : ''
  }`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cardClasses}>
      <div className="flex justify-between items-start mb-3 text-black">
        <div className="flex flex-col">
            <p className="text-[9px] font-black uppercase opacity-30 leading-none mb-1 tracking-tighter">Asset #{order.id.slice(0, 5)}</p>
            <h3 className="font-black uppercase italic leading-none text-xl tracking-tighter">{order.customer_name}</h3>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {order.is_internal_recon && <span className="text-[8px] font-black uppercase bg-brand-primary text-white px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">RECON</span>}
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.(order);
            }}
            aria-label="Open Terminal"
            className="p-1.5 hover:bg-black hover:text-white transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {order.vehicles ? (
        <div className="bg-zinc-50 p-2 border border-black/5 mb-4 text-black">
            <p className="text-[10px] font-black uppercase opacity-60 leading-tight">
                {order.vehicles.year} {order.vehicles.make}<br />{order.vehicles.model}
            </p>
        </div>
      ) : (
        <p className="text-[10px] font-bold uppercase text-red-600 italic mb-4">Unlinked Unit</p>
      )}
      
      <div className="mt-auto flex gap-1.5 items-center">
        <div className="flex-1" />
        <p className="font-mono text-[11px] font-black leading-none bg-zinc-100 px-2 py-1 border border-black/5 shadow-sm text-black">${(Number(order.parts_cost || 0) + (Number(order.labor_hours || 0) * 125)).toLocaleString()}</p>
      </div>
    </div>
  );
}

// --- Sub-Component: Terminal Overlay ---
function TerminalOverlay({ 
  order, 
  onClose,
  onUpdate,
  isOnline,
  syncStatus
}: { 
  order: ServiceOrder; 
  onClose: () => void;
  onUpdate: (order: ServiceOrder) => void;
  isOnline: boolean;
  syncStatus: string;
}) {
  const [checklists, setChecklists] = useState(order.checklists || []);
  const [newStep, setNewStep] = useState("");
  const [notes, setNotes] = useState(order.technician_notes || "");
  const [partsCost, setPartsCost] = useState(order.parts_cost?.toString() || "0");
  const [laborHours, setLaborHours] = useState(order.labor_hours?.toString() || "0");
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const logTimerToLabor = async () => {
    const additionalHours = elapsedTime / 3600;
    const currentHours = parseFloat(laborHours) || 0;
    const newTotal = (currentHours + additionalHours).toFixed(2);
    setLaborHours(newTotal);
    setElapsedTime(0);
    setTimerActive(false);
    // This triggers the update to database via the same logic as manual input
    await updateOrderData({ labor_hours: parseFloat(newTotal) });
  };

  const cyclePriority = async () => {
    const priorities: ServiceOrder['priority'][] = ['standard', 'high', 'critical', 'low'];
    const nextIdx = (priorities.indexOf(order.priority) + 1) % priorities.length;
    await updateOrderData({ priority: priorities[nextIdx] });
  };

  const updateOrderData = async (updates: Partial<ServiceOrder>) => {
    // Optimistic UI update
    onUpdate({ ...order, ...updates });

    if (!isOnline) {
      queueOfflineAction('update', updates, order.id, 'service_orders');
      return;
    }

    const { error } = await supabase.from("service_orders").update(updates).eq("id", order.id);
    if (error) {
      alert("Failed to update: " + error.message);
    }
  };

  const updateDatabase = async (newChecklists: typeof checklists) => {
    await updateOrderData({ checklists: newChecklists });
  };

  const handleToggle = async (id: string) => {
    const newChecklists = checklists.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    setChecklists(newChecklists);
    await updateDatabase(newChecklists);
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    const newChecklists = [...checklists, { id: crypto.randomUUID(), label: newStep.trim(), completed: false }];
    setChecklists(newChecklists);
    setNewStep("");
    await updateDatabase(newChecklists);
  };

  const currentIndex = KANBAN_ORDER.indexOf(order.status);
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-[4px] z-[100] flex items-center justify-center p-0 md:p-8">
      <div className="bg-white md:border-4 border-black w-full h-full max-w-7xl flex flex-col shadow-none md:shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Terminal Header */}
        <header className="p-4 md:p-6 border-b-4 border-black flex justify-between items-center bg-zinc-50 shrink-0 text-black">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={onClose}
              title="Close Terminal"
              className="group flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px] shadow-brand-primary hover:bg-brand-primary hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span className="text-2xl md:text-3xl font-black">×</span>
            </button>
            
            <div className="h-10 md:h-12 w-1 bg-black/10 hidden xs:block" />
            
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none">
                  {order.vehicles ? `${order.vehicles.year} ${order.vehicles.make} ${order.vehicles.model}` : 'Unlinked Asset'}
                </h2>
                {/* Priority Badge */}
                <button 
                  onClick={cyclePriority}
                  title="Cycle Priority"
                  className={`w-fit px-2 md:px-3 py-0.5 md:py-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:brightness-110 transition-all ${
                  order.priority === 'critical' ? 'bg-red-500 text-white' :
                  order.priority === 'high' ? 'bg-yellow-500 text-black' :
                  order.priority === 'standard' ? 'bg-green-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {order.priority}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="font-mono text-[10px] md:text-xs font-bold opacity-60 uppercase tracking-tight">CUSTOMER: {order.customer_name}</p>
                {order.requested_completion && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                    <p className="font-mono text-[10px] md:text-xs font-bold text-brand-primary uppercase">ETA: {new Date(order.requested_completion).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-6 text-right">
            {elapsedTime > 0 && (
                <div className="bg-black text-white px-4 py-2 border-2 border-white shadow-[4px_4px_0px_0px] shadow-brand-primary animate-in slide-in-from-right-4">
                    <p className="text-[8px] font-black uppercase opacity-50 text-white">Active Session</p>
                    <p className="font-mono text-xl font-black text-white">{formatTime(elapsedTime)}</p>
                </div>
            )}
            <div>
                <p className="text-[10px] font-black uppercase opacity-40 leading-none mb-1 text-black">Asset Identifier</p>
                <p className="font-mono text-sm font-black uppercase text-black">{order.vehicles?.vin || `ID: ${order.id.slice(0, 8)}`}</p>
            </div>
          </div>
        </header>

        {/* Timeline */}
        <div className="border-b-4 border-black bg-white p-3 md:p-6 shrink-0 overflow-x-auto">
          <div className="flex items-center justify-between relative min-w-[500px] max-w-4xl mx-auto text-black">
             <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 md:h-1 bg-zinc-200 -z-10" />
             {KANBAN_ORDER.map((statusId, index) => {
               const config = STATUS_CONFIG[statusId];
               const isActive = statusId === order.status;
               const isPast = index <= currentIndex;
               
               return (
                 <button 
                   key={statusId} 
                   onClick={() => !isActive && updateOrderData({ status: statusId })}
                   className="flex flex-col items-center gap-1 md:gap-2 bg-white px-2 md:px-4 group outline-none"
                 >
                   <div className={`w-6 h-6 md:w-8 md:h-8 border-2 md:border-4 flex items-center justify-center transition-all duration-300 ${
                     isActive ? 'border-brand-primary bg-brand-primary text-white scale-110 md:scale-125 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' :
                     isPast ? 'border-black bg-black text-white group-hover:bg-brand-primary group-hover:border-brand-primary' :
                     'border-zinc-300 bg-zinc-100 text-transparent group-hover:border-black'
                   }`}>
                     {isPast && !isActive && <CheckCircle2 className="w-3 h-3 md:w-5 md:h-5 text-white" />}
                     {isActive && <div className="w-2 h-2 md:w-3 md:h-3 bg-white animate-pulse" />}
                   </div>
                   <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${
                     isActive ? 'text-brand-primary' :
                     isPast ? 'text-black group-hover:text-brand-primary' :
                     'text-zinc-400 group-hover:text-black'
                   }`}>{config.label}</span>
                 </button>
               )
             })}
          </div>
        </div>

        {/* Main Terminal Body */}
        <div className="flex-1 overflow-auto p-3 md:p-12 bg-zinc-100 flex flex-col lg:flex-row gap-6 md:gap-8">
            <div className="flex-1 space-y-6 md:space-y-8 max-w-3xl text-black">
                {/* Checklists */}
                <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter border-b-2 border-black pb-3 md:pb-4 mb-4 md:mb-6 text-black">Procedure Checklist</h3>
                    
                    <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                        {checklists.map((step) => (
                            <div 
                                key={step.id} 
                                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border-2 transition-all cursor-pointer group ${
                                    step.completed ? 'border-zinc-200 bg-zinc-50 opacity-60' : 'border-black bg-white hover:bg-zinc-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5'
                                }`}
                                onClick={() => handleToggle(step.id)}
                            >
                                <button type="button" className="shrink-0 transition-transform group-hover:scale-110">
                                    {step.completed ? (
                                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
                                    ) : (
                                        <Circle className="w-5 h-5 md:w-6 md:h-6 text-zinc-300 group-hover:text-black" />
                                    )}
                                </button>
                                <span className={`font-mono text-xs md:text-sm font-bold uppercase transition-all ${step.completed ? 'line-through text-zinc-500' : 'text-black'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                        {checklists.length === 0 && (
                            <p className="text-xs md:text-sm font-mono opacity-50 italic text-center py-6 md:py-8 text-black">No procedures defined.</p>
                        )}
                    </div>

                    <form onSubmit={handleAddStep} className="flex gap-2">
                        <input
                            type="text"
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            placeholder="ADD PROCEDURE..."
                            className="flex-1 border-2 border-black p-3 md:p-4 font-mono text-xs md:text-sm font-bold uppercase outline-none focus:border-brand-primary focus:shadow-[4px_4px_0px_0px_color-mix(in srgb, var(--theme-primary) 20%, transparent)] transition-all text-black"
                        />
                        <button type="submit" className="bg-black text-white px-6 md:px-8 py-3 md:py-4 hover:bg-brand-primary transition-colors flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </button>
                    </form>
                </div>

                {/* Cost Inputs */}
                <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] grid grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label className="block text-[8px] md:text-[10px] font-black uppercase mb-1 md:mb-2 tracking-widest opacity-50 text-black">Parts Cost ($)</label>
                        <input 
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border-2 border-black p-3 md:p-4 font-mono font-black text-lg md:text-xl outline-none focus:border-brand-primary focus:shadow-[4px_4px_0px_0px_color-mix(in srgb, var(--theme-primary) 20%, transparent)] transition-all text-black" 
                            value={partsCost}
                            onChange={(e) => setPartsCost(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => updateOrderData({ parts_cost: parseFloat(partsCost) || 0 })}
                        />
                    </div>
                    <div>
                        <label className="block text-[8px] md:text-[10px] font-black uppercase mb-1 md:mb-2 tracking-widest opacity-50 text-black">Labor Hours</label>
                        <input 
                            type="number"
                            min="0"
                            step="0.1"
                            className="w-full border-2 border-black p-3 md:p-4 font-mono font-black text-lg md:text-xl outline-none focus:border-brand-primary focus:shadow-[4px_4px_0px_0px_color-mix(in srgb, var(--theme-primary) 20%, transparent)] transition-all text-black" 
                            value={laborHours}
                            onChange={(e) => setLaborHours(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => updateOrderData({ labor_hours: parseFloat(laborHours) || 0 })}
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-6 md:gap-8 text-black">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="flex flex-col gap-2">
                        <button 
                            type="button" 
                            onClick={() => setTimerActive(!timerActive)}
                            className={`w-full border-2 border-black p-3 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none group ${timerActive ? 'bg-red-500 text-white border-white animate-pulse' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                        >
                            <Clock className={`w-5 h-5 md:w-6 md:h-6 ${timerActive ? 'text-white' : 'group-hover:animate-pulse'}`} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{timerActive ? 'STOP' : 'START'} TIMER</span>
                        </button>
                        {elapsedTime > 0 && (
                            <div className="flex gap-1 animate-in fade-in zoom-in-95">
                                <button 
                                    onClick={logTimerToLabor}
                                    className="flex-1 bg-green-500 text-white text-[8px] font-black p-1 uppercase border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white"
                                >
                                    Log
                                </button>
                                <button 
                                    onClick={() => { setElapsedTime(0); setTimerActive(false); }}
                                    className="bg-zinc-200 text-black text-[8px] font-black p-1 uppercase border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>
                    <button type="button" className="h-full bg-white border-2 border-black p-3 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2 hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none group text-black">
                        <Camera className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Photo</span>
                    </button>
                </div>

                {/* Notes */}
                <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
                    <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter border-b-2 border-black pb-3 md:pb-4 mb-3 md:mb-4 text-black">Notes</h3>
                    <textarea 
                        className="w-full flex-1 min-h-[150px] border-none resize-none font-mono text-xs md:text-sm bg-transparent outline-none text-zinc-700" 
                        placeholder="ENTER NOTES HERE..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={() => updateOrderData({ technician_notes: notes })}
                    />
                </div>
            </div>
        </div>

        {/* Smart Footer */}
        <footer className="p-4 md:p-6 border-t-4 border-black bg-white flex justify-between items-center shrink-0 text-black">
            <div className="flex items-center gap-2 md:gap-4">
                <div className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-colors duration-300 ${
                    !isOnline ? 'bg-brand-primary animate-pulse' :
                    syncStatus === 'saving' ? 'bg-yellow-400 animate-pulse' :
                    syncStatus === 'error' ? 'bg-red-600' :
                    'bg-green-500'
                }`} />
                <span className="font-mono text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-50 text-black">
                    {!isOnline ? 'OFFLINE QUEUE' :
                     syncStatus === 'saving' ? 'SYNCING TO CLOUD' :
                     syncStatus === 'error' ? 'SYNC ERROR' :
                     'CLOUD DATABASE SYNCED'}
                </span>
            </div>
            
            {currentIndex < KANBAN_ORDER.length - 1 ? (
                <button 
                    onClick={async () => {
                        const nextStatus = KANBAN_ORDER[currentIndex + 1];
                        await updateOrderData({ status: nextStatus });
                        onClose();
                    }}
                    className="bg-brand-primary text-white px-6 md:px-12 py-3 md:py-5 font-black uppercase tracking-widest text-[10px] md:text-sm hover:bg-black transition-all border-b-4 border-r-4 border-black/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:translate-x-1 active:shadow-none flex items-center gap-2 md:gap-4 group text-white"
                >
                    <span className="hidden xs:inline">Move to </span>{STATUS_CONFIG[KANBAN_ORDER[currentIndex + 1]].label}
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform text-white" />
                </button>
            ) : (
                <button 
                    onClick={onClose}
                    className="bg-zinc-800 text-white px-8 md:px-12 py-3 md:py-5 font-black uppercase tracking-widest text-[10px] md:text-sm hover:bg-black transition-all border-b-4 border-r-4 border-black/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:translate-x-1 active:shadow-none text-white"
                >
                    Close Terminal
                </button>
            )}
        </footer>
      </div>
    </div>
  );
}

export default function ServiceBay({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: host } = use(params);
  const pathname = usePathname();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showIntake, setShowIntake] = useState(false);
  const [terminal, setTerminal] = useState<{ isOpen: boolean; order: ServiceOrder | null }>({ isOpen: false, order: null });
  const [isOnline, setIsOnline] = useState(() => typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const processQueue = useCallback(async () => {
    setSyncStatus('saving');
    await processOfflineQueue(() => {
        setSyncStatus('saved');
        fetchOrders();
    });
  }, [host]); // fetchOrders is defined later but it's okay because of hoisting or if I move it.

  useEffect(() => {
    const hO = () => { setIsOnline(true); processQueue(); };
    const hOff = () => setIsOnline(false);
    window.addEventListener('online', hO); 
    window.addEventListener('offline', hOff);
    
    return () => {
      window.removeEventListener('online', hO);
      window.removeEventListener('offline', hOff);
    };
  }, [processQueue]);

  const [customerName, setCustomerName] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function fetchOrders() {
    let { data: tenant } = await supabase.from("tenants").select("id").eq("domain", host).single();
    if (!tenant) {
      const { data: fallback } = await supabase.from("tenants").select("id").limit(1).single();
      tenant = fallback;
    }
    if (tenant) {
      const { data } = await supabase.from("service_orders").select("*, vehicles(year, make, model, vin)").eq("tenant_id", tenant.id).order("created_at", { ascending: true });
      if (data) setOrders(data as ServiceOrder[]);
    }
  }

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel("service_orders_shop").on("postgres_changes", { event: "*", schema: "public", table: "service_orders" }, () => fetchOrders()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [host]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeOrder = orders.find(o => o.id === active.id);
    if (!activeOrder) return;

    let newStatus = activeOrder.status;
    if (STATUS_CONFIG[over.id as string]) {
      newStatus = over.id as string;
    } else {
      const overOrder = orders.find(o => o.id === over.id);
      if (overOrder) newStatus = overOrder.status;
    }

    if (activeOrder.status !== newStatus) {
      setOrders(prev => prev.map(o => o.id === active.id ? { ...o, status: newStatus } : o));
    }
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const activeOrder = orders.find(o => o.id === active.id);
    if (!activeOrder) return;
    const newStatus = STATUS_CONFIG[over.id as string] ? (over.id as string) : (orders.find(o => o.id === over.id)?.status || activeOrder.status);

    if (activeOrder.status === newStatus) return;

    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === active.id ? { ...o, status: newStatus } : o));

    if (!isOnline) {
      queueOfflineAction('update', { status: newStatus }, active.id as string, 'service_orders');
      return;
    }

    const { error } = await supabase.from("service_orders").update({ status: newStatus }).eq("id", active.id);
    if (error) { alert(error.message); fetchOrders(); }
  };

  async function handleIntake(e: React.FormEvent) {
    e.preventDefault();
    let { data: tenant } = await supabase.from("tenants").select("id").eq("domain", host).single();
    if (!tenant) {
      const { data: fallback } = await supabase.from("tenants").select("id").limit(1).single();
      tenant = fallback;
    }
    if (!tenant) return;
    const { data: vehicle } = await supabase.from("vehicles").select("id").eq("vin", vehicleVin.toUpperCase()).single();
    const { error } = await supabase.from("service_orders").insert({
      tenant_id: tenant.id, customer_name: customerName, vehicle_id: vehicle?.id || null, status: "intake"
    });
    if (!error) { setShowIntake(false); setCustomerName(""); setVehicleVin(""); fetchOrders(); }
  }

  const activeOrder = activeId ? orders.find(o => o.id === activeId) : null;

  const handleExpand = (order: ServiceOrder) => {
    setTerminal({ isOpen: true, order });
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden text-black font-sans">
      <header className="p-4 md:p-6 bg-white border-b-4 border-black flex justify-between items-center z-20 shrink-0 shadow-sm text-black font-sans">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1 text-brand-primary">Service Bay Hub</p>
          <h1 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter leading-none text-black">Kanban Grid</h1>
        </div>

        <button onClick={() => setShowIntake(true)} className="bg-black text-white px-6 py-3 md:px-10 md:py-4 font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-brand-primary transition-all border-b-4 border-r-4 border-black/30 shadow-xl active:translate-y-1 active:border-none text-white">
          Intake Asset
        </button>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 md:gap-6 h-full overflow-x-auto pb-4">
              {KANBAN_ORDER.map(id => (
                  <ShopLane 
                      key={id} 
                      id={id} 
                      orders={orders} 
                      onExpand={handleExpand}
                      width="w-72 md:w-80"
                  />
              ))}
          </div>

          <DragOverlay adjustScale={false}>
            {activeId && activeOrder ? <SortableCard order={activeOrder} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {terminal.isOpen && terminal.order && (
        <TerminalOverlay 
          order={terminal.order} 
          onClose={() => setTerminal({ isOpen: false, order: null })} 
          onUpdate={(updatedOrder) => {
            setTerminal({ isOpen: true, order: updatedOrder });
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          }}
          isOnline={isOnline}
          syncStatus={syncStatus}
        />
      )}

      {showIntake && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4 text-black">
          <div className="bg-white border-4 border-black w-full max-w-lg p-10 shadow-[20px_20px_0px_0px] shadow-brand-primary">
            <div className="flex justify-between items-start mb-8 text-black">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1 text-brand-primary font-sans">Authorization Pending</p>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-black">Job Intake</h2>
              </div>
              <button onClick={() => setShowIntake(false)} className="text-3xl font-black hover:text-brand-primary transition-colors text-black">×</button>
            </div>
            <form onSubmit={handleIntake} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 tracking-widest opacity-50 text-black">Customer Authority</label>
                <input autoFocus required className="w-full border-4 border-black p-4 font-black uppercase text-xl outline-none focus:ring-4 focus:ring-brand-primary/20 text-black" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 tracking-widest opacity-50 text-black">Asset VIN Signature</label>
                <input placeholder="17-DIGIT VIN" className="w-full border-4 border-black p-4 font-mono font-black uppercase text-xl outline-none focus:ring-4 focus:ring-brand-primary/20 text-black" value={vehicleVin} onChange={(e) => setVehicleVin(e.target.value)} maxLength={17} />
              </div>
              <button type="submit" className="w-full bg-black text-white py-5 font-black uppercase tracking-widest text-sm hover:bg-brand-primary transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] text-white">Open Service Ticket</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
