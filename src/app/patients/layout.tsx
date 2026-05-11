import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "病人追蹤",
  description: "管理病人資料與每日營養攝取紀錄，追蹤熱量、蛋白質及各項營養素達成狀況",
  alternates: {
    canonical: "/patients",
  },
  openGraph: {
    title: "病人追蹤 | NutriBase",
    description: "管理病人資料與每日營養攝取紀錄，追蹤熱量、蛋白質及各項營養素達成狀況",
  },
};

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
