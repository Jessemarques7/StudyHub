import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Lexend } from "next/font/google";
import "./globals.css";

import { NotesProvider } from "@/contexts/NotesContext";
import { DiagramsProvider } from "@/contexts/DiagramsContext";
import { ThemeManager } from "@/components/theme/theme-manager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Study Hub - Domine seu Futuro",
  description:
    "A plataforma definitiva para estudantes que buscam excelência acadêmica e profissional.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lexend.variable} font-sans antialiased`}
      >
        <ThemeManager />
        <NotesProvider>
          <DiagramsProvider>{children}</DiagramsProvider>
        </NotesProvider>
      </body>
    </html>
  );
}
