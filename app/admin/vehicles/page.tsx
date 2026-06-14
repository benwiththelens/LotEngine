"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { decodeVin } from "@/lib/vin-service";
import { lookupPlate } from "@/lib/plate-service";
import { supabase } from "@/lib/supabase";

const COMMON_FEATURES = ["Leather", "Sunroof", "Navigation", "Bluetooth", "Backup Camera", "Heated Seats", "3rd Row", "Towing Pkg", "Apple CarPlay", "Premium Sound"];
const DRIVETRAINS = ["FWD", "RWD", "AWD", "4x4", "4x2"];
const FUEL_TYPES = ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];

interface Vehicle {
  id: string;
  vin: string;
  year: string | number;
  make: string;
  model: string;
  trim: string;
  engine: string;
  drivetrain: string;
  fuel_type: string;
  ev_range: string | number;
  ev_battery: string | number;
  condition: string;
  features: string[];
  price: string | number;
  mileage: string | number;
  status: string;
  lot_location: string;
  public_description: string;
  exterior_color: string;
  interior_color: string;
  created_at: string;
  tenant_id?: string;
  processed_by?: string;
  plate?: string;
  state?: string;
  initiate_recon?: boolean;
}

interface TerminalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  activeStep: number;
  entryType: 'vin' | 'plate';
  id: string | null;
}

export default function VehicleInventory() {
  const [inventory, setInventory] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminal, setTerminal] = useState<TerminalState>({ isOpen: false, mode: 'add', activeStep: 1, entryType: 'vin', id: null });
  const [isDecoding, setIsDecoding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isOnline, setIsOnline] = useState(() => typeof window !== 'undefined' ? window.navigator.onLine : true);
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    vin: "", year: "", make: "", model: "", trim: "", engine: "", drivetrain: "FWD",
    fuel_type: "Gasoline", ev_range: "", ev_battery: "", condition: "Good", features: [],
    price: "", mileage: "", status: "available", lot_location: "RECEIVING",
    public_description: "", exterior_color: "", interior_color: "",
    plate: "", state: "NE", initiate_recon: true
  });

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    const { data: tenant } = await supabase.from("tenants").select("id").eq("domain", typeof window !== 'undefined' ? window.location.host : '').single();
    if (tenant) {
      const { data } = await supabase.from("vehicles").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
      if (data) setInventory(data as Vehicle[]);
    }
    setLoading(false);
  }, []);

  const refreshInventoryQuietly = useCallback(async () => {
    const { data: tenant } = await supabase.from("tenants").select("id").eq("domain", typeof window !== 'undefined' ? window.location.host : '').single();
    const { data } = await supabase.from("vehicles").select("*").eq("tenant_id", tenant?.id).order("created_at", { ascending: false });
    if (data) setInventory(data as Vehicle[]);
  }, []);

  const processOfflineQueue = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem('lotengine_sync_queue') || '[]');
    if (queue.length === 0) return;
    setSyncStatus('saving');
    for (const item of queue) {
      if (item.action === 'update' && item.id) await supabase.from("vehicles").update(item.payload).eq("id", item.id);
      else if (item.action === 'insert') await supabase.from("vehicles").insert(item.id ? { ...item.payload, id: item.id } : item.payload);
    }
    localStorage.removeItem('lotengine_sync_queue');
    setSyncStatus('saved'); 
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const hO = () => { setIsOnline(true); processOfflineQueue(); };
    const hOff = () => setIsOnline(false);
    window.addEventListener('online', hO); 
    window.addEventListener('offline', hOff);
    
    const init = async () => {
      await fetchInventory();
    };
    init();

    return () => {
      window.removeEventListener('online', hO);
      window.removeEventListener('offline', hOff);
    };
  }, [fetchInventory, processOfflineQueue]);

  const [now] = useState(() => Date.now());

  const inventoryWithMetrics = useMemo(() => {
    return inventory.map(v => ({
      ...v,
      age: Math.floor((now - new Date(v.created_at).getTime()) / 86400000),
      audit: [!v.price && "PRICE", !v.exterior_color && "COLOR", !v.public_description && "DESC", v.status==='draft' && "DRAFT"].filter(Boolean) as string[]
    }));
  }, [inventory, now]);

  const sanitizePayload = (data: Partial<Vehicle>) => {
    const p = { ...data };
    const toNum = (val: string | number | undefined | null) => (val === "" || val === null || val === undefined || isNaN(Number(val))) ? null : Number(val);
    p.year = toNum(p.year); 
    p.price = toNum(p.price); 
    p.mileage = toNum(p.mileage);
    p.ev_range = toNum(p.ev_range); 
    p.ev_battery = toNum(p.ev_battery);
    
    delete p.plate; 
    delete p.state; 
    delete p.initiate_recon; 
    delete p.id;
    
    if (p.vin) p.vin = p.vin.toUpperCase();
    return p;
  };

  const queueOfflineAction = (action: 'insert' | 'update', payload: Partial<Vehicle>, id: string | null) => {
    const queue = JSON.parse(localStorage.getItem('lotengine_sync_queue') || '[]');
    queue.push({ action, payload, id, ts: Date.now() });
    localStorage.setItem('lotengine_sync_queue', JSON.stringify(queue));
    setSyncStatus('saved');
  };

  useEffect(() => {
    if (!terminal.isOpen || terminal.activeStep !== 2 || !terminal.id) return;
    const handler = setTimeout(async () => {
      setSyncStatus('saving');
      const payload = sanitizePayload(formData);
      if (!isOnline) { queueOfflineAction('update', payload, terminal.id); return; }
      const { error } = await supabase.from("vehicles").update(payload).eq("id", terminal.id);
      if (error) setSyncStatus('error');
      else { setSyncStatus('saved'); refreshInventoryQuietly(); }
    }, 1000);
    return () => clearTimeout(handler);
  }, [formData, terminal.id, terminal.isOpen, terminal.activeStep, isOnline, refreshInventoryQuietly]);

  const validateStage1 = () => {
    const e: Record<string, string> = {};
    if (terminal.entryType === 'vin' && (formData.vin?.length !== 17)) e.vin = "INVALID: 17 characters required.";
    if (terminal.entryType === 'plate' && !formData.plate) e.plate = "MISSING: Enter plate.";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const validateStage2 = () => {
    const e: Record<string, string> = {};
    if (!formData.price || Number(formData.price) <= 0) e.price = "PRICE ERROR: Valid price required.";
    if (!formData.mileage || Number(formData.mileage) < 0) e.mileage = "MILES ERROR: Valid mileage required.";
    if (!formData.exterior_color) e.exterior_color = "DATA ERROR: Exterior color required.";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openAddTerminal = () => {
    setFormData({ vin: "", year: "", make: "", model: "", trim: "", engine: "", drivetrain: "FWD", fuel_type: "Gasoline", ev_range: "", ev_battery: "", condition: "Good", features: [], price: "", mileage: "", status: "available", lot_location: "RECEIVING", public_description: "", exterior_color: "", interior_color: "", plate: "", state: "NE", initiate_recon: true });
    setTerminal({ isOpen: true, mode: 'add', activeStep: 1, entryType: 'vin', id: null });
    setErrors({}); setSyncStatus('idle');
  };
  
  const openEditTerminal = (v: Vehicle) => { 
    setFormData({ ...v, plate: "", state: "NE", initiate_recon: false }); 
    setTerminal({ isOpen: true, mode: 'edit', activeStep: 2, entryType: 'vin', id: v.id }); 
    setErrors({}); setSyncStatus('saved');
  };

  async function handleEntrySubmit() {
    if (!validateStage1()) return;
    setIsDecoding(true);
    try {
      let targetVin = formData.vin || "";
      if (terminal.entryType === 'plate' && !isOnline) throw new Error("Plate lookup offline.");
      if (terminal.entryType === 'plate') {
        const lookup = await lookupPlate(formData.plate!, formData.state!);
        targetVin = lookup.vin;
      }
      let d: { year: string | number; make: string; model: string } = { year: "", make: "MANUAL", model: "ENTRY" };
      if (isOnline) {
        const decoded = await decodeVin(targetVin);
        d = { year: decoded.year, make: decoded.make, model: decoded.model };
      }
      const updated = { ...formData, vin: targetVin, year: d.year.toString(), make: d.make, model: d.model };
      setFormData(updated);
      if (terminal.mode === 'add') {
        const { data: tenant } = await supabase.from("tenants").select("id").eq("domain", typeof window !== 'undefined' ? window.location.host : '').single();
        const { data: { user } } = await supabase.auth.getUser();
        const payload = sanitizePayload({ ...updated, tenant_id: tenant?.id, processed_by: user?.id, status: 'draft' });
        if (!isOnline) {
          const tid = crypto.randomUUID();
          queueOfflineAction('insert', payload, tid);
          setTerminal((prev) => ({ ...prev, activeStep: 2, id: tid }));
        } else {
          const { data: asset, error } = await supabase.from("vehicles").insert(payload).select('id').single();
          if (error) throw error;
          setTerminal((prev) => ({ ...prev, activeStep: 2, id: asset.id }));
        }
      } else setTerminal((prev) => ({ ...prev, activeStep: 2 }));
      setSyncStatus('saved');
    } catch (e: unknown) { 
      if (e instanceof Error) alert(e.message);
      else alert(String(e));
    } finally { setIsDecoding(false); }
  }

  async function commitAsset(addAnother = false) {
    if (!validateStage2()) return;
    setSyncStatus('saving');
    const p = sanitizePayload({ ...formData, status: formData.status === 'draft' ? 'available' : formData.status });
    if (!isOnline) {
      queueOfflineAction('update', p, terminal.id);
      if (addAnother) openAddTerminal(); else setTerminal((prev) => ({ ...prev, activeStep: 3 }));
      return;
    }
    const { error } = await supabase.from("vehicles").update(p).eq("id", terminal.id);
    if (!error) {
      if (terminal.mode === 'add' && formData.initiate_recon) {
        const { data: tenant } = await supabase.from("tenants").select("id").eq("domain", typeof window !== 'undefined' ? window.location.host : '').single();
        await supabase.from("service_orders").insert({ tenant_id: tenant?.id, vehicle_id: terminal.id, customer_name: "INTERNAL RECON", status: "intake", is_internal_recon: true });
      }
      fetchInventory(); if (addAnother) openAddTerminal(); else setTerminal((prev) => ({ ...prev, activeStep: 3 }));
    } else alert(error.message);
  }

  const toggleFeature = (f: string) => setFormData((prev) => ({ ...prev, features: prev.features?.includes(f) ? prev.features.filter((x: string) => x !== f) : [...(prev.features || []), f] }));

  async function handleDeleteAsset(id: string) {
    if (confirm("Delete Unit?")) {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) {
        alert("ERROR: Unable to delete unit. " + error.message);
      } else {
        fetchInventory();
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden text-black font-sans">
      <header className="p-4 md:p-6 lg:p-8 bg-white border-b-4 border-black flex justify-between items-center z-20 shrink-0 shadow-sm text-black">
        <div className="flex items-center gap-4 md:gap-6 lg:gap-10">
          <div>
            <p className="text-[10px] font-black uppercase text-brand-primary mb-1">Lot Management</p>
            <h1 className="text-xl md:text-2xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none">Unified Inventory</h1>
          </div>
          <div className="hidden md:flex gap-4 lg:gap-8 border-l-2 border-black/5 pl-4 lg:pl-10 text-black">
            <div><p className="text-[10px] font-black opacity-30 uppercase mb-1 text-black">Units</p><p className="text-lg lg:text-xl font-mono font-black italic">{inventory.length}</p></div>
            <div><p className="text-[10px] font-black opacity-30 uppercase mb-1 text-black">Sales</p><p className="text-lg lg:text-xl font-mono font-black italic text-brand-primary">{inventory.filter(v => v.status === 'available').length}</p></div>
            <div><p className="text-[10px] font-black opacity-30 uppercase mb-1 text-black">Valuation</p><p className="text-lg lg:text-xl font-mono font-black italic text-black">${inventory.reduce((a, v) => a + (Number(v.price) || 0), 0).toLocaleString()}</p></div>
          </div>
        </div>
        <div className="flex gap-4">
          {!isOnline && <div className="flex items-center gap-2 border-4 border-yellow-400 p-2 bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] text-black"><span className="animate-ping h-2 w-2 rounded-full bg-yellow-400" /><p className="text-[9px] font-black uppercase">Offline</p></div>}
          <button onClick={openAddTerminal} className="bg-black text-white px-4 py-2 md:px-6 md:py-3 lg:px-10 lg:py-4 font-black uppercase text-[10px] md:text-xs border-b-4 border-r-4 border-black/30 shadow-xl hover:bg-brand-primary transition-all">Add <span className="hidden lg:inline">New </span>Unit</button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Card List */}
          <div className="md:hidden space-y-6">
            {inventoryWithMetrics.map((v) => (
              <div key={v.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black uppercase text-brand-primary mb-1">VIN: {v.vin}</p>
                <h2 className="text-2xl font-black uppercase italic leading-none mb-1">{v.year} {v.make}</h2>
                <p className="text-xs font-bold opacity-60 uppercase mb-4">{v.model}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40">Price</p>
                    <p className="font-mono font-black text-brand-primary">${Number(v.price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40">Miles</p>
                    <p className="font-mono text-[10px] font-bold">{v.mileage?.toLocaleString() || "---"}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[8px] font-black border-2 border-black px-2 py-0.5 uppercase ${v.status === 'available' ? 'bg-green-400' : 'bg-white'}`}>{v.status}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => openEditTerminal(v)} className="flex-1 bg-black text-white py-3 font-black uppercase text-[10px] border-b-4 border-r-4 border-black/30">Edit Unit</button>
                  <button onClick={() => handleDeleteAsset(v.id)} className="flex-1 bg-white text-red-600 py-3 font-black uppercase text-[10px] border-4 border-black">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white border-4 border-black overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-black text-white text-[10px] font-black uppercase tracking-widest"><th className="p-3 lg:p-5 text-white">Asset</th><th className="p-3 lg:p-5 text-center text-white">Status / Age</th><th className="p-3 lg:p-5 text-center text-white text-white">Financials</th><th className="p-3 lg:p-5 text-center text-white text-white">Audit</th><th className="p-3 lg:p-5 text-right text-white">Terminal</th></tr></thead>
              <tbody className="divide-y-4 divide-zinc-50 text-black">
                {loading ? <tr><td colSpan={5} className="p-20 text-center animate-pulse uppercase font-black text-black">Syncing...</td></tr> : inventoryWithMetrics.map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-zinc-50 group transition-colors text-black">
                      <td className="p-3 lg:p-5 text-black"><p className="text-[10px] font-black uppercase text-brand-primary mb-1 tracking-tighter">VIN: {v.vin}</p><h2 className="text-lg lg:text-2xl font-black uppercase italic leading-none">{v.year} {v.make}</h2><p className="text-[10px] lg:text-xs font-bold opacity-60 uppercase">{v.model}</p></td>
                      <td className="p-3 lg:p-5 text-center text-black"><div className="flex flex-col items-center gap-1 text-black"><span className={`text-[9px] font-black border-2 border-black px-2 py-0.5 uppercase ${v.status === 'available' ? 'bg-green-400' : 'bg-white'}`}>{v.status}</span><span className={`text-[8px] font-black uppercase px-2 ${v.age > 60 ? 'bg-red-600 text-white animate-pulse' : v.age > 30 ? 'bg-yellow-400' : 'opacity-30'}`}>{v.age === 0 ? "NEW" : `${v.age} DAYS`}</span></div></td>
                      <td className="p-3 lg:p-5 text-center text-black"><p className="font-mono font-black text-lg lg:text-xl text-brand-primary leading-none text-brand-primary">${Number(v.price || 0).toLocaleString()}</p><p className="font-mono text-[10px] opacity-40 uppercase mt-1">{v.mileage?.toLocaleString() || "---"} MI</p></td>
                      <td className="p-3 lg:p-5 text-center text-black"><div className="flex flex-wrap justify-center gap-1 text-black">{v.audit.length === 0 ? <span className="text-[8px] font-black text-green-600 border px-1 uppercase">Verified</span> : v.audit.map(f => <span key={f} className="text-[8px] font-black bg-brand-primary text-white px-1 uppercase border border-black">{f}</span>)}</div></td>
                      <td className="p-3 lg:p-5 text-right text-black">
                          <div className="flex justify-end gap-3 transition-opacity text-black">
                              <button onClick={() => openEditTerminal(v)} className="bg-black text-white p-3 hover:bg-brand-primary border-b-2 border-r-2 border-black/20 text-white shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                              <button onClick={() => handleDeleteAsset(v.id)} className="bg-white text-red-600 p-3 border-2 border-black hover:bg-red-50 text-red-600 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                          </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
            </table>
        </div></div>
      </main>
      {terminal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4 text-black">
          <div className="bg-white border-4 border-black w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-[32px_32px_0px_0px_rgba(227,66,52,1)]">
            <header className="shrink-0 bg-white border-b-4 border-black p-4 md:p-8 flex justify-between items-center z-50 text-black">
              <div>
                <div className="flex items-center gap-4 mb-1">
                    <p className="text-[10px] font-black uppercase text-brand-primary tracking-[0.2em]">{terminal.mode} Active</p>
                    {syncStatus === 'saving' && <span className="bg-yellow-400 text-black px-2 py-0.5 text-[8px] font-black animate-pulse border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">SYNCING...</span>}
                    {syncStatus === 'saved' && <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-widest text-white">SECURE</span>}
                    {!isOnline && <span className="bg-brand-primary text-white px-2 py-0.5 text-[8px] font-black animate-pulse border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">OFFLINE DRAFT</span>}
                </div>
                <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{terminal.activeStep === 1 ? 'Intake Terminal' : terminal.activeStep === 3 ? 'Sync Confirmed' : `${formData.year} ${formData.make} ${formData.model}`}</h2>
              </div>
              <button onClick={() => setTerminal({ ...terminal, isOpen: false })} className="text-4xl font-black hover:text-brand-primary transition-colors border-4 border-black h-10 w-10 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">X</button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-12 text-black">
                {terminal.activeStep === 1 ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center py-10">
                    <div className="flex justify-center gap-4"><button onClick={() => setTerminal({...terminal, entryType: 'vin'})} className={`px-10 py-4 text-xs font-black uppercase border-4 border-black transition-all ${terminal.entryType === 'vin' ? 'bg-black text-white shadow-xl' : 'opacity-30'}`}>VIN Signature</button><button onClick={() => setTerminal({...terminal, entryType: 'plate'})} className={`px-10 py-4 text-xs font-black uppercase border-4 border-black transition-all ${terminal.entryType === 'plate' ? 'bg-black text-white shadow-xl' : 'opacity-30'}`}>Plate Search</button></div>
                    <div className="bg-zinc-50 p-8 md:p-16 border-4 border-black border-dashed">
                      <input autoFocus placeholder="IDENTIFIER" className="w-full bg-transparent border-b-4 border-black p-4 font-mono font-black text-center text-3xl md:text-5xl uppercase outline-none focus:text-brand-primary text-black" value={terminal.entryType === 'vin' ? formData.vin : formData.plate} onChange={(e) => setFormData({ ...formData, [terminal.entryType]: e.target.value.toUpperCase() })} maxLength={terminal.entryType === 'vin' ? 17 : 10} />
                      {(errors.vin || errors.plate) && <p className="text-brand-primary font-black uppercase text-xs mt-8 bg-brand-primary/10 p-4 border-2 border-brand-primary animate-pulse text-brand-primary">{errors.vin || errors.plate}</p>}
                      <button onClick={handleEntrySubmit} disabled={isDecoding} className="mt-16 bg-black text-white w-full md:w-auto px-8 md:px-24 py-8 font-black uppercase shadow-xl hover:bg-brand-primary transition-all text-white disabled:opacity-50">{isDecoding ? 'DECODING...' : 'INITIATE DECODE'}</button>
                    </div>
                  </div>
                ) : terminal.activeStep === 2 ? (
                  <div className="max-w-2xl mx-auto space-y-16 pb-20 text-black">
                    {Object.keys(errors).length > 0 && <div className="bg-brand-primary p-6 border-4 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] italic text-xs font-bold uppercase space-y-1 text-white"><p key="err-title" className="underline">Critical Validation Failures</p>{Object.values(errors).map((err, i) => <p key={i}>!! {err}</p>)}</div>}
                    
                    <div><p className="text-xs font-black uppercase text-brand-primary mb-6 border-b-4 border-black pb-2">01. Identity Persistence</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div><label className="block text-[9px] font-black uppercase opacity-40 mb-1">Exterior Color*</label><input className={`w-full border-4 border-black p-4 font-black uppercase text-sm outline-none focus:ring-4 focus:ring-brand-primary/20 ${errors.exterior_color?'border-brand-primary':''}`} value={formData.exterior_color} onChange={e=>setFormData({...formData, exterior_color:e.target.value})} /></div>
                            <div><label className="block text-[9px] font-black uppercase opacity-40 mb-1">Interior Color</label><input className="w-full border-4 border-black p-4 font-black uppercase text-sm outline-none focus:ring-4 focus:ring-brand-primary/20" value={formData.interior_color} onChange={e=>setFormData({...formData, interior_color:e.target.value})} /></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            <div><label className="block text-[9px] font-black uppercase opacity-40 mb-1">Fuel Type</label><select className="w-full border-4 border-black p-4 font-black uppercase text-sm appearance-none bg-white text-black" value={formData.fuel_type} onChange={e=>setFormData({...formData, fuel_type:e.target.value})}><option value="">Unknown</option>{FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                            <div><label className="block text-[9px] font-black uppercase opacity-40 mb-1">Drivetrain</label><select className="w-full border-4 border-black p-4 font-black uppercase text-sm appearance-none bg-white text-black" value={formData.drivetrain} onChange={e=>setFormData({...formData, drivetrain:e.target.value})}><option value="">Unknown</option>{DRIVETRAINS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                        </div>
                    </div>

                    <div><p className="text-xs font-black uppercase text-brand-primary mb-6 border-b-4 border-black pb-2">02. Pricing & Market Strategy</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div><label className="block text-[9px] font-black uppercase mb-1 opacity-40 italic">Retail Price ($)*</label><input type="number" className={`w-full border-4 border-black p-5 font-mono font-black text-3xl outline-none ${errors.price?'border-brand-primary':''}`} value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} /></div>
                                <div><label className="block text-[9px] font-black uppercase mb-1 opacity-40 italic">Odometer (MI)*</label><input type="number" className={`w-full border-4 border-black p-5 font-mono font-black text-3xl outline-none ${errors.mileage?'border-brand-primary':''}`} value={formData.mileage} onChange={e=>setFormData({...formData, mileage:e.target.value})} /></div>
                            </div>
                            <div className="space-y-6">
                                <div><label className="block text-[9px] font-black uppercase mb-1 opacity-40 italic text-black">System Status*</label><select className="w-full border-4 border-black p-5 font-black uppercase text-xl appearance-none bg-white text-black" value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})}><option value="draft">Draft</option><option value="available">Available</option><option value="sold">Sold</option></select></div>
                                <div><label className="block text-[9px] font-black uppercase mb-1 opacity-40 italic">Location</label><input placeholder="e.g., FRONT ROW" className="w-full border-4 border-black p-5 font-black uppercase text-xl outline-none text-black" value={formData.lot_location} onChange={e=>setFormData({...formData, lot_location:e.target.value})} /></div>
                            </div>
                        </div>
                    </div>
                    <div><p className="text-xs font-black uppercase text-brand-primary mb-6 border-b-4 border-black pb-2 text-black">03. Condition & Recon</p>
                        <div className="space-y-8 text-black">
                            <select className="w-full border-4 border-black p-5 font-black uppercase outline-none text-2xl appearance-none bg-white text-black" value={formData.condition} onChange={e=>setFormData({...formData, condition:e.target.value})}><option value="Excellent">Excellent - Front Line</option><option value="Good">Good - Standard</option><option value="Fair">Fair - Value Unit</option><option value="Needs Work">Needs Work</option></select>
                            {terminal.mode === 'add' && <label className="flex items-center gap-6 cursor-pointer bg-zinc-100 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black"><input type="checkbox" className="w-12 h-12 border-4 border-black checked:bg-brand-primary appearance-none cursor-pointer" checked={formData.initiate_recon} onChange={(e) => setFormData({ ...formData, initiate_recon: e.target.checked })} /><div><p className="text-xl font-black uppercase leading-none">Auto-Initiate Recon</p><p className="text-[10px] font-bold opacity-40 mt-2 uppercase text-black">Generate Shop Floor Ticket on Finalize</p></div></label>}
                        </div>
                    </div>

                    <div><p className="text-xs font-black uppercase text-brand-primary mb-6 border-b-4 border-black pb-2 text-black">04. Feature Matrix</p><div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-black">{COMMON_FEATURES.map(f => (<button key={f} onClick={() => toggleFeature(f)} className={`p-4 text-[9px] font-black uppercase border-2 border-black transition-all ${formData.features?.includes(f) ? 'bg-black text-white shadow-inner' : 'bg-white text-black opacity-30 hover:opacity-100'}`}>{f}</button>))}</div></div>

                    <div><p className="text-xs font-black uppercase text-brand-primary mb-6 border-b-4 border-black pb-2 text-black">05. Strategy</p><textarea rows={6} placeholder="DESCRIBE ASSET..." className="w-full border-4 border-black p-8 font-bold text-sm outline-none shadow-inner text-black" value={formData.public_description} onChange={e=>setFormData({...formData, public_description:e.target.value})} /></div>

                    <div className="pt-12 border-t-4 border-black/10 flex flex-col sm:flex-row gap-6 text-black">
                        <button onClick={() => commitAsset(false)} className="flex-1 bg-black text-white py-10 font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-brand-primary transition-all hover:-translate-y-1 text-white">Finalize & Close</button>
                        <button onClick={() => commitAsset(true)} className="flex-1 bg-white text-black py-10 font-black uppercase tracking-[0.2em] border-4 border-black shadow-xl hover:bg-zinc-50 text-black">Save & Add Another</button>
                    </div>
                  </div>
                ) : (
                    <div className="max-w-xl mx-auto py-20 animate-in zoom-in-95 duration-500 text-center text-black">
                        <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-[8px_8px_0px_0px_rgba(227,66,52,1)] text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg></div>
                        <h3 className="text-5xl font-black uppercase italic tracking-tighter mb-12">Asset Synced</h3>
                        <div className="bg-zinc-50 border-4 border-black p-8 text-left space-y-6 mb-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black">
                            <div className="flex justify-between border-b pb-2 text-black"><p className="text-[10px] font-black opacity-40 uppercase">Identity</p><p className="font-black uppercase">{formData.year} {formData.make} {formData.model}</p></div>
                            <div className="flex justify-between border-b pb-2 text-black"><p className="text-[10px] font-black opacity-40 uppercase">Price</p><p className="font-mono font-black text-brand-primary">${Number(formData.price).toLocaleString()}</p></div>
                        </div>
                        <div className="flex flex-col gap-4 text-black">
                            <button onClick={openAddTerminal} className="w-full bg-black text-white py-8 font-black uppercase tracking-[0.3em] shadow-xl hover:bg-brand-primary transition-all text-white">Onboard Next Unit</button>
                            <button onClick={() => setTerminal({ ...terminal, isOpen: false })} className="w-full bg-white text-black py-6 font-black uppercase border-4 border-black hover:bg-zinc-50 text-black">Close Terminal</button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
