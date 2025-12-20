import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { TDEEList } from "@/types"
import { useUserSetting } from '@/hooks/useUserSetting'
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const DEFAULT_TDEE_ITEM: TDEEList = {
  name: '',
  activityFactor: '',
  stressFactor: '',
}

export function TDEEEditDialog() {
  const { tdeeFactors } = useUserPreferences()
  const { addSetting, deleteSetting } = useUserSetting()
  const [newTDEEFactors, setNewTDEEFactors] = useState(DEFAULT_TDEE_ITEM);

  const handleNewFactorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewTDEEFactors((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  const handleDelete = (index: number) => {
    deleteSetting('tdee', index);
  }

  const handleAdd = () => {
    const { name, activityFactor, stressFactor } = newTDEEFactors;
    if (!name || !activityFactor || !stressFactor) {
      alert("欄位不能為空");
      return;
    }

    // add to list
    const newItem = {
      name: name.trim(),
      activityFactor: Number(activityFactor),
      stressFactor: Number(stressFactor),
    }
    addSetting('tdee', newItem);

    // reset input fields
    setNewTDEEFactors(DEFAULT_TDEE_ITEM);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>TDEE 參數</DialogTitle>
          <DialogDescription>編輯、管理你的 TDEE 參數</DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名稱</TableHead>
              <TableHead>活動因子</TableHead>
              <TableHead>壓力因子</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tdeeFactors.length > 0 && tdeeFactors.map((factor, index) => (
              <TableRow key={`${factor.name}-${index}`}>
                <TableCell className="max-w-[50px] text-wrap whitespace-normal sm:max-w-[100px]">{factor.name}</TableCell>
                <TableCell>{factor.activityFactor}</TableCell>
                <TableCell>{factor.stressFactor}</TableCell>
                <TableCell>
                  <Button className="text-xs sm:text-sm" variant="destructive" onClick={() => handleDelete(index)}>刪除</Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Input className="w-[60px] sm:w-[100px]" id="name" type="text" placeholder="" value={newTDEEFactors.name} onChange={handleNewFactorInputChange} />
              </TableCell>
              <TableCell>
                <Input className="w-[55px] sm:w-[60px]" id="activityFactor" type="number" step={0.1} placeholder="" value={newTDEEFactors.activityFactor} onChange={handleNewFactorInputChange} />
              </TableCell>
              <TableCell>
                <Input className="w-[55px] sm:w-[60px]" id="stressFactor" type="number" step={0.1} placeholder="" value={newTDEEFactors.stressFactor} onChange={handleNewFactorInputChange} />
              </TableCell>
              <TableCell>
                <Button className="text-xs sm:text-sm" onClick={handleAdd}>新增</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}