import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./styles.css";
import "./AboutUs/style.css";
import "./ContactUs/style.css";
import "./Donation/style.css";
import "./GetFood/style.css";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Food Donation Platform",
  description: "Join the fight against food waste by donating or receiving surplus food",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        <main style={{ paddingTop: '80px' }}>
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
