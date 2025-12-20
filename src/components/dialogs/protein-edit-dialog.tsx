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
import { ProteinList } from "@/types"
import { useState } from "react"
import { useProteinSettings } from "@/hooks/localStorage-related/useProteinSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useUserSetting } from '@/hooks/useUserSetting'

export function ProteinEditDialog() {
  const { isLoggedIn } = useAuth();
  const { updateSetting } = useUserSetting()
  const { proteinFactors } = useUserPreferences()
  const { proteinList, setProteinList, updateChecked, updateValue, resetToDefault } = useProteinSettings();
  const [open, setOpen] = useState(false);

  const checkLogin = () => {
    if (!isLoggedIn) alert("此功能請登入後使用");
    return isLoggedIn;
  }

  const handleProteinSettingCheck = (checked: boolean, index: number): void => {
    if (!checkLogin()) return;
    updateChecked(checked, index);
  }

  const handleProteinSettingValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!checkLogin()) return;
    const { id, value } = e.target;
    updateValue(id, value);
  }

  const handleReset = (): void => {
    if (!checkLogin()) return;
    resetToDefault();
  }

  const handleDialogOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && isLoggedIn && JSON.stringify(proteinList) !== JSON.stringify(proteinFactors)) {
      setProteinList(proteinFactors);
    }
    if (!isOpen && isLoggedIn) updateSetting('protein', proteinList);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
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

        <Button className="w-[100px]" variant="destructive" onClick={handleReset}>重置為預設</Button>
      </DialogContent>
    </Dialog>
  );
}