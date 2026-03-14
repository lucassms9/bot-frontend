import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";

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
        <AuthProvider>
          <div className="min-h-screen">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
