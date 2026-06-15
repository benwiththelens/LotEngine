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
    openGraph: {
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'LotEngine - The Headless Dealership OS',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-image.png'],
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' },
      ],
      other: [
        { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
        { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
      ],
    },
    manifest: '/site.webmanifest',
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

  // If no specific tenant match is found for the host, 
  // check if we are on localhost or demo, and use Cobalt Blue as the platform default.
  // Otherwise, fallback to the first tenant as a failsafe.
  if (!tenant) {
    const isPlatformDomain = host.includes('localhost') || host.includes('lot-engine.com');
    
    if (isPlatformDomain) {
      tenant = {
        color_primary: "#0047AB",
        color_background: "#FFFFFF"
      } as any;
    } else {
      const { data: fallback } = await supabase.from("tenants").select("*").limit(1).single();
      tenant = fallback;
    }
  }

  // Inject theme variables from the database
  const themeStyles = {
    "--theme-primary": tenant?.color_primary || "#0047AB",
    "--theme-bg": tenant?.color_background || "#FFFFFF",
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetBrainsMono.variable} h-full antialiased scroll-smooth`}
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
