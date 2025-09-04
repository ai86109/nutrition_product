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
import { useBioInfo, DEFAULT_CALORIE_SETTINGS } from "@/contexts/BioInfoContext";
import { useEffect } from "react"

const STORAGE_KEY = "nutriapp.bio.calorie";

export function CalorieCountingEditDialog() {
  const { calorieFactorLists, setCalorieFactorLists } = useBioInfo();

  useEffect(() => {
    try {
      const storedFactors = localStorage.getItem(STORAGE_KEY);
      if (storedFactors) {
        const data = JSON.parse(storedFactors);
        if (Array.isArray(data) && data.length > 0) {
          setCalorieFactorLists(data);
        } else {
          console.warn("Invalid Calorie factors format in localStorage, using default settings.");
          setCalorieFactorLists(DEFAULT_CALORIE_SETTINGS);
          saveToLocalStorage(DEFAULT_CALORIE_SETTINGS);
        }
      }
    } catch (error) {
      console.error("Error loading Protein factors from localStorage:", error);
    }
  }, []);

  const handleCalorieSettingCheck = (checked: boolean, index: number): void => {
    setCalorieFactorLists((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], checked: checked };

      saveToLocalStorage(newList);
      return newList;
    });
  }

  const handleCalorieSettingValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    const index = parseInt(id.split('-')[1], 10);
    setCalorieFactorLists((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], value: Number(value) };

      saveToLocalStorage(newList);
      return newList;
    });
  }

  const saveToLocalStorage = (data: typeof calorieFactorLists) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving TDEE factors:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
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
