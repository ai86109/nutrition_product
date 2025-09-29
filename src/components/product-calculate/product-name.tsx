import Link from "next/link";
import { getLinkPath } from "@/utils/external-links"
import { Badge } from "@/components/ui/badge";
import type { ProductData } from "@/types/nutrition"
import { memo } from "react";

interface ProductNameProps {
  id: ProductData['id']
  name: ProductData['name']
  engName: ProductData['engName']
  categories: ProductData['categories']
}

export const ProductName = memo(function ProductName({ id, name, engName, categories }: ProductNameProps): React.ReactElement {
  const isShowBadge = categories && categories.length > 0;

  return (
    <Link href={getLinkPath(id)} target="_blank">
      <p className="text-wrap w-[200px] lg:w-auto">{name}</p>
      {engName && <p className="text-xs text-wrap w-[200px] lg:w-auto">{engName}</p>}
      {isShowBadge && categories.map((category) => (
        <Badge key={category} className="mt-1 mr-1" variant="secondary">
          {category}
        </Badge>
      ))}
    </Link>
  )
})