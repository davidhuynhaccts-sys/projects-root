import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Ding",
  description: "A tiny list that keeps you moving.",
  manifest: "/ding-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ding",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function DingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
