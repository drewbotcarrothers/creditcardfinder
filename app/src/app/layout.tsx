import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { CompareProvider } from "@/context/CompareContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canadian Credit Card Finder | Compare & Find Your Perfect Card 2025",
  description: "Canadian Credit Card Finder helps you compare the best Canadian credit cards. Filter by rewards, cashback, travel, and low interest rates. Find your perfect card.",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7909541570116920"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <CompareProvider>
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
            <Header />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </CompareProvider>
      </body>
    </html>
  );
}
