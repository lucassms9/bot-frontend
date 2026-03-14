import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bot de Apostas - Handicap Asiático",
  description: "Sistema inteligente de apostas no Brasileirão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background min-h-screen text-foreground`}>
        <div className="min-h-screen">
          {/* Header */}
          <header className="bg-zinc-950 border-b border-green-500/20 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
              <span className="text-2xl">⚽</span>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                  Bot de Apostas
                </h1>
                <p className="text-xs text-zinc-400">Handicap Asiático - Brasileirão</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
