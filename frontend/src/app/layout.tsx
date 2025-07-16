import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Produtos e Combos",
  description: "Busque produtos e encontre os melhores combos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              🛍️ Sistema de Produtos e Combos
            </h1>
            <p className="text-center text-gray-600 mt-2">
              Encontre produtos e descubra os melhores combos para economizar
            </p>
          </div>
        </header>
        {children}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              Sistema de Produtos e Combos - Desenvolvido com Next.js, Node.js e
              PostgreSQL
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
