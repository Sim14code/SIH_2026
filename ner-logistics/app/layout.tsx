import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'NER LogisticsAI — Smart Logistics Intelligence Platform for North Eastern Region',
  description:
    'AI-powered logistics and accessibility intelligence platform for North Eastern India. Real-time GIS mapping, dynamic risk routing, fleet telemetry, and offline crowdsourcing for NER corridors.',
  keywords: ['NER logistics', 'Northeast India', 'GIS', 'Supabase', 'landslide risk', 'smart logistics'],
  openGraph: {
    title: 'NER LogisticsAI',
    description: 'Smart Logistics Intelligence for North Eastern Region',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Leaflet CSS loaded via package, not CDN — no SRI needed */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        {/* TODO(security): Add CSP nonce-based policy before production deployment */}
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
