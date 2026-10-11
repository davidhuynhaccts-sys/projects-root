import type { Metadata, Viewport } from 'next';
import './superelly.css';
export const metadata: Metadata = {
 title: 'Super Elly | Little hero. Big adventures.',
 description: 'Storybook adventures with Super Elly. Play Bakery Monsters Level 1.',
 manifest: '/superelly/manifest.webmanifest',
 appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Super Elly' },
 icons: { icon: '/superelly/icon.svg', apple: '/superelly/icon-192.png' }
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover', themeColor: '#f6dfc0' };
export default function Layout({children}: {children: React.ReactNode}) {return <div className="elly-app">{children}</div>}
