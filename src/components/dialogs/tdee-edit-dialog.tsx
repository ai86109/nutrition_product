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
import { toast } from "sonner"
import { TDEEList } from "@/types"
import { useUserSetting } from '@/hooks/useUserSetting'
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useTdeeSettings } from "@/hooks/localStorage-related/useTdeeSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil, Trash2, Zap } from "lucide-react";
import {
  MAX_TDEE_NAME_LENGTH,
  TDEE_ACTIVITY_FACTOR_MIN,
  TDEE_ACTIVITY_FACTOR_MAX,
  TDEE_STRESS_FACTOR_MIN,
  TDEE_STRESS_FACTOR_MAX,
} from "@/utils/constants";

const DEFAULT_TDEE_ITEM: TDEEList = {
  name: '',
  activityFactor: '',
  stressFactor: '',
}

export function TDEEEditDialog() {
  const { isLoggedIn } = useAuth();
  const { tdeeFactors } = useUserPreferences()
  const { tdeeList, setTDEEList, addList, deleteList } = useTdeeSettings()
  const { updateSetting } = useUserSetting()
  const [newTDEEFactors, setNewTDEEFactors] = useState(DEFAULT_TDEE_ITEM);
  const [open, setOpen] = useState(false);

  const handleNewFactorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewTDEEFactors((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  const checkLogin = () => {
    if (!isLoggedIn) toast.error("此功能請登入後使用");
    return isLoggedIn;
  }

  const handleDelete = (index: number) => {
    if (!checkLogin()) return;
    deleteList(index);
  }

  const handleAdd = () => {
    if (!checkLogin()) return;
    const { name, activityFactor, stressFactor } = newTDEEFactors;
    const trimmedName = String(name).trim();

    // 空欄位
    if (!trimmedName || activityFactor === '' || stressFactor === '') {
      toast.error("欄位不能為空");
      return;
    }

    // name 字數
    if (trimmedName.length > MAX_TDEE_NAME_LENGTH) {
      toast.error(`名稱請控制在 ${MAX_TDEE_NAME_LENGTH} 字以內`);
      return;
    }

    // 數值範圍
    const a = Number(activityFactor);
    const s = Number(stressFactor);
    if (!Number.isFinite(a) || a < TDEE_ACTIVITY_FACTOR_MIN || a > TDEE_ACTIVITY_FACTOR_MAX) {
      toast.error(`活動因子請介於 ${TDEE_ACTIVITY_FACTOR_MIN}–${TDEE_ACTIVITY_FACTOR_MAX} 之間`);
      return;
    }
    if (!Number.isFinite(s) || s < TDEE_STRESS_FACTOR_MIN || s > TDEE_STRESS_FACTOR_MAX) {
      toast.error(`壓力因子請介於 ${TDEE_STRESS_FACTOR_MIN}–${TDEE_STRESS_FACTOR_MAX} 之間`);
      return;
    }

    // add to list（cap 由 hook 內部檢查 + toast）
    const newItem = {
      name: trimmedName,
      activityFactor: a,
      stressFactor: s,
    }
    const ok = addList(newItem);
    if (!ok) return; // cap 已擋下

    // reset input fields
    setNewTDEEFactors(DEFAULT_TDEE_ITEM);
  }

  const handleDialogOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && isLoggedIn && JSON.stringify(tdeeList) !== JSON.stringify(tdeeFactors)) {
      setTDEEList(tdeeFactors);
      return;
    }
    if (!isOpen && isLoggedIn) {
      // 只有實際有變更才寫回 + toast，避免單純打開又關掉也跳訊息
      if (JSON.stringify(tdeeList) === JSON.stringify(tdeeFactors)) return;
      try {
        await updateSetting('tdee', tdeeList);
        toast.success("已更新 TDEE 參數");
      } catch (err) {
        console.error(err);
        toast.error("儲存失敗，請稍後再試");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="編輯 TDEE 參數">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-md bg-violet-500/10 p-1.5 text-violet-600 dark:text-violet-400">
              <Zap className="size-4" />
            </span>
            TDEE 參數
          </DialogTitle>
          <DialogDescription>編輯、管理你的 TDEE 參數</DialogDescription>
        </DialogHeader>

        {tdeeList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead className="text-center">活動因子</TableHead>
                <TableHead className="text-center">壓力因子</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tdeeList.map((factor, index) => (
                <TableRow key={`${factor.name}-${index}`}>
                  <TableCell className="max-w-[80px] text-wrap whitespace-normal sm:max-w-[120px] font-medium">{factor.name}</TableCell>
                  <TableCell className="text-center tabular-nums">{factor.activityFactor}</TableCell>
                  <TableCell className="text-center tabular-nums">{factor.stressFactor}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`刪除 ${factor.name}`}
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">尚未新增任何 TDEE 參數</p>
        )}

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground mb-2">新增參數</p>
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground" htmlFor="name">名稱</label>
              <Input
                id="name"
                type="text"
                placeholder=""
                value={newTDEEFactors.name}
                onChange={handleNewFactorInputChange}
                maxLength={MAX_TDEE_NAME_LENGTH + 5}
              />
            </div>
            <div className="w-16 shrink-0">
              <label className="text-xs text-muted-foreground" htmlFor="activityFactor">活動</label>
              <Input
                className="tabular-nums"
                id="activityFactor"
                type="number"
                step={0.1}
                min={TDEE_ACTIVITY_FACTOR_MIN}
                max={TDEE_ACTIVITY_FACTOR_MAX}
                placeholder=""
                value={newTDEEFactors.activityFactor}
                onChange={handleNewFactorInputChange}
              />
            </div>
            <div className="w-16 shrink-0">
              <label className="text-xs text-muted-foreground" htmlFor="stressFactor">壓力</label>
              <Input
                className="tabular-nums"
                id="stressFactor"
                type="number"
                step={0.1}
                min={TDEE_STRESS_FACTOR_MIN}
                max={TDEE_STRESS_FACTOR_MAX}
                placeholder=""
                value={newTDEEFactors.stressFactor}
                onChange={handleNewFactorInputChange}
              />
            </div>
            <Button size="sm" onClick={handleAdd}>新增</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
