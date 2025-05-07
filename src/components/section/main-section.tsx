import BioInfoSection from "./bio-info-section";
import BioResultSection from "./bio-result-section";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function MainSection() {
  return (
    <Card className="w-[400px] m-[20px]">
      <CardHeader>
        <CardTitle>營養計算機</CardTitle>
        <CardDescription>請輸入您的身高、體重、年齡及性別</CardDescription>
      </CardHeader>
      <BioInfoSection />
      <div className="w-90 h-0.5 bg-[var(--sidebar-border)] mx-auto opacity-50"></div>
      <BioResultSection />
    </Card>
  )
}