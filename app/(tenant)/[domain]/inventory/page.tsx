import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function PublicInventory({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: host } = await params;

  // 1. Fetch Tenant
  let { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", host)
    .single();

  if (!tenant) {
    const { data: fallback } = await supabase.from("tenants").select("*").limit(1).single();
    tenant = fallback;
  }

  if (!tenant) return <div className="p-20 text-center uppercase font-black">Dealer Network Error</div>;

  // 2. Fetch Inventory
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_inventory", true)
    .eq("status", "available")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Header */}
      <header className="border-b-4 border-black p-6 sm:p-10 flex justify-between items-center bg-white sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black uppercase italic tracking-tighter hover:text-brand-primary transition-colors">
          {tenant.business_name}
        </Link>
        <div className="hidden sm:flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-60">
          <Link href="/inventory" className="text-brand-primary underline decoration-2 underline-offset-4">Inventory</Link>
          <Link href="/service" className="hover:text-black">Service Bay</Link>
          <Link href="/about" className="hover:text-black">Our Story</Link>
        </div>
      </header>

      <main className="p-6 sm:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-2">Live Showroom</p>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Current Stock</h1>
          </div>
          <p className="text-xs font-bold uppercase opacity-40">Showing {vehicles?.length || 0} Available Units</p>
        </div>

        {/* Inventory Grid */}
        {!vehicles || vehicles.length === 0 ? (
          <div className="border-4 border-dashed border-zinc-200 p-32 text-center">
            <p className="font-black uppercase opacity-20 text-2xl italic tracking-tighter">Zero Units Detected in Showroom</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <Link 
                key={vehicle.id} 
                href={`/inventory/${vehicle.id}`}
                className="group border-2 border-black bg-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
              >
                {/* Image Placeholder */}
                <div className="aspect-[16/10] bg-zinc-100 border-b-2 border-black flex items-center justify-center overflow-hidden">
                  <p className="text-[10px] font-black uppercase opacity-20 group-hover:opacity-40 transition-opacity italic">Asset Capture Pending</p>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">
                      {vehicle.status}
                    </p>
                    <p className="font-mono text-xl font-black text-brand-primary">
                      {vehicle.price ? `$${Number(vehicle.price).toLocaleString()}` : "CALL FOR PRICE"}
                    </p>
                  </div>

                  <h2 className="text-2xl font-black uppercase italic leading-none mb-2">
                    {vehicle.year} {vehicle.make}
                  </h2>
                  <p className="text-sm font-bold uppercase opacity-60 mb-6">
                    {vehicle.model} {vehicle.trim}
                  </p>

                  <div className="grid grid-cols-2 gap-4 border-t-2 border-black/5 pt-4">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-30">Mileage</p>
                      <p className="font-mono font-bold text-xs">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} MI` : "EXEMPT"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-30">Powertrain</p>
                      <p className="font-bold text-[10px] uppercase truncate">{vehicle.engine}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <p className="text-2xl font-black uppercase italic tracking-tighter">LotEngine</p>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">© 2026 {tenant.business_name} {"//"} Managed Infrastructure</p>
        </div>
      </footer>
    </div>
  );
}
