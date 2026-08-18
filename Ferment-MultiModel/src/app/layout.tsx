import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "macOS Tahoe Web Desktop",
  description:
    "A web recreation of the macOS Tahoe desktop experience built with Next.js 14.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
