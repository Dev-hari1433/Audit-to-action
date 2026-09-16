import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AccessAssistant } from "@/components/access-assistant";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "AccessTrack — Accessibility Accountability",
  description: "Turn accessibility findings into assigned, verified action.",
  openGraph: {
    title: "AccessTrack — From Accessibility Audit to Action",
    description: "Every accessibility finding gets an owner, deadline, evidence, human verification and escalation.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AccessTrack accessibility accountability workflow" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AccessTrack — From Accessibility Audit to Action",
    description: "Turn accessibility findings into assigned, verified action.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <StoreProvider>
          {children}
          <AccessAssistant />
        </StoreProvider>
      </body>
    </html>
  );
}
