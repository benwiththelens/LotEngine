import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host") || "lot-engines.com";
  
  let { data: tenant } = await supabase
    .from("tenants")
    .select("business_name")
    .eq("domain", host)
    .single();

  if (!tenant) {
    const { data: fallback } = await supabase.from("tenants").select("business_name").limit(1).single();
    tenant = fallback;
  }

  return {
    title: "LotEngine",
    description: "The Headless Dealership Engine",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const host = headerList.get("host") || "lot-engines.com";

  // Fetch tenant data for dynamic branding
  let { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", host)
    .single();

  if (!tenant) {
    const { data: fallback } = await supabase.from("tenants").select("*").limit(1).single();
    tenant = fallback;
  }

  // Inject theme variables from the database
  const themeStyles = {
    "--theme-primary": tenant?.color_primary || "#E34234",
    "--theme-bg": tenant?.color_background || "#FFFFFF",
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body 
        className="min-h-full flex flex-col bg-brand-bg text-gray-900" 
        style={themeStyles}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
