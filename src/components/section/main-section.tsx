import BioInfoSection from "./bio-info-section";
import BioResultSection from "./bio-result-section";
import {
  Card,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProductSearchSection from "./product-search-section";
import ProductCalculateSection from "./product-calculate-section";
import { ProductProvider } from "@/contexts/ProductContext";

export default function MainSection() {
  return (
    <ProductProvider>
      <div className="flex gap-4">
        <Card className="w-[845px] my-[20px] ml-[20px]">
          <div className="flex">
            <div>
              <CardHeader>
                <CardTitle>營養計算機</CardTitle>
                {/* <CardDescription>請輸入您的身高、體重、年齡及性別</CardDescription> */}
              </CardHeader>
              <BioInfoSection />
            </div>
            <Separator orientation="vertical" />
            {/* <div className="w-0.5 h-[90%] bg-[var(--sidebar-border)] mx-auto opacity-50"></div> */}
            <BioResultSection />
          </div>
        </Card>

        <Card className="w-[calc(100vw-905px)] my-[20px] mr-[20px]">
          <CardHeader>
            <CardTitle>營養品查詢</CardTitle>
          </CardHeader>
          <ProductSearchSection />
        </Card>
      </div>

      <Card className="mx-[20px] mb-[20px]">
        <CardHeader>
          <CardTitle>營養品成分計算</CardTitle>
        </CardHeader>
        <ProductCalculateSection />
      </Card>
    </ProductProvider>
  )
}