import BioInfoSection from "./bio-info-section";
import BioResultSection from "./bio-result-section";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProductSearchSection from "./product-search-section";
import ProductCalculateSection from "./product-calculate-section";
import { ProductProvider } from "@/contexts/ProductContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function MainSection() {
  return (
    <ProductProvider>
      {/* mobile */}
      <div className="lg:hidden">
        <Accordion type="single" defaultValue="item-1" collapsible className="mx-2">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center">
                <span className="text-lg font-bold">計算機 & 搜尋</span>
                <span className="ml-2 text-[10px]">(點擊可以收起)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Tabs defaultValue="bioInfo" className="mx-2">
                <TabsList className="grid grid-cols-2" style={{ width: "unset" }}>
                  <TabsTrigger value="bioInfo">營養計算機</TabsTrigger>
                  <TabsTrigger value="search">營養品搜尋</TabsTrigger>
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
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Separator />

        <CardHeader className="my-2">
          <CardTitle>營養品成分計算</CardTitle>
        </CardHeader>
        <ProductCalculateSection />
      </div>

      {/* desktop */}
      <div className="hidden lg:flex m-[20px] gap-4">
        <div className="flex flex-col w-[845px] gap-4">
          <Card>
            <div className="flex">
              <div className="w-[300px]">
                <CardHeader>
                  <CardTitle>營養計算機</CardTitle>
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

        <Card className="w-[calc(100vw-905px)] min-w-[400px]">
          <CardHeader>
            <CardTitle>營養品查詢</CardTitle>
          </CardHeader>
          <ProductSearchSection />
        </Card>
      </div>
    </ProductProvider>
  )
}