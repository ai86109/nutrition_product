import { Badge } from "@/components/ui/badge";
import type { ProductData } from "@/types/nutrition"
import { memo, useState } from "react";
import { ProductDetailDialog } from "@/components/dialogs/product-detail-dialog";

interface ProductNameProps {
  id: ProductData['id']
  name: ProductData['name']
  engName: ProductData['engName']
  brand: ProductData['brand']
  categories: ProductData['categories']
}

export const ProductName = memo(function ProductName({ id, name, engName, brand, categories }: ProductNameProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const isShowBadge = categories && categories.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        aria-label={`查看 ${name} 詳細資訊`}
      >
        <p className="text-wrap w-[200px] lg:w-auto">{name}</p>
        {engName && <p className="text-xs text-wrap w-[200px] lg:w-auto">{engName}</p>}
        {isShowBadge && categories.map((category) => (
          <Badge key={category} className="mt-1 mr-1" variant="secondary">
            {category}
          </Badge>
        ))}
      </button>

      <ProductDetailDialog
        item={{ id, name, engName, brand, categories }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
})