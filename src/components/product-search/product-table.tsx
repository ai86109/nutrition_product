import { ApiProductListData } from "@/types"
import ProductListItem from "./product-list-item"

export default function ProductTable({ currentPageData }: { currentPageData: ApiProductListData[] }) {
  return (
    <div className="flex flex-col">
      {currentPageData.map((item: ApiProductListData) => (
        <ProductListItem key={item.id} item={item} />
      ))}
    </div>
  )
}
