// app/layout.tsx
import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "KinéPlan — Programmes d'exercices",
  description: "Gestionnaire de programmes d'exercices pour kinésithérapeutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${instrumentSerif.variable} ${dmSans.variable}`}
    >
      <body className="font-body bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/exercises" className="flex items-center gap-2.5 group">
              <span className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                K
              </span>
              <span className="font-display text-lg text-stone-800">
                KinéPlan
              </span>
            </a>
            <nav className="flex items-center gap-1">
              <a
                href="/exercises"
                className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Exercices
              </a>
              <a
                href="/programs"
                className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Programmes
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-screen-xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
