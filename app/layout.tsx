import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { Analytics } from "@vercel/analytics/next";
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
  
  const { data: tenant } = await supabase
    .from("tenants")
    .select("business_name")
    .eq("domain", host)
    .single();

  return {
    title: tenant?.business_name || "LotEngine",
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
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", host)
    .single();

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
