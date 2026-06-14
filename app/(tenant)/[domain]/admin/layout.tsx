"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { 
    href: "/admin/vehicles", 
    label: "Inventory", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
    ) 
  },
  { 
    href: "/admin/service", 
    label: "Service", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.7a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.7z"/></svg>
    ) 
  },
  /* { 
    href: "/admin/leads", 
    label: "Leads", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ) 
  }, */
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { domain } = useParams() as { domain: string };
  const pathname = usePathname();
  const router = useRouter();

  const getLink = (href: string) => {
    if (typeof window === 'undefined') return href;
    const hostname = window.location.hostname;
    const isMarketingDomain = hostname === 'localhost' || hostname === 'lot-engine.com' || hostname === 'www.lot-engine.com';
    
    if (!isMarketingDomain) return href;
    // Always prefix with domain on marketing domain to ensure we hit tenant routes
    return `/${domain}${href === '/' ? '' : href}`;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(getLink("/login"));
  };

  return (
    <div className="flex min-h-screen bg-zinc-100 pb-16 md:pb-0">
      {/* Slim Admin Sidebar */}
      <aside className="hidden md:flex w-20 bg-black text-white flex-col items-center py-6 shrink-0 border-r-4 border-brand-primary/20">
        {/* Compact Logo Mark */}
        <div className="mb-10 text-black">
          <div className="relative w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            <img src="/logo.png" alt="LotEngine Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Icons Nav */}
        <nav className="flex-1 flex flex-col gap-4 text-white">
          {NAV_ITEMS.map((item) => {
            const finalHref = getLink(item.href);
            const isActive = pathname.startsWith(finalHref);
            return (
              <Link 
                key={item.href}
                href={finalHref} 
                title={item.label}
                className={`w-12 h-12 flex items-center justify-center transition-all border-2 ${
                  isActive 
                    ? 'bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(227,66,52,1)]' 
                    : 'text-white/40 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-6 items-center">
          <Link 
            href={getLink("/")} 
            title="Public Site"
            className="text-white/30 hover:text-white transition-colors text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="4"/></svg>
          </Link>
          
          <button 
            onClick={handleSignOut}
            title="Sign Out"
            className="w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t-2 border-brand-primary/20 flex justify-around items-center z-[100] px-4 text-white">
        {NAV_ITEMS.map((item) => {
          const finalHref = getLink(item.href);
          const isActive = pathname.startsWith(finalHref);
          return (
            <Link 
              key={item.href}
              href={finalHref}
              className={`p-3 transition-all ${
                isActive 
                  ? 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(227,66,52,1)]' 
                  : 'text-white/40'
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
        
        {/* Mobile Sign Out */}
        <button 
          onClick={handleSignOut}
          className="p-3 text-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
