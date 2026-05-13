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
import { toast } from "sonner";
import { Flame, Pencil } from "lucide-react";
import { useUserSetting } from '@/hooks/useUserSetting'
import { useAuth } from "@/contexts/AuthContext";

export function CalorieCountingEditDialog() {
  const { isLoggedIn } = useAuth();
  const { updateSetting } = useUserSetting()
  const { calorieFactors } = useUserPreferences();
  const { calorieFactorLists, setCalorieFactorLists, updateChecked, updateValue } = useCalorieSettings();
  const [open, setOpen] = useState(false);

  const checkLogin = () => {
    if (!isLoggedIn) toast.error("此功能請登入後使用");
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
        <Button variant="ghost" size="icon" aria-label="編輯熱量計算參數">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-md bg-orange-500/10 p-1.5 text-orange-600 dark:text-orange-400">
              <Flame className="size-4" />
            </span>
            熱量計算參數
          </DialogTitle>
          <DialogDescription>編輯、管理你的熱量計算參數</DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
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
                  <Input className="w-20 tabular-nums" id={`input-${index}`} type="number" step="1" placeholder="" value={item.value} onChange={handleCalorieSettingValueChange} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
