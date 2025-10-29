import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google"; // Corrected import
import "./globals.css";
import { AuthProvider } from '@/context/authProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ // Added Inter font configuration
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Gerenciamento de Produtos",
  description: "Sistema de Gerenciamento de Produtos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`} // Added Inter font variable
      ><AuthProvider>
        {children}
      </AuthProvider>
        
      </body>
    </html>
  );
}