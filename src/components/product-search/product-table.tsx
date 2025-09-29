import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApiProductData } from "@/types/api"
import { getLinkPath } from "@/utils/external-links"

export default function ProductTable({ 
  productList,
  setProductList,
  currentPageData
}: { 
  productList: string[],
  setProductList: React.Dispatch<React.SetStateAction<string[]>>,
  currentPageData: ApiProductData[]
}) {
  const handleAddToCalculate = (productId: string): void => {
    const existingProduct = productList.includes(productId)
    if (existingProduct) return

    setProductList((prevData: string[]) => [...prevData, productId])
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>品名</TableHead>
          <TableHead>品牌</TableHead>
          <TableHead>劑型</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentPageData.map((item: ApiProductData) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-[200px]" style={{ textWrap: 'wrap'}}>
              <Link href={getLinkPath(item.id)} target="_blank">
                <p>{item.name}</p>
                {item.engName && <p className="text-xs">{item.engName}</p>}
                {item.categories && item.categories.length > 0 && item.categories.map((category: string) => (
                  <Badge key={category} className="mt-1 mr-1" variant="secondary">
                    {category}
                  </Badge>
                ))}
              </Link>
            </TableCell>
            <TableCell>{item.brand}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>
              <Button variant={productList.includes(item.id) ? "secondary" : "outline"} onClick={() => handleAddToCalculate(item.id)}>
                {productList.includes(item.id) ? '已加入' : '加入'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}