"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { getLink as getLinkUtil } from "@/lib/getLink";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, ArrowRight, Layout, Settings, Sparkles } from "lucide-react";

const supabase = createClient();

interface TenantSettings {
  id: string;
  domain: string;
  business_name: string;
  color_primary: string;
  color_background: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  hours: Array<{ day: string; time: string; isClosed?: boolean }> | null;
  reviews: Array<{ name: string; text: string; rating?: number }> | null;
}

const DEFAULT_HOURS = [
  { day: "Monday", time: "8:30 – 5:00" },
  { day: "Tuesday", time: "8:30 – 5:00" },
  { day: "Wednesday", time: "8:30 – 5:00" },
  { day: "Thursday", time: "CLOSED", isClosed: true },
  { day: "Friday", time: "8:30 – 5:00" },
  { day: "Saturday", time: "8:30 – 12:00" },
  { day: "Sunday", time: "CLOSED", isClosed: true },
];

export default function TenantSettingsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: host } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const [tenant, setTenant] = useState<TenantSettings | null>(null);

  // Individual states to edit
  const [businessName, setBusinessName] = useState("");
  const [colorPrimary, setColorPrimary] = useState("#0047AB");
  const [colorBackground, setColorBackground] = useState("#FFFFFF");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState<typeof DEFAULT_HOURS>([]);
  const [reviews, setReviews] = useState<Array<{ name: string; text: string }>>([]);

  const fetchTenantData = useCallback(async () => {
    setLoading(true);
    
    // Auth Guard
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const isMarketingDomain = host === 'localhost:3000' || host === 'lot-engine.com' || host === 'www.lot-engine.com';
      const loginPath = isMarketingDomain ? `/${host}/login?next=/admin/settings` : `/login?next=/admin/settings`;
      router.push(loginPath);
      return;
    }

    // Query Tenant matching domain
    let { data } = await supabase.from("tenants").select("*").eq("domain", host).single();
    if (!data) {
      let { data: fallback } = await supabase.from("tenants").select("*").eq("domain", "localhost:3000").single();
      if (!fallback) {
        const { data: firstTenant } = await supabase.from("tenants").select("*").limit(1).single();
        fallback = firstTenant;
      }
      data = fallback;
    }

    if (data) {
      const t = data as TenantSettings;
      setTenant(t);
      setBusinessName(t.business_name || "");
      setColorPrimary(t.color_primary || "#0047AB");
      setColorBackground(t.color_background || "#FFFFFF");
      setLogoUrl(t.logo_url || "");
      setAddress(t.address || "");
      setPhone(t.phone || "");
      setHours(Array.isArray(t.hours) ? (t.hours as typeof DEFAULT_HOURS) : DEFAULT_HOURS);
      setReviews(Array.isArray(t.reviews) ? (t.reviews as Array<{ name: string; text: string }>) : []);
    }
    setLoading(false);
  }, [host, router]);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  // Handle Hours edit
  const handleHoursChange = (index: number, field: 'time' | 'isClosed', value: any) => {
    setHours(prev => prev.map((h, i) => {
      if (i !== index) return h;
      if (field === 'isClosed') {
        return { ...h, isClosed: value, time: value ? "CLOSED" : "8:30 – 5:00" };
      }
      return { ...h, [field]: value };
    }));
  };

  // Handle Reviews edit
  const handleReviewChange = (index: number, field: 'name' | 'text', value: string) => {
    setReviews(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const addReview = () => {
    setReviews(prev => [...prev, { name: "", text: "" }]);
  };

  const removeReview = (index: number) => {
    setReviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit/Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage("");

    const payload = {
      business_name: businessName,
      color_primary: colorPrimary,
      color_background: colorBackground,
      logo_url: logoUrl || null,
      address: address || null,
      phone: phone || null,
      hours: hours,
      reviews: reviews,
    };

    const { error } = await supabase
      .from("tenants")
      .update(payload)
      .eq("id", tenant.id);

    if (error) {
      setSaveStatus('error');
      setErrorMessage(error.message.toUpperCase());
    } else {
      setSaveStatus('success');
      // Apply theme styles locally in real-time
      document.body.style.setProperty('--theme-primary', colorPrimary);
      document.body.style.setProperty('--theme-bg', colorBackground);
      
      // Auto-clear success status
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-zinc-50">
        <p className="font-mono text-xs font-black uppercase tracking-[0.4em] animate-pulse text-black">
          INITIALIZING SECURITY PREVIEW...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-6 md:p-12 text-black font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8 mb-12">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-2">SYSTEM CONFIGURATION</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Dealership Settings</h1>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 border-2 border-black">
          <span>TENANT_ID: {tenant?.id.substring(0, 8)}...</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-3 gap-12 max-w-7xl mx-auto">
        
        {/* Left Column: Form Settings (Takes up 2 cols) */}
        <div className="xl:col-span-2 space-y-12">
          
          {/* Identity & Branding Box */}
          <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter border-b-2 border-black pb-4 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              01. Identity & Branding
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[9px] font-mono font-black uppercase tracking-widest opacity-50 mb-2">BUSINESS NAME</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border-2 border-black p-4 font-bold text-sm outline-none bg-white focus:border-brand-primary focus:shadow-[4px_4px_0px_0px_color-mix(in srgb, var(--theme-primary) 10%, transparent)] transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-black uppercase tracking-widest opacity-50 mb-2">PRIMARY COLOR (HEX)</label>
                <div className="flex gap-2">
                  <div 
                    className="w-14 h-14 border-2 border-black shrink-0" 
                    style={{ backgroundColor: colorPrimary }}
                  />
                  <input
                    type="text"
                    required
                    value={colorPrimary}
                    onChange={(e) => setColorPrimary(e.target.value)}
                    className="flex-1 border-2 border-black p-4 font-mono font-bold text-sm uppercase outline-none focus:border-brand-primary"
                    placeholder="#0055FF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-black uppercase tracking-widest opacity-50 mb-2">BACKGROUND COLOR (HEX)</label>
                <div className="flex gap-2">
                  <div 
                    className="w-14 h-14 border-2 border-black shrink-0" 
                    style={{ backgroundColor: colorBackground }}
                  />
                  <input
                    type="text"
                    required
                    value={colorBackground}
                    onChange={(e) => setColorBackground(e.target.value)}
                    className="flex-1 border-2 border-black p-4 font-mono font-bold text-sm uppercase outline-none focus:border-brand-primary"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Registry */}
          <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter border-b-2 border-black pb-4 mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-brand-primary" />
              02. Location Registry
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-mono font-black uppercase tracking-widest opacity-50 mb-2">PHYSICAL ADDRESS</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address&#10;City, State Zip"
                  className="w-full border-2 border-black p-4 font-bold text-sm outline-none bg-white focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-black uppercase tracking-widest opacity-50 mb-2">REGISTRY PHONE</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(402) 555-0199"
                  className="w-full border-2 border-black p-4 font-bold text-sm outline-none bg-white focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter border-b-2 border-black pb-4 mb-6">
              03. Operational Hours
            </h3>

            <div className="space-y-4">
              {hours.map((h, i) => (
                <div key={h.day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 border border-black/5 bg-zinc-50 font-mono">
                  <span className="font-black text-xs uppercase sm:w-32">{h.day}</span>
                  
                  <div className="flex flex-1 items-center gap-4">
                    <input
                      type="text"
                      disabled={h.isClosed}
                      value={h.time}
                      onChange={(e) => handleHoursChange(i, 'time', e.target.value)}
                      className="flex-1 border-2 border-black px-3 py-2 font-bold text-xs uppercase outline-none bg-white disabled:bg-zinc-200 disabled:opacity-50"
                    />
                    
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={h.isClosed || false}
                        onChange={(e) => handleHoursChange(i, 'isClosed', e.target.checked)}
                        className="w-4 h-4 accent-black rounded-none"
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest">Closed</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
              <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
                04. Customer Testimonials
              </h3>
              <button
                type="button"
                onClick={addReview}
                className="bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white"
              >
                <Plus className="w-3 h-3 text-white" /> Add Review
              </button>
            </div>

            <div className="space-y-6">
              {reviews.map((r, i) => (
                <div key={i} className="border-2 border-black p-4 space-y-4 relative bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    type="button"
                    onClick={() => removeReview(i)}
                    className="absolute top-4 right-4 text-red-600 hover:scale-110 transition-transform"
                    title="Remove Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-11/12">
                    <label className="block text-[8px] font-mono font-black uppercase tracking-widest opacity-50 mb-1">AUTHOR NAME</label>
                    <input
                      type="text"
                      required
                      value={r.name}
                      onChange={(e) => handleReviewChange(i, 'name', e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full border-2 border-black px-3 py-2 font-bold text-xs outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono font-black uppercase tracking-widest opacity-50 mb-1">REVIEW CONTENT</label>
                    <textarea
                      required
                      rows={2}
                      value={r.text}
                      onChange={(e) => handleReviewChange(i, 'text', e.target.value)}
                      placeholder="Review statement here..."
                      className="w-full border-2 border-black p-3 font-bold text-xs outline-none bg-white"
                    />
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <p className="text-xs font-mono opacity-40 italic text-center py-6">No custom testimonials configured. Displaying system defaults.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Technical Preview Panel */}
        <div className="space-y-8">
          <div className="sticky top-24 space-y-6">
            <div className="bg-black text-white p-4 border-2 border-black flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-widest">
              <span>[LIVE_TACTICAL_PREVIEW]</span>
              <span className="w-2 h-2 bg-[#00FF66] animate-pulse"></span>
            </div>

            {/* Mock Landing Page Box */}
            <div className="border-4 border-black bg-zinc-100 p-6 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {/* Mock Header */}
              <div className="bg-white border-2 border-black p-4 flex justify-between items-center">
                <span 
                  className="text-lg font-black uppercase italic tracking-tighter leading-none"
                  style={{ color: colorPrimary }}
                >
                  {businessName || "Apex Motors"}
                </span>
                <span className="text-[8px] font-mono font-black opacity-30">INVENTORY</span>
              </div>

              {/* Mock Hero Pane */}
              <div 
                className="bg-white border-2 border-black p-8 text-center flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(${colorPrimary}0F 1px, transparent 1px), linear-gradient(90deg, ${colorPrimary}0F 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
              >
                <h4 className="text-2xl font-black uppercase italic tracking-tighter text-black leading-none mb-4">
                  {businessName || "Apex Motors"}
                </h4>
                
                <div className="flex gap-3">
                  <div 
                    className="px-4 py-2 border-2 border-black text-[8px] font-black uppercase tracking-wider text-white transition-all cursor-pointer"
                    style={{ 
                      backgroundColor: colorPrimary,
                      boxShadow: `3px 3px 0px 0px ${colorBackground === '#FFFFFF' || colorBackground === '#ffffff' ? '#000000' : colorBackground}`
                    }}
                  >
                    Browse Stock
                  </div>
                  <div className="px-4 py-2 border-2 border-black text-[8px] font-black uppercase tracking-wider text-black bg-white">
                    Service Bay
                  </div>
                </div>
              </div>

              {/* Mock Spec Details card */}
              <div className="bg-white border-2 border-black p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-black/5 pb-2">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5">AVAILABLE</span>
                  <span 
                    className="font-mono text-sm font-black"
                    style={{ color: colorPrimary }}
                  >
                    $34,995
                  </span>
                </div>
                <div className="h-2 w-3/4 bg-zinc-800" />
                <div className="h-1.5 w-1/2 bg-zinc-300" />
              </div>
            </div>

            {/* Save Controller Actions */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
              {saveStatus === 'success' && (
                <div className="p-4 border-2 border-green-500 bg-green-500/10 font-mono text-[9px] font-black uppercase tracking-widest text-green-700 animate-pulse">
                  // CONFIGURATION_COMMITTED_SUCCESSFULLY
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="p-4 border-2 border-red-500 bg-red-500/10 font-mono text-[9px] font-black uppercase tracking-widest text-red-600">
                  !! SAVE_FAILED: {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-black text-white border-4 border-black py-4 font-black uppercase tracking-widest text-xs hover:bg-brand-primary hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 group text-white"
                style={{ 
                  boxShadow: `6px 6px 0px 0px ${colorPrimary}`
                }}
              >
                <Save className="w-4 h-4 text-white" />
                {saving ? "SAVING CONFIG..." : "SAVE CONFIGURATION"}
              </button>

              <button
                type="button"
                onClick={() => router.push(getLink("/"))}
                className="w-full bg-white text-black border-2 border-black py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
              >
                View Public Showroom
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );

  function getLink(path: string) {
    const isMarketingDomain = host === 'localhost:3000' || host === 'lot-engine.com' || host === 'www.lot-engine.com';
    return getLinkUtil(path, host, isMarketingDomain);
  }
}
