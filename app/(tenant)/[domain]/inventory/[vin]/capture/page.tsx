import CaptureModule from "@/app/(dashboard)/components/CaptureModule";
import { supabase as publicSupabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function CapturePage({
  params,
}: {
  params: Promise<{ domain: string; vin: string }>;
}) {
  const { domain, vin } = await params;

  // 1. Auth Guard: Check for session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    const isMarketingDomain = domain === 'localhost:3000' || domain === 'lot-engine.com' || domain === 'www.lot-engine.com';
    const currentPath = encodeURIComponent(`/inventory/${vin}/capture`);
    const loginPath = isMarketingDomain ? `/${domain}/login?next=${currentPath}` : `/login?next=${currentPath}`;
    redirect(loginPath);
  }

  // 2. Fetch tenant for brand color (using publicSupabase or server supabase)
  const { data: tenant } = await publicSupabase
    .from("tenants")
    .select("color_primary")
    .eq("domain", domain)
    .single();

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <CaptureModule 
        vin={vin} 
        mode="retail" 
        tenantBrandColor={tenant?.color_primary || "#0055FF"} 
      />
    </div>
  );
}
