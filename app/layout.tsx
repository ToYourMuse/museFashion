import type { Metadata } from "next";
import "./globals.css";
import { Meie_Script } from "next/font/google";
import localFont from "next/font/local"; // Add this import
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Load Meie Script font from Google
const meieScript = Meie_Script({
  weight: "400", // Meie Script is only available in weight 400
  subsets: ["latin"],
  display: "swap",
  variable: "--font-meie-script",
});

// Add this to load your local Futura font
const futura = localFont({
  src: [
    { path: "../public/fonts/futura-bk-bt-book.ttf", weight: "300" },
    { path: "../public/fonts/futuraLT.ttf", weight: "400" },
    { path: "../public/fonts/futuramediumbt.ttf", weight: "500" },
  ],
  variable: "--font-futura",
});

export const metadata: Metadata = {
  title: "Muse",
  description: "Muse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased  ${meieScript.variable} ${futura.variable}`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
