import BioInfoSection from "./bio-info-section";
import BioResultSection from "./bio-result-section";
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function MainSection() {
  return (
    <ProductProvider>
      {/* mobile */}
      <div className="sm:hidden">
        <Accordion type="single" defaultValue="item-1" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="mx-4">
              <div className="flex items-center">
                <span className="text-lg font-bold">計算機 & 營養品搜尋</span>
                <span className="ml-2 text-[10px]">(點擊可以收起)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Tabs defaultValue="bioInfo" className="mx-2">
                <TabsList className="grid grid-cols-2" style={{ width: "unset" }}>
                  <TabsTrigger value="bioInfo">計算機</TabsTrigger>
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

        <div className="bg-white py-2">
          <CardHeader className="my-2">
            <CardTitle className="text-[20px]">營養品成分計算</CardTitle>
          </CardHeader>
          <ProductCalculateSection />
        </div>
      </div>

      {/* desktop */}
      <div className="hidden sm:flex flex-col gap-4 m-4">
        <Card>
          <div className="flex">
            <div className="flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-[20px]">計算機</CardTitle>
              </CardHeader>
              <BioInfoSection />
            </div>
            <Separator orientation="vertical" />
            <BioResultSection />
          </div>
        </Card>
        <Card>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={25}>
              <ProductSearchSection />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60} minSize={45}>
              <ProductCalculateSection />
            </ResizablePanel>
          </ResizablePanelGroup>
        </Card>
      </div>
    </ProductProvider>
  )
}