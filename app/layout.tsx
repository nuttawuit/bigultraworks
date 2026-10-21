import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Big Ultra Works",
  description: "System Control Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-gray-50 text-gray-900 overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}