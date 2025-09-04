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
import { useEffect, useState } from "react"
import { useBioInfo, DEFAULT_TDEE_SETTINGS } from "@/contexts/BioInfoContext"

const STORAGE_KEY = "nutriapp.bio.tdee"

export function TDEEEditDialog() {
  const { tdeeList, setTDEEList } = useBioInfo();
  const [newTDEEFactors, setNewTDEEFactors] = useState({
    name: '',
    activityFactor: '',
    stressFactor: '',
  });

  useEffect(() => {
    try {
      const storedFactors = localStorage.getItem(STORAGE_KEY);
      if (storedFactors) {
        const data = JSON.parse(storedFactors);
        if (Array.isArray(data) && data.length > 0) {
          setTDEEList(data);
        } else {
          console.warn("Invalid TDEE factors format in localStorage, using default settings.");
          setTDEEList(DEFAULT_TDEE_SETTINGS);
          saveToLocalStorage(DEFAULT_TDEE_SETTINGS);
        }
      }
    } catch (error) {
      console.error("Error loading TDEE factors from localStorage:", error);
    }
  }, []);

  const saveToLocalStorage = (data: typeof tdeeList) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving TDEE factors:", error)
    }
  }

  const handleNewFactorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewTDEEFactors((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  const handleDelete = (index: number) => {
    setTDEEList((prevList) => {
      const newList = [...prevList];
      newList.splice(index, 1);
      saveToLocalStorage(newList);
      return newList;
    });
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
      activityFactor: activityFactor,
      stressFactor: stressFactor,
    }
    setTDEEList((prevList) => {
      const newList = [...prevList, newItem];
      saveToLocalStorage(newList);
      return newList;
    })

    // reset input fields
    setNewTDEEFactors({
      name: '',
      activityFactor: '',
      stressFactor: '',
    });
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
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
            {tdeeList.length > 0 && tdeeList.map((factor, index) => (
              <TableRow key={index}>
                <TableCell>{factor.name}</TableCell>
                <TableCell>{factor.activityFactor}</TableCell>
                <TableCell>{factor.stressFactor}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDelete(index)}>刪除</Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Input className="w-[70px]" id="name" type="text" placeholder="" value={newTDEEFactors.name} onChange={handleNewFactorInputChange} />
              </TableCell>
              <TableCell>
                <Input className="w-[70px]" id="activityFactor" type="number" step={0.1} placeholder="" value={newTDEEFactors.activityFactor} onChange={handleNewFactorInputChange} />
              </TableCell>
              <TableCell>
                <Input className="w-[70px]" id="stressFactor" type="number" step={0.1} placeholder="" value={newTDEEFactors.stressFactor} onChange={handleNewFactorInputChange} />
              </TableCell>
              <TableCell>
                <Button onClick={handleAdd}>新增</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}