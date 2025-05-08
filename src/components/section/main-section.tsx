import BioInfoSection from "./bio-info-section";
import BioResultSection from "./bio-result-section";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ProductSearchSection from "./product-search-section";
import ProductCalculateSection from "./product-calculate-section";
import { ProductProvider } from "@/contexts/ProductContext";

export default function MainSection() {
  return (
    <div className="flex">
      <Card className="w-[400px] m-[20px]">
        <CardHeader>
          <CardTitle>營養計算機</CardTitle>
          <CardDescription>請輸入您的身高、體重、年齡及性別</CardDescription>
        </CardHeader>
        <BioInfoSection />
        <div className="w-90 h-0.5 bg-[var(--sidebar-border)] mx-auto opacity-50"></div>
        <BioResultSection />
      </Card>

      <ProductProvider>
        <div className="w-[calc(100vw-400px)] my-[20px] flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>營養品查詢</CardTitle>
            </CardHeader>
            <ProductSearchSection />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>營養品成分計算</CardTitle>
            </CardHeader>
            <ProductCalculateSection />
          </Card>
        </div>
      </ProductProvider>
    </div>
  )
}