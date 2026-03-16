import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./styles.css";
// import "./components.css";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


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
