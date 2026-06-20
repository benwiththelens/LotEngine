import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { getLink as getLinkUtil } from "@/lib/getLink";

export default async function Home({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: host } = await params;
  const headerList = await headers();
  const currentHost = headerList.get("host") || "";
  const isMarketingDomain = currentHost === 'localhost:3000' || currentHost === 'lot-engine.com' || currentHost === 'www.lot-engine.com';

  const getLink = (path: string) => getLinkUtil(path, host, isMarketingDomain);

  const supabase = await createClient();

  // 1. Fetch Tenant (Robust Fallback for Vercel)
  let { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", host)
    .single();

  if (!tenant) {
    let { data: fallback } = await supabase.from("tenants").select("*").eq("domain", "localhost:3000").single();
    if (!fallback) {
      const { data: firstTenant } = await supabase.from("tenants").select("*").limit(1).single();
      fallback = firstTenant;
    }
    tenant = fallback;
  }

  if (!tenant) return <div>Tenant Not Found</div>;

  // 2. Fetch "Fresh on the Lot" (Featured) Inventory
  // Simplified query: Fetch 6 available units. We'll show a placeholder if images are missing.
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(`
      *,
      vehicle_images (
        storage_url
      )
    `)
    .eq("tenant_id", tenant.id)
    .eq("is_inventory", true)
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(6);

  const displayAddress = tenant.address || "100 Main St\nLincoln, NE 68508";
  const displayPhone = tenant.phone || "(402) 555-0199";

  const defaultHours = [
    { day: "Monday", time: "8:30 – 5:00" },
    { day: "Tuesday", time: "8:30 – 5:00" },
    { day: "Wednesday", time: "8:30 – 5:00" },
    { day: "Thursday", time: "CLOSED", isClosed: true },
    { day: "Friday", time: "8:30 – 5:00" },
    { day: "Saturday", time: "8:30 – 12:00" },
    { day: "Sunday", time: "CLOSED", isClosed: true },
  ];
  const displayHours = (tenant.hours && Array.isArray(tenant.hours)) ? (tenant.hours as any[]) : defaultHours;

  const defaultReviews = [
    { name: "John Rockenbach", text: "Absolutely love this team! They've kept us in reliable vehicles for over 25 years!", rating: 5 },
    { name: "Loree Leon", text: "Very pleased with the service and knowledge. Happy with my ride and would refer anyone.", rating: 5 },
    { name: "Donna Splichal", text: "A wonderful place to buy a car. They treat you like family.", rating: 5 },
  ];
  const displayReviews = (tenant.reviews && Array.isArray(tenant.reviews)) ? (tenant.reviews as any[]) : defaultReviews;

  return (
    <main className="flex min-h-screen flex-col bg-white text-black font-sans">
      {/* Hero Section - Rugged Professionalism Redesign */}
      <section 
        className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[75vh] border-b-4 border-black relative overflow-hidden bg-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {/* Connection Status Badge */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-black text-white px-4 py-2 border-2 border-black flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--theme-primary)]">
          <span className="w-2 h-2 bg-[#00FF66] animate-pulse"></span>
          <span>SYSTEM_STATUS: ONLINE // SYNC_SECURE</span>
        </div>

        <h1 className="text-7xl font-black uppercase tracking-tighter sm:text-9xl italic leading-[0.8] text-black drop-shadow-[6px_6px_0px_var(--theme-primary)] mb-4">
          {tenant.business_name}
        </h1>
        <p className="mt-8 text-xs font-black font-mono uppercase tracking-[0.4em] bg-black text-white px-4 py-2 border-2 border-black">
          Automotive Operating System // {host}
        </p>
        
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl">
          <Link 
            href={getLink("/inventory")}
            className="w-full sm:w-auto text-center bg-black px-12 py-5 text-xs font-black uppercase tracking-[0.2em] text-white border-4 border-black shadow-[8px_8px_0px_0px_var(--theme-primary)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 text-white"
          >
            Browse Inventory
          </Link>
          <button className="w-full sm:w-auto bg-white border-4 border-black px-12 py-5 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150">
            Schedule Service
          </button>
        </div>
      </section>

      {/* Fresh on the Lot (Featured Showroom) Redesign */}
      <section className="p-8 sm:p-16 border-b-4 border-black bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Deployment Queue</p>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-black">Fresh on the Lot</h2>
            </div>
            <p className="text-xs font-mono font-bold uppercase opacity-50 bg-white border-2 border-black px-3 py-1 text-black">
              ACTIVE_STOCK: {vehicles?.length || 0} UNITS
            </p>
          </div>

          {!vehicles || vehicles.length === 0 ? (
            <div className="border-4 border-dashed border-zinc-300 p-24 text-center bg-white">
              <p className="font-black uppercase opacity-20 text-xl italic tracking-tighter">Zero Units Detected in Showroom</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => (
                <Link 
                  key={vehicle.id} 
                  href={getLink(`/inventory/${vehicle.vin}`)}
                  className="group border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_var(--theme-primary)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex flex-col"
                >
                  <div className="aspect-[16/10] border-b-4 border-black bg-zinc-100 flex items-center justify-center overflow-hidden relative">
                    {vehicle.vehicle_images?.[0]?.storage_url ? (
                      <img 
                        src={vehicle.vehicle_images[0].storage_url} 
                        alt={`${vehicle.year} ${vehicle.make}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                      />
                    ) : (
                      <p className="text-[10px] font-black uppercase opacity-20 italic">No Media Found</p>
                    )}
                    <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider">
                      {vehicle.vin.substring(0, 8)}...
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[9px] font-black font-mono uppercase tracking-widest bg-black text-white px-2 py-1">
                          {vehicle.status.toUpperCase()}
                        </p>
                        <p className="font-mono text-2xl font-black text-brand-primary">
                          {vehicle.price ? `$${Number(vehicle.price).toLocaleString()}` : "INQUIRE"}
                        </p>
                      </div>

                      <h3 className="text-2xl font-black uppercase italic leading-none mb-1 text-black">
                        {vehicle.year} {vehicle.make}
                      </h3>
                      <p className="text-xs font-bold uppercase opacity-60 mb-6 tracking-tight text-black">
                        {vehicle.model} {vehicle.trim}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t-2 border-black/10 pt-4">
                      <p className="font-mono text-[10px] font-bold uppercase text-black">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} MI` : "EXEMPT"}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform text-black">View Unit —→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link 
              href={getLink("/inventory")}
              className="inline-block bg-black text-white border-4 border-black px-10 py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black hover:shadow-[6px_6px_0px_0px_var(--theme-primary)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              View All Showroom Inventory —→
            </Link>
          </div>
        </div>
      </section>

      {/* Business Intelligence Grid - Redesign */}
      <section className="bg-white p-8 sm:p-16 grid grid-cols-1 md:grid-cols-3 gap-12 border-b-4 border-black">
        {/* Contact Info Module */}
        <div className="border-4 border-black flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <div className="bg-black text-white p-4 border-b-4 border-black flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider">
            <span>[MODULE_01: REGISTRY]</span>
            <span className="w-2.5 h-2.5 bg-brand-primary"></span>
          </div>
          <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Location & Registry</p>
              <h2 className="text-3xl font-black uppercase italic leading-tight text-black whitespace-pre-line">{displayAddress}</h2>
              <p className="text-xl font-bold font-mono text-black">{displayPhone}</p>
            </div>
            <div className="pt-4">
              <button className="w-full bg-black text-white border-2 border-black py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Open in Navigation Maps →
              </button>
            </div>
          </div>
        </div>

        {/* Operating Hours Module */}
        <div className="border-4 border-black flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <div className="bg-black text-white p-4 border-b-4 border-black flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider">
            <span>[MODULE_02: OPERATIONAL]</span>
            <span className="w-2.5 h-2.5 bg-brand-primary"></span>
          </div>
          <div className="p-8 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">Operational Hours</p>
            <div className="space-y-3 font-mono text-xs font-bold uppercase text-black">
              {displayHours.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center gap-2">
                  <span className={item.isClosed ? "text-red-600 font-black" : "opacity-60"}>{item.day}</span>
                  <div className="flex-1 border-b border-dashed border-black/20 mx-2"></div>
                  <span className={item.isClosed ? "text-red-600 font-black" : ""}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Module */}
        <div className="border-4 border-black flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <div className="bg-black text-white p-4 border-b-4 border-black flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider">
            <span>[MODULE_03: REPORTS]</span>
            <span className="w-2.5 h-2.5 bg-brand-primary"></span>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Customer Reports</p>
            <div className="space-y-6 flex-1">
              {displayReviews.map((r: any, i: number) => (
                <div key={i} className="border-l-4 border-brand-primary pl-4 py-1">
                  <p className="text-xs font-bold italic leading-snug text-black">&quot;{r.text}&quot;</p>
                  <p className="mt-2 text-[8px] font-black uppercase opacity-50 tracking-widest text-black">— {r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="bg-black text-white p-12 flex flex-col sm:flex-row justify-between items-center gap-8 border-t-4 border-black">
        <div className="text-left">
          <p className="text-2xl font-black uppercase italic tracking-tighter">LotEngine</p>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.4em] mt-1 font-mono italic">Headless Dealership Infrastructure</p>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-50 font-mono">
          <p>© 2026 {tenant.business_name}</p>
          <p className="text-brand-primary">System Status: Optimal</p>
        </div>
      </footer>
    </main>
  );
}
