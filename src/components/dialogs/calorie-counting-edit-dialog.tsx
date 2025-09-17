import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { type CalorieFactorList } from "@/hooks/useCalorieSettings";

export function CalorieCountingEditDialog({ 
  calorieFactorLists,
  updateChecked,
  updateValue 
}: { 
  calorieFactorLists: CalorieFactorList[],
  updateChecked: (checked: boolean, index: number) => void,
  updateValue: (id: string, value: string) => void
}) {
  const handleCalorieSettingCheck = (checked: boolean, index: number): void => {
    updateChecked(checked, index);
  }

  const handleCalorieSettingValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    updateValue(id, value);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[240px] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>熱量計算參數</DialogTitle>
          <DialogDescription>編輯、管理你的熱量計算參數</DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>參數</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calorieFactorLists.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox id={`check-${index}`} checked={item.checked} onCheckedChange={(checked) => handleCalorieSettingCheck(!!checked, index)} />
                </TableCell>
                <TableCell>
                  <Input className="w-[70px]" id={`input-${index}`} type="number" step="1" placeholder="" value={item.value} onChange={handleCalorieSettingValueChange} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
