import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TerraCheck — Land Viability Assessment",
  description: "Know your land before you build. AI-powered environmental and regulatory pre-screening for Canadian land development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Auth0Provider>
        <body className={`${inter.variable} ${playfair.variable} antialiased`}>
          {children}
        </body>
      </Auth0Provider>
    </html>
  );
}
