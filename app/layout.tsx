import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "StudyHub",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeManager />
        <NotesProvider>
          <DiagramsProvider>{children}</DiagramsProvider>
        </NotesProvider>
      </body>
    </html>
  );
}
