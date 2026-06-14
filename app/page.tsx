import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function Home() {
  const headerList = await headers();
  const host = headerList.get("host") || "lot-engines.com";

  // 1. Fetch Tenant (Robust Fallback for Vercel)
  let { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", host)
    .single();

  if (!tenant) {
    const { data: fallback } = await supabase.from("tenants").select("*").limit(1).single();
    tenant = fallback;
  }

  if (!tenant) return <div>Tenant Not Found</div>;

  // 2. Fetch "Fresh on the Lot" (Featured) Inventory
  // Using !inner join to filter out ghost cars (units without images)
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(`
      *,
      vehicle_images!inner (
        storage_url
      )
    `)
    .eq("tenant_id", tenant.id)
    .eq("is_inventory", true)
    .eq("status", "available")
    .eq("vehicle_images.is_primary", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const reviews = [
    { name: "John Rockenbach", text: "LOVE RAY !!! His family has kept us in cars for OVER 25 years !!!!", rating: 5 },
    { name: "Loree Leon", text: "Very Pleased with Service and Knowledge. Happy with my ride and would refer anyone.", rating: 5 },
    { name: "Donna Splichal", text: "Ray's is a wonderful place to go for a car. They treat you like family.", rating: 5 },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-black font-sans">
      {/* Hero Section - Rugged Professionalism */}
      <section className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[70vh] border-b-2 border-black">
        <h1 className="text-7xl font-black uppercase tracking-tighter sm:text-9xl italic leading-[0.8]">
          {tenant.business_name}
        </h1>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.5em] opacity-40">
          Automotive Operating System // {host}
        </p>
        
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl">
          <Link 
            href="/inventory"
            className="w-full sm:w-auto text-center bg-black px-12 py-5 text-xs font-black uppercase tracking-[0.2em] text-white border-2 border-black hover:bg-zinc-900 transition-colors"
          >
            Browse Inventory
          </Link>
          <button className="w-full sm:w-auto bg-white border-2 border-black px-12 py-5 text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-colors">
            Schedule Service
          </button>
        </div>
      </section>

      {/* Fresh on the Lot (Featured Showroom) */}
      <section className="p-8 sm:p-16 border-b-2 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black mb-2 opacity-30">Deployment Queue</p>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-black">Fresh on the Lot</h2>
            </div>
          </div>

          {!vehicles || vehicles.length === 0 ? (
            <div className="border-2 border-black p-20 text-center">
              <p className="font-black uppercase opacity-20 text-xl italic tracking-tighter">Zero Units Detected in Showroom</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t-2 border-l-2 border-black">
              {vehicles.map((vehicle) => (
                <Link 
                  key={vehicle.id} 
                  href={`/inventory/${vehicle.id}`}
                  className="group border-r-2 border-b-2 border-black bg-white hover:bg-zinc-50 transition-colors flex flex-col"
                >
                  <div className="aspect-[16/10] border-b-2 border-black bg-zinc-100 flex items-center justify-center overflow-hidden">
                    {vehicle.vehicle_images?.[0]?.storage_url ? (
                      <img 
                        src={vehicle.vehicle_images[0].storage_url} 
                        alt={`${vehicle.year} ${vehicle.make}`} 
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    ) : (
                      <p className="text-[10px] font-black uppercase opacity-20 italic">No Media Found</p>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">
                          Available
                        </p>
                        <p className="font-mono text-xl font-black">
                          {vehicle.price ? `$${Number(vehicle.price).toLocaleString()}` : "INQUIRE"}
                        </p>
                      </div>

                      <h3 className="text-2xl font-black uppercase italic leading-none mb-1">
                        {vehicle.year} {vehicle.make}
                      </h3>
                      <p className="text-sm font-bold uppercase opacity-60 mb-6 tracking-tight">
                        {vehicle.model} {vehicle.trim}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t-2 border-black pt-4">
                      <p className="font-mono text-[10px] font-bold uppercase">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} MI` : "EXEMPT"}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">View Unit →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link 
              href="/inventory"
              className="inline-block text-xs font-black uppercase tracking-[0.3em] hover:translate-x-2 transition-transform"
            >
              View All Inventory —→
            </Link>
          </div>
        </div>
      </section>

      {/* Business Intelligence Grid - Rugged Professionalism */}
      <section className="bg-white p-8 sm:p-16 grid grid-cols-1 md:grid-cols-3 gap-12 border-b-2 border-black">
        {/* Contact Info */}
        <div className="space-y-4 text-black">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Location & Registry</p>
          <h2 className="text-3xl font-black uppercase italic leading-tight">505 US-77<br />Cortland, NE 68331</h2>
          <p className="text-xl font-bold font-mono">(402) 798-7373</p>
          <div className="pt-4">
            <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:bg-black hover:text-white transition-all px-2 -ml-2">Open in Maps →</button>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 text-black">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Operational Hours</p>
          <div className="grid grid-cols-2 text-[10px] font-bold uppercase gap-y-2 font-mono">
            <span className="opacity-50">Monday</span> <span>8:30 – 5:00</span>
            <span className="opacity-50">Tuesday</span> <span>8:30 – 5:00</span>
            <span className="opacity-50">Wednesday</span> <span>8:30 – 5:00</span>
            <span className="opacity-50 text-red-600 font-black">Thursday</span> <span className="text-red-600 font-black">Closed</span>
            <span className="opacity-50">Friday</span> <span>8:30 – 5:00</span>
            <span className="opacity-50">Saturday</span> <span>8:30 – 12:00</span>
            <span className="opacity-50 text-red-600 font-black">Sunday</span> <span className="text-red-600 font-black">Closed</span>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-6 text-black">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Customer Reports</p>
          <div className="space-y-6">
            {reviews.map((r, i) => (
              <div key={i} className="border-l-2 border-black pl-4">
                <p className="text-sm font-bold italic leading-snug">&quot;{r.text}&quot;</p>
                <p className="mt-2 text-[8px] font-black uppercase opacity-40 tracking-widest">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="bg-white text-black p-12 flex flex-col sm:flex-row justify-between items-center gap-8">
        <div className="text-left">
          <p className="text-2xl font-black uppercase italic tracking-tighter">LotEngine</p>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.4em] mt-1 font-mono italic">Headless Dealership Infrastructure</p>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-50 font-mono">
          <p>© 2026 {tenant.business_name}</p>
          <p>System Status: Optimal</p>
        </div>
      </footer>
    </main>
  );
}
