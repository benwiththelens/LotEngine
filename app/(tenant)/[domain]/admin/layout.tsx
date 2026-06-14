import { headers } from "next/headers";
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
