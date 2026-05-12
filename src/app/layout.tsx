import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL ?? "https://nutrition-product.vercel.app";
const siteDescription = "專業的營養品資料查詢平台，提供完整的產品資訊、營養成分和規格查詢服務，專為臨床營養師設計，支援 TDEE、IBW、ABW 估算與多產品比較。";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NutriBase",
  url: siteUrl,
  description:
    "衛福部核准特定疾病配方食品資料庫，提供管灌配方、口服補充品的熱量、蛋白質、DRIs 計算。專為臨床營養師設計，支援 TDEE、IBW、ABW 估算與多產品比較。",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  inLanguage: "zh-TW",
  audience: {
    "@type": "Audience",
    audienceType: "臨床營養師",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TWD",
  },
};

export const metadata: Metadata = {
  title: {
    default: "營養品查詢計算 | NutriBase 營養師工具",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-200 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <UserPreferencesProvider>
            <div className="flex-1">{children}</div>
            <Footer />
          </UserPreferencesProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
