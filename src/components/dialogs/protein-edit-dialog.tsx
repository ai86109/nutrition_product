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
import { useState } from "react"
import { toast } from "sonner"
import { useProteinSettings } from "@/hooks/localStorage-related/useProteinSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useUserSetting } from '@/hooks/useUserSetting'
import { Beef, Pencil } from "lucide-react";

export function ProteinEditDialog() {
  const { isLoggedIn } = useAuth();
  const { updateSetting } = useUserSetting()
  const { proteinFactors } = useUserPreferences()
  const { proteinList, setProteinList, updateChecked, updateValue, resetToDefault } = useProteinSettings();
  const [open, setOpen] = useState(false);

  const checkLogin = () => {
    if (!isLoggedIn) toast.error("此功能請登入後使用");
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
        <Button variant="ghost" size="icon" aria-label="編輯蛋白質參數">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-md bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <Beef className="size-4" />
            </span>
            蛋白質參數
          </DialogTitle>
          <DialogDescription>編輯、管理你的蛋白質參數</DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
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
                  <Input className="w-20 tabular-nums" id={`input-${index}`} type="number" step="0.1" placeholder="" value={item.value} onChange={handleProteinSettingValueChange} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" size="sm" onClick={handleReset}>重置為預設</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}