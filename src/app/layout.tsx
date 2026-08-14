import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Large Earthquakes This Year",
  description:
    "Is this year unusually active for large earthquakes? Compare year-to-date earthquake counts with historical data from USGS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
