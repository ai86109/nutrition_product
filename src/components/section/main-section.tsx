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
      <div className="flex m-[20px] gap-4">
        <div className="flex flex-col w-[845px] gap-4">
          <Card>
            <div className="flex">
              <div>
                <CardHeader>
                  <CardTitle>營養計算機</CardTitle>
                  {/* <CardDescription>請輸入您的身高、體重、年齡及性別</CardDescription> */}
                </CardHeader>
                <BioInfoSection />
              </div>
              <Separator orientation="vertical" />
              <BioResultSection />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>營養品成分計算</CardTitle>
            </CardHeader>
            <ProductCalculateSection />
          </Card>
        </div>

        <Card className="w-[calc(100vw-905px)]">
          <CardHeader>
            <CardTitle>營養品查詢</CardTitle>
          </CardHeader>
          <ProductSearchSection />
        </Card>
      </div>
    </ProductProvider>
  )
}