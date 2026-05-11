import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL ?? "https://nutrition-product.vercel.app";
const siteDescription = "專業的營養品資料查詢平台，提供完整的產品資訊、營養成分和規格查詢服務";

export const metadata: Metadata = {
  title: {
    default: "NutriBase | 營養品查詢計算",
    template: "%s | NutriBase",
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NutriBase",
    description: siteDescription,
    url: siteUrl,
    siteName: "NutriBase",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriBase",
    description: siteDescription,
  },
  verification: {
    google: "YgmxiBR8p0Ay-ZnXVpG2N0V_-9lJMBucav5vhfRYKgA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-200`}
      >
        <AuthProvider>
          <UserPreferencesProvider>
            {children}
          </UserPreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
