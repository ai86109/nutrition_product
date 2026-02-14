import { Button } from "@/components/ui/button"
import { useProduct } from "@/contexts/ProductContext"
import { useHistorySettings } from "@/hooks/localStorage-related/useHistorySettings"
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function HistoryBlock() {
  const { history } = useUserPreferences()
  const { deleteList } = useHistorySettings()
  const { allProducts, productList, setProductList } = useProduct()
  const historyList = allProducts.filter((product) => history.includes(product.id))

  const handleAddToCalculate = (productId: string): void => {
    const existingProduct = productList.includes(productId)
    if (existingProduct) return

    setProductList((prevData: string[]) => [...prevData, productId])
  }

  return (
    <Accordion type="single" defaultValue="item-1" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="mx-4">
          <p>近期加入</p>
        </AccordionTrigger>
        <AccordionContent>
          {historyList.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 mb-2">
              <p>{item.name}</p>
              <div className="flex gap-2">
                <Button className="w-[50px] h-[30px] text-xs" variant={productList.includes(item.id) ? "secondary" : "outline"} onClick={() => handleAddToCalculate(item.id)}>
                  {productList.includes(item.id) ? '已加入' : '加入'}
                </Button>
                <Button className="w-[50px] h-[30px] text-xs" variant={"outline"} onClick={() => deleteList(item.id)}>刪除</Button>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}