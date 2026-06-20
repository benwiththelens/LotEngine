import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const headerList = await headers();
  const host = headerList.get("host") || "";

  // --- SERVER-SIDE AUTH GATE ---
  // Validate session before any admin HTML is sent to the browser.
  // This is the hard boundary — the client-side check in each page is a secondary fallback.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to the correct login path based on domain type
    const isMarketingDomain =
      host.includes('localhost') ||
      host.includes('lot-engine.com') ||
      host.includes('www.lot-engine.com');

    const loginPath = isMarketingDomain
      ? `/${domain}/login`
      : `/login`;

    redirect(loginPath);
  }

  // Define marketing domains that use subpaths for tenants
  const isMarketingDomain =
    host.includes('localhost') ||
    host.includes('lot-engine.com') ||
    host.includes('www.lot-engine.com');

  return (
    <AdminLayoutClient
      domain={domain}
      isMarketingDomain={isMarketingDomain}
    >
      {children}
    </AdminLayoutClient>
  );
}
