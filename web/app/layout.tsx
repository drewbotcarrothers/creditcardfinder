import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canadian Credit Card Finder | Best Cards 2025",
  description: "Find and compare the best Canadian credit cards. Cash back, travel, low interest, and student cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
