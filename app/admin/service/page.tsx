"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ViewMode = 'shop' | 'kanban';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; type: 'lane' | 'lift' }> = {
  intake: { label: "Intake Lane", color: "#64748b", type: 'lane' },
  lift_1: { label: "Lift 01", color: "#3b82f6", type: 'lift' },
  lift_2: { label: "Lift 02", color: "#8b5cf6", type: 'lift' },
  parts_hold: { label: "Parts Hold", color: "#f59e0b", type: 'lane' },
  ready: { label: "Ready / Pickup", color: "#10b981", type: 'lane' },
};

const KANBAN_ORDER = ['intake', 'lift_1', 'lift_2', 'parts_hold', 'ready'];

// --- Sub-Component: Industrial Lift Graphic ---
function LiftGraphic({ color, isOccupied }: { color: string, isOccupied: boolean }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {/* Hydraulic Columns */}
            <div className="absolute left-4 top-10 bottom-10 w-8 bg-black border-r-4 border-black/20" />
            <div className="absolute right-4 top-10 bottom-10 w-8 bg-black border-l-4 border-black/20" />
            
            {/* Safety Yellow Warning Stripes at bottom of columns */}
            <div className="absolute left-4 bottom-10 w-8 h-4 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#000_10px,#000_20px)]" />
            <div className="absolute right-4 bottom-10 w-8 h-4 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#000_10px,#000_20px)]" />

            {/* Cross Beam (Moves if occupied?) */}
            <div className={`absolute left-4 right-4 h-12 border-y-4 border-black transition-all duration-700 ${isOccupied ? 'top-1/3' : 'bottom-20'}`} style={{ backgroundColor: color }}>
                <div className="flex justify-between px-4 items-center h-full">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <div className="font-mono text-[8px] font-black text-white uppercase tracking-widest">Hydraulic System Active</div>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
            </div>

            {/* Floor Bolt Plates */}
            <div className="absolute left-2 bottom-6 w-12 h-4 bg-black/40 skew-x-12" />
            <div className="absolute right-2 bottom-6 w-12 h-4 bg-black/40 -skew-x-12" />
        </div>
    );
}

// --- Sub-Component: Droppable Lift ---
function ShopLift({ id, label, color, orders }: { id: string, label: string, color: string, orders: ServiceOrder[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const orderOnLift = orders.find(o => o.status === id);

  return (
    <div 
      ref={setNodeRef}
      className={`relative flex-1 min-h-[320px] border-4 border-black p-8 transition-all flex flex-col items-center justify-center ${
        isOver ? 'bg-zinc-200' : 'bg-white'
      } shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}
    >
      <LiftGraphic color={color} isOccupied={!!orderOnLift} />

      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-black rotate-45" style={{ backgroundColor: color }} />
        <span className="font-mono text-3xl font-black italic tracking-tighter uppercase text-black drop-shadow-sm">{label}</span>
      </div>

      {orderOnLift ? (
        <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-500">
            <SortableCard order={orderOnLift} />
        </div>
      ) : (
        <div className="text-center opacity-30 select-none pointer-events-none z-0">
            <p className="text-7xl font-black italic uppercase tracking-tighter leading-none mb-1 text-zinc-300">Vacant</p>
            <p className="font-mono text-xs font-black uppercase tracking-[0.3em]">Bay {id.replace('lift_', '0')}</p>
        </div>
      )}

      {/* Industrial Overlay Details */}
      <div className="absolute bottom-4 right-4 font-mono text-[8px] font-black opacity-20 uppercase">
        Max Load 12,000 LBS // LotEngine OS
      </div>
    </div>
  );
}

// --- Sub-Component: Droppable Lane ---
function ShopLane({ id, label, color, orders, width = "w-72" }: { id: string, label: string, color: string, orders: ServiceOrder[], width?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const laneOrders = orders.filter(o => o.status === id);

  return (
    <div className={`flex flex-col h-full ${width} shrink-0`}>
      <div className="bg-black text-white p-3 mb-4 flex justify-between items-center border-b-4" style={{ borderColor: color }}>
        <span className="text-[10px] font-black uppercase tracking-widest italic">{label}</span>
        <span className="font-mono text-[10px] opacity-60 bg-white/10 px-2 rounded-full">{laneOrders.length}</span>
      </div>

      <SortableContext items={laneOrders.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div 
          ref={setNodeRef}
          className={`flex-1 space-y-4 overflow-y-auto pb-20 p-2 transition-colors rounded-lg border-2 border-transparent ${
            isOver ? 'bg-black/[0.05] border-black/5' : 'bg-transparent'
          }`}
        >
          {laneOrders.map((order) => (
            <SortableCard key={order.id} order={order} />
          ))}
          {laneOrders.length === 0 && (
            <div className="border-4 border-dashed border-black/[0.03] rounded-lg p-12 text-center flex items-center justify-center h-40">
                <p className="text-[10px] font-black uppercase opacity-10 tracking-[0.2em] -rotate-12">No Assets</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// --- Sub-Component: Sortable Card ---
function SortableCard({ order, isOverlay = false }: { order: ServiceOrder, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const cardClasses = `bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group cursor-grab active:cursor-grabbing transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
    isOverlay ? 'shadow-[16px_16px_0px_0px_rgba(227,66,52,0.2)] rotate-2 scale-105 ring-4 ring-brand-primary' : ''
  }`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cardClasses}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
            <p className="text-[9px] font-black uppercase opacity-30 leading-none mb-1 tracking-tighter">Asset #{order.id.slice(0, 5)}</p>
            <h3 className="font-black uppercase italic leading-none text-xl tracking-tighter">{order.customer_name}</h3>
        </div>
        {order.is_internal_recon && <span className="text-[8px] font-black uppercase bg-brand-primary text-white px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">RECON</span>}
      </div>
      
      {order.vehicles ? (
        <div className="bg-zinc-50 p-2 border border-black/5 mb-4">
            <p className="text-[10px] font-black uppercase opacity-60 leading-tight">
                {order.vehicles.year} {order.vehicles.make}<br />{order.vehicles.model}
            </p>
        </div>
      ) : (
        <p className="text-[10px] font-bold uppercase text-red-600 italic mb-4">Unlinked Unit</p>
      )}
      
      <div className="mt-auto flex gap-1.5 items-center">
        <div className="flex gap-1">
            {KANBAN_ORDER.map((key, idx) => {
                const currentIdx = KANBAN_ORDER.indexOf(order.status);
                const active = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                    <div key={key} className={`w-2.5 h-2.5 border transition-all ${isCurrent ? 'border-black' : 'border-black/5'}`}
                         style={{ 
                            backgroundColor: active ? STATUS_CONFIG[key].color : 'transparent',
                            borderRadius: isCurrent ? '0px' : '50%' 
                         }} />
                );
            })}
        </div>
        <div className="flex-1" />
        <p className="font-mono text-[11px] font-black leading-none bg-zinc-100 px-2 py-1 border border-black/5 shadow-sm">${(Number(order.parts_cost || 0) + Number(order.labor_cost || 0)).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function ServiceBay() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showIntake, setShowIntake] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('shop');
  
  const [customerName, setCustomerName] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel("service_orders_shop").on("postgres_changes", { event: "*", schema: "public", table: "service_orders" }, () => fetchOrders()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchOrders() {
    let { data: tenant } = await supabase.from("tenants").select("id").eq("domain", typeof window !== 'undefined' ? window.location.host : '').single();
    if (!tenant) {
      const { data: fallback } = await supabase.from("tenants").select("id").limit(1).single();
      tenant = fallback;
    }
    if (tenant) {
      const { data } = await supabase.from("service_orders").select("*, vehicles(year, make, model, vin)").eq("tenant_id", tenant.id).order("created_at", { ascending: true });
      if (data) setOrders(data);
    }
  }

  const handleDragStart = (e: any) => setActiveId(e.active.id);

  const handleDragOver = (e: any) => {
    const { active, over } = e;
    if (!over) return;
    const activeOrder = orders.find(o => o.id === active.id);
    if (!activeOrder) return;

    let newStatus = activeOrder.status;
    if (STATUS_CONFIG[over.id]) {
      newStatus = over.id;
    } else {
      const overOrder = orders.find(o => o.id === over.id);
      if (overOrder) newStatus = overOrder.status;
    }

    if (activeOrder.status !== newStatus) {
      setOrders(prev => prev.map(o => o.id === active.id ? { ...o, status: newStatus } : o));
    }
  };

  const handleDragEnd = async (e: any) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const activeOrder = orders.find(o => o.id === active.id);
    const newStatus = STATUS_CONFIG[over.id] ? over.id : (orders.find(o => o.id === over.id)?.status || activeOrder.status);

    const { error } = await supabase.from("service_orders").update({ status: newStatus }).eq("id", active.id);
    if (error) { alert(error.message); fetchOrders(); }
  };

  async function handleIntake(e: React.FormEvent) {
    e.preventDefault();
    let { data: tenant } = await supabase.from("tenants").select("id").eq("domain", typeof window !== 'undefined' ? window.location.host : '').single();
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

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      <header className="p-6 bg-white border-b-4 border-black flex justify-between items-center z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Service Bay Hub</p>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-black">
                {viewMode === 'shop' ? 'Shop Floor' : 'Kanban Grid'}
            </h1>
          </div>
          <div className="h-10 w-[2px] bg-black/10" />
          
          <div className="flex border-2 border-black p-1 bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
             <button 
                onClick={() => setViewMode('shop')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'shop' ? 'bg-black text-white shadow-inner' : 'text-black opacity-40 hover:opacity-100'}`}
             >
                Spatial
             </button>
             <button 
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-black text-white shadow-inner' : 'text-black opacity-40 hover:opacity-100'}`}
             >
                Grid
             </button>
          </div>
        </div>

        <button onClick={() => setShowIntake(true)} className="bg-black text-white px-10 py-4 font-black uppercase tracking-widest text-xs hover:bg-brand-primary transition-all border-b-4 border-r-4 border-black/30 shadow-xl active:translate-y-1 active:border-none">
          Confirm Intake
        </button>
      </header>

      <main className="flex-1 p-8 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          
          {viewMode === 'shop' ? (
            <div className="flex gap-10 h-full">
                <ShopLane id="intake" label={STATUS_CONFIG.intake.label} color={STATUS_CONFIG.intake.color} orders={orders} width="w-80" />
                
                <div className="flex-1 flex flex-col gap-10">
                    <ShopLift id="lift_1" label={STATUS_CONFIG.lift_1.label} color={STATUS_CONFIG.lift_1.color} orders={orders} />
                    <ShopLift id="lift_2" label={STATUS_CONFIG.lift_2.label} color={STATUS_CONFIG.lift_2.color} orders={orders} />
                </div>
                
                <div className="flex flex-col gap-10">
                    <ShopLane id="parts_hold" label={STATUS_CONFIG.parts_hold.label} color={STATUS_CONFIG.parts_hold.color} orders={orders} />
                    <ShopLane id="ready" label={STATUS_CONFIG.ready.label} color={STATUS_CONFIG.ready.color} orders={orders} />
                </div>
            </div>
          ) : (
            <div className="flex gap-6 h-full overflow-x-auto pb-4">
                {KANBAN_ORDER.map(id => (
                    <ShopLane 
                        key={id} 
                        id={id} 
                        label={STATUS_CONFIG[id].label} 
                        color={STATUS_CONFIG[id].color} 
                        orders={orders} 
                        width="w-80"
                    />
                ))}
            </div>
          )}

          <DragOverlay adjustScale={false}>
            {activeId && activeOrder ? <SortableCard order={activeOrder} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {showIntake && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black w-full max-w-lg p-10 shadow-[20px_20px_0px_0px_rgba(227,66,52,1)]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Authorization Pending</p>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-black">Job Intake</h2>
              </div>
              <button onClick={() => setShowIntake(false)} className="text-3xl font-black hover:text-brand-primary transition-colors">×</button>
            </div>
            <form onSubmit={handleIntake} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 tracking-widest opacity-50">Customer Authority</label>
                <input autoFocus required className="w-full border-4 border-black p-4 font-black uppercase text-xl outline-none focus:ring-4 focus:ring-brand-primary/20" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 tracking-widest opacity-50">Asset VIN Signature</label>
                <input placeholder="17-DIGIT VIN" className="w-full border-4 border-black p-4 font-mono font-black uppercase text-xl outline-none focus:ring-4 focus:ring-brand-primary/20" value={vehicleVin} onChange={(e) => setVehicleVin(e.target.value)} maxLength={17} />
              </div>
              <button type="submit" className="w-full bg-black text-white py-5 font-black uppercase tracking-widest text-sm hover:bg-brand-primary transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">Open Service Ticket</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
