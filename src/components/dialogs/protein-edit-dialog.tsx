import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type ProteinList } from "@/hooks/useProteinSettings"

export function ProteinEditDialog({ proteinList, updateChecked, updateValue, resetToDefault }: { proteinList: ProteinList[], updateChecked: (checked: boolean, index: number) => void, updateValue: (id: string, value: string) => void, resetToDefault: () => void }) {
  const handleProteinSettingCheck = (checked: boolean, index: number): void => {
    updateChecked(checked, index);
  }

  const handleProteinSettingValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    updateValue(id, value);
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[240px] sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Protein 參數</DialogTitle>
          <DialogDescription>編輯、管理你的 Protein 參數</DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>參數</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proteinList.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox id={`check-${index}`} checked={item.checked} onCheckedChange={(checked) => handleProteinSettingCheck(!!checked, index)} />
                </TableCell>
                <TableCell>
                  <Input className="w-[70px]" id={`input-${index}`} type="number" step="0.1" placeholder="" value={item.value} onChange={handleProteinSettingValueChange} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button className="w-[100px]" variant="destructive" onClick={resetToDefault}>重置為預設</Button>
      </DialogContent>
    </Dialog>
  );
}