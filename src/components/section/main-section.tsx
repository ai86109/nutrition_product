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

export default function MainSection() {
  return (
    <ProductProvider>
      {/* mobile 版 */}

      {/* desktop 版 */}
      <div className="flex flex-col gap-4 m-4">
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

      {/* tab 版 */}
      {/* <Tabs defaultValue="bioInfo" className="m-2">
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
      </Tabs> */}
    </ProductProvider>
  )
}