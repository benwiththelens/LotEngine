import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function Home() {
  const headerList = await headers();
  const host = headerList.get("host") || "lot-engines.com";

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

  const reviews = [
    { name: "John Rockenbach", text: "LOVE RAY !!! His family has kept us in cars for OVER 25 years !!!!", rating: 5 },
    { name: "Loree Leon", text: "Very Pleased with Service and Knowledge. Happy with my ride and would refer anyone.", rating: 5 },
    { name: "Donna Splichal", text: "Ray's is a wonderful place to go for a car. They treat you like family.", rating: 5 },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-brand-bg">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[80vh]">
        <h1 className="text-7xl font-black uppercase tracking-tighter sm:text-9xl italic leading-[0.8]">
          {tenant.business_name}
        </h1>
        <p className="mt-6 text-sm font-bold opacity-60 uppercase tracking-[0.4em]">
          Automotive Operating System // {host}
        </p>
        
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl">
          <Link 
            href="/inventory"
            className="w-full sm:w-auto text-center rounded-none bg-brand-primary px-12 py-5 text-sm font-black uppercase tracking-widest text-white border-b-4 border-r-4 border-black/20 shadow-2xl hover:brightness-110 active:translate-y-1 active:border-none transition-all"
          >
            Browse Inventory
          </Link>
          <button className="w-full sm:w-auto rounded-none border-2 border-black bg-white px-12 py-5 text-sm font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all">
            Schedule Service
          </button>
        </div>
      </section>

      {/* Business Intelligence Grid */}
      <section className="border-t-4 border-black bg-white p-8 sm:p-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Location & Contact</p>
          <h2 className="text-3xl font-black uppercase italic leading-tight">505 US-77<br />Cortland, NE 68331</h2>
          <p className="text-xl font-bold">(402) 798-7373</p>
          <div className="pt-4">
            <button className="text-xs font-black uppercase tracking-widest border-b-2 border-black">Open in Maps →</button>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Operating Hours</p>
          <div className="grid grid-cols-2 text-xs font-bold uppercase gap-y-2">
            <span className="opacity-50">Monday</span> <span>8:30 AM – 5 PM</span>
            <span className="opacity-50">Tuesday</span> <span>8:30 AM – 5 PM</span>
            <span className="opacity-50">Wednesday</span> <span>8:30 AM – 5 PM</span>
            <span className="opacity-50 text-red-600">Thursday</span> <span className="text-red-600">Closed</span>
            <span className="opacity-50">Friday</span> <span>8:30 AM – 5 PM</span>
            <span className="opacity-50">Saturday</span> <span>8:30 AM – 12 PM</span>
            <span className="opacity-50 text-red-600">Sunday</span> <span className="text-red-600">Closed</span>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-6">
          <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Customer Reports</p>
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border-l-4 border-black pl-4">
                <p className="text-sm font-bold italic leading-snug">"{r.text}"</p>
                <p className="mt-2 text-[10px] font-black uppercase opacity-40">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="bg-black text-white p-12 flex flex-col sm:flex-row justify-between items-center gap-8">
        <div className="text-left">
          <p className="text-2xl font-black uppercase italic tracking-tighter">LotEngine</p>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Headless Dealership Infrastructure</p>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-50">
          <p>© 2026 {tenant.business_name}</p>
          <p>System Status: Optimal</p>
        </div>
      </footer>
    </main>
  );
}
