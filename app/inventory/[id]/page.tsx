import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function VehicleDetail({ params }: { params: { id: string } }) {
  const { id } = await params;
  const headerList = await headers();
  const host = headerList.get("host") || "lot-engines.com";

  // 1. Fetch Tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", host)
    .single();

  if (!tenant) return notFound();

  // 2. Fetch Vehicle
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single();

  if (!vehicle) return notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-4 border-black p-6 sm:p-10 flex justify-between items-center bg-white">
        <Link href="/" className="text-2xl font-black uppercase italic tracking-tighter hover:text-brand-primary transition-colors">
          {tenant.business_name}
        </Link>
        <Link href="/inventory" className="text-xs font-black uppercase tracking-widest border-b-2 border-black">
          ← Back to Inventory
        </Link>
      </header>

      <main className="max-w-7xl mx-auto p-6 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery Placeholder */}
          <div className="space-y-4">
            <div className="aspect-square bg-zinc-100 border-4 border-black flex items-center justify-center">
              <p className="text-xs font-black uppercase opacity-20 italic">Primary Asset Capture Pending</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-zinc-50 border-2 border-black/10"></div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Technical Specifications</p>
              <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-[0.85] mb-4">
                {vehicle.year} {vehicle.make}<br />{vehicle.model}
              </h1>
              <p className="text-xl font-bold uppercase opacity-40 italic tracking-tight">{vehicle.trim}</p>
            </div>

            <div className="bg-black text-white p-8 mb-12 shadow-[12px_12px_0px_0px_rgba(227,66,52,1)]">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Asking Price</p>
                  <p className="text-5xl font-mono font-black tracking-tighter">
                    {vehicle.price ? `$${Number(vehicle.price).toLocaleString()}` : "CALL"}
                  </p>
                </div>
                <button className="bg-brand-primary text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all">
                  Inquire Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-8 gap-x-12 border-t-4 border-black pt-8">
              <div>
                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Mileage</p>
                <p className="text-lg font-mono font-bold">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} MI` : "EXEMPT"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">VIN</p>
                <p className="text-lg font-mono font-bold tracking-tighter uppercase">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Engine</p>
                <p className="text-lg font-black uppercase italic leading-none">{vehicle.engine}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Drivetrain</p>
                <p className="text-lg font-black uppercase italic leading-none">{vehicle.drivetrain}</p>
              </div>
            </div>

            <div className="mt-12 p-8 bg-zinc-50 border-2 border-black/5">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Mechanic Notes</p>
              <p className="text-sm font-bold leading-relaxed">
                {vehicle.public_description || "This vehicle has been processed through the LotEngine digital twin pipeline and is awaiting final inspection notes."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
