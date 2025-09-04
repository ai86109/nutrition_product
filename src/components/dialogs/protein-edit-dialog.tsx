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
import { useBioInfo, DEFAULT_PROTEIN_SETTINGS } from "@/contexts/BioInfoContext"
import { useEffect } from "react"

const STORAGE_KEY = "nutriapp.bio.protein"

export function ProteinEditDialog() {
  const { proteinList, setProteinList } = useBioInfo();

  useEffect(() => {
    try {
      const storedFactors = localStorage.getItem(STORAGE_KEY);
      if (storedFactors) {
        const data = JSON.parse(storedFactors);
        if (Array.isArray(data) && data.length > 0) {
          setProteinList(data);
        } else {
          console.warn("Invalid Protein factors format in localStorage, using default settings.");
          setProteinList(DEFAULT_PROTEIN_SETTINGS);
          saveToLocalStorage(DEFAULT_PROTEIN_SETTINGS);
        }
      }
    } catch (error) {
      console.error("Error loading Protein factors from localStorage:", error);
    }
  }, []);

  const handleProteinSettingCheck = (checked: boolean, index: number): void => {
    setProteinList((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], checked: checked };

      saveToLocalStorage(newList);
      return newList;
    });
  }

  const handleProteinSettingValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    const index = parseInt(id.split('-')[1], 10);
    setProteinList((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], value: Number(value) };

      saveToLocalStorage(newList);
      return newList;
    });
  }

  const saveToLocalStorage = (data: typeof proteinList) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving TDEE factors:", error)
    }
  }

  const resetToDefault = () => {
    setProteinList(DEFAULT_PROTEIN_SETTINGS);
    saveToLocalStorage(DEFAULT_PROTEIN_SETTINGS);
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
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

          <Button onClick={resetToDefault}>重置為預設</Button>
        </Table>
      </DialogContent>
    </Dialog>
  );
}