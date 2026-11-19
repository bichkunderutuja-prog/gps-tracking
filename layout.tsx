import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
export const metadata: Metadata = {
  title: "SegreMed | Smart Medical-Waste Management",
  description:
    "A smarter approach to medical-waste collection, segregation, and management.",
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
