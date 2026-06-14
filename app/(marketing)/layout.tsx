import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LotEngine",
  description: "The Headless Dealership Operating System.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-smooth">
      {children}
    </div>
  );
}
