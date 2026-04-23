import { ApiProductData } from "@/types"
import ProductListItem from "./product-list-item"

export default function ProductTable({ currentPageData }: { currentPageData: ApiProductData[] }) {
  return (
    <div className="flex flex-col">
      {currentPageData.map((item: ApiProductData) => (
        <ProductListItem key={item.id} item={item} />
      ))}
    </div>
  )
}
