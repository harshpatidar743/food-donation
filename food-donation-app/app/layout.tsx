import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./styles.css";
// import "./components.css";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Script from "next/script";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
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
      <body className={`${inter.variable} ${robotoMono.variable}`}>

        {/* ✅ Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T8FL7NJWTR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-T8FL7NJWTR');
        `}
        </Script>

        <Navbar />
        <div className="app-shell">
          {children}
        </div>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
