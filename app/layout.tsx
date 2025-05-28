import type { Metadata } from "next";
import "./globals.css";
import { Meie_Script } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Load Meie Script font from Google
const meieScript = Meie_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-meie-script",
});

// Add this to load your local Futura font
const futura = localFont({
  src: [
    { path: "../public/fonts/futura-bk-bt-book.ttf", weight: "300" },
    { path: "../public/fonts/futuraLT.ttf", weight: "400" },
    { path: "../public/fonts/futuramdbt_bold.otf", weight: "500" },
  ],
  variable: "--font-futura",
});

export const metadata: Metadata = {
  title: "Muse",
  description: "Muse - Fashion & Style",
  openGraph: {
    title: "Muse",
    description: "Muse - Fashion & Style",
    images: [
      {
        url: "/logoheader.png",
        width: 1200,
        height: 630,
        alt: "Muse Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muse",
    description: "Muse - Fashion & Style",
    images: ["/logoheader.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`flex flex-col w-full antialiased ${meieScript.variable} ${futura.variable}`}
      >
        <Navbar />
        {children}
        <Footer />
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="font-futura"
        />
      </body>
    </html>
  );
}
