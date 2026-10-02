export const metadata = {
  title: "Pebbles",
  description: "A simple personal rhythm calendar.",
  robots: { index: false, follow: false },
  manifest: "/pebbles/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Pebbles",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#fff7fb",
};

export default function PebblesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
