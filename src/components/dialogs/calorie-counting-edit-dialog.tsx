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
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useCalorieSettings } from "@/hooks/localStorage-related/useCalorieSettings";
import { useState } from "react";
import { useUserSetting } from '@/hooks/useUserSetting'
import { useAuth } from "@/contexts/AuthContext";

export function CalorieCountingEditDialog() {
  const { isLoggedIn } = useAuth();
  const { updateSetting } = useUserSetting()
  const { calorieFactors } = useUserPreferences();
  const { calorieFactorLists, setCalorieFactorLists, updateChecked, updateValue } = useCalorieSettings();
  const [open, setOpen] = useState(false);

  const checkLogin = () => {
    if (!isLoggedIn) alert("此功能請登入後使用");
    return isLoggedIn;
  }

  const handleCalorieSettingCheck = (checked: boolean, index: number): void => {
    if (!checkLogin()) return;
    updateChecked(checked, index);
  }

  const handleCalorieSettingValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!checkLogin()) return;
    const { id, value } = e.target;
    updateValue(id, value);
  }

  const handleDialogOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && isLoggedIn && JSON.stringify(calorieFactorLists) !== JSON.stringify(calorieFactors)) {
      setCalorieFactorLists(calorieFactors);
    }
    if (!isOpen && isLoggedIn) updateSetting('calorie', calorieFactorLists);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
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
