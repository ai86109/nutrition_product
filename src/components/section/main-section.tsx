import BioInfoSection from "./bio-info-section";
import BioResultSection from "./bio-result-section";
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProductSearchSection from "./product-search-section";
import ProductCalculateSection from "./product-calculate-section";
import { ProductProvider } from "@/contexts/ProductContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function MainSection() {
  return (
    <ProductProvider>
      <Tabs defaultValue="bioInfo" className="m-2">
        <TabsList className="grid grid-cols-3" style={{ width: "unset" }}>
          <TabsTrigger value="bioInfo">計算機</TabsTrigger>
          <TabsTrigger value="search">營養品搜尋</TabsTrigger>
          <TabsTrigger value="calculate">營養品成分計算</TabsTrigger>
        </TabsList>
        <TabsContent value="bioInfo">
          <Card>
            <BioInfoSection />
            <Separator />
            <BioResultSection />
          </Card>
        </TabsContent>
        <TabsContent value="search">
          <Card>
            <ProductSearchSection />
          </Card>
        </TabsContent>
        <TabsContent value="calculate">
          <Card>
            <ProductCalculateSection />
          </Card>
        </TabsContent>
      </Tabs>
    </ProductProvider>
  )
}