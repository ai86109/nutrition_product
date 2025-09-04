"use client"

import { useBioInfo, type TDEEList } from "@/contexts/BioInfoContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"
import { TDEEEditDialog } from "../dialogs/tdee-edit-dialog";
import { ProteinEditDialog } from "../dialogs/protein-edit-dialog";
import { CalorieCountingEditDialog } from "../dialogs/calorie-counting-edit-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function BioResultSection() {
  const { calorieFactorLists, calorieTypeLists, setCalorieTypeLists, tdeeList, proteinList } = useBioInfo()
  const { calculateBMI, calculatePBW, calculateIBW, calculateABW, calculateTDEE, calculateProtein } = useNutritionCalculations()
  
  const isValidBMI = calculateBMI() > 0
  const isValidIdealWeight = calculateIBW() > 0

  const handleCalorieTypeCheck = (checked: boolean, id: string): void => {
    setCalorieTypeLists((prevList) => {
      const newList = prevList.map(item => item.id === id ? { ...item, checked } : item)
      return newList
    })
  }

  const calculateCalorie = (type: string, factor: number): number | string => {
    if (type === 'PBW') return calculatePBW() * factor
    else if (type === 'IBW') return calculateIBW() * factor
    else if (type === 'ABW') return calculateABW() * factor
    return '--'
  }

  const adjustmentFactor = (item: TDEEList): number => {
    const { activityFactor, stressFactor } = item
    if (!activityFactor || !stressFactor) return 1
    if (isNaN(Number(activityFactor)) || isNaN(Number(stressFactor))) return 1
    return Math.abs(Number(activityFactor)) * Math.abs(Number(stressFactor))
  }

  return (
    <CardContent>
      <Card>
        <CardContent>
          <div className="flex items-center gap-1">
            {isValidBMI ? (
              <>
                <span className="font-bold">BMI：</span>
                <span>{calculateBMI()}</span>
              </>
            ) : (
              <span>請填寫數值來計算 BMI</span>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <p>BMI = 體重（公斤）/ 身高²（公尺）</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* 什麼條件下，才會請他去輸入數值 */}
      <Card className="mt-2 w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1">
            <p>熱量計算</p>
            <Popover>
              <PopoverTrigger asChild>
                <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <p>PBW = 實際體重（公斤）* 係數</p>
                <p>IBW = 理想體重（公斤）* 係數</p>
                <p>ABW = (理想體重（公斤）+ 0.25 * (實際體重（公斤） - 理想體重（公斤）)) * 係數</p>
              </PopoverContent>
            </Popover>
          </CardTitle>
          <CalorieCountingEditDialog />
        </CardHeader>
        <CardContent>
          {isValidIdealWeight ? (
            <>
              {calorieFactorLists.length > 0 && calorieFactorLists.some(item => item.checked) ? (
                <>
                  <div className="flex gap-2">
                    {calorieTypeLists.map((type) => (
                      <div key={type.id}>
                        <Checkbox checked={type.checked} onCheckedChange={(checked) => handleCalorieTypeCheck(!!checked, type.id)} />
                        {type.label}
                      </div>
                    ))}
                  </div>
                  {calorieTypeLists.length > 0 && calorieTypeLists.some(item => item.checked) ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          {calorieFactorLists.map((item, index) => {
                            if (!item.checked) return null;
                            return (
                              <TableHead key={`head-${index}`}>
                                <span>{item.value}</span>
                              </TableHead>
                            )
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calorieTypeLists.map((type) => {
                          if (!type.checked) return null;
                          return (
                            <TableRow key={type.id}>
                              <TableCell>{type.label}</TableCell>
                              {calorieFactorLists.map((item) => {
                                if (!item.checked) return null;
                                return (
                                  <TableCell key={`cell-${item.id}`}>
                                    {calculateCalorie(type.label, item.value)}
                                  </TableCell>
                                )
                            })}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <span>請至少選擇一個熱量類型</span>
                  )}
                </>) : (
                  <span>尚未設定熱量參數，請先設定</span>
                )
              }
            </>
          ) : (
            <span>請先填寫數值來計算熱量</span>
          )}
        </CardContent>
      </Card>

      <Card className="mt-2 w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1">
            <p>TDEE</p>
            <Popover>
              <PopoverTrigger asChild>
                <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <p>TDEE = BEE * 調整係數</p>
                <p>男性 BEE = 13.7 * 理想體重 + 5 * 身高 - 6.8 * 年齡 + 66</p>
                <p>女性 BEE = 9.6 * 理想體重 + 1.8 * 身高 - 4.7 * 年齡 + 655</p>
                <p className="text-sm font-bold">＊調整係數（括號中的數字）：壓力因子 * 活動因子</p>
              </PopoverContent>
            </Popover>
          </CardTitle>
          <TDEEEditDialog />
        </CardHeader>
        <CardContent>
          {isValidIdealWeight ? (
            <>
              {tdeeList.length > 0 ? tdeeList.map((item, index) => (
                <div key={`${item.name}-${index}`}>
                  <span>{item.name}（{adjustmentFactor(item)}）：</span>
                  <span>{calculateTDEE(adjustmentFactor(item))}</span>
                </div>
              )) : (
                <span>尚未設定 TDEE 參數，請先設定</span>
              )}
            </>
          ) : (
            <span>請先填寫數值來計算 TDEE</span>
          )}
        </CardContent>
      </Card>

      <Card className="mt-2 w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1">
            <p>蛋白質需求</p>
            <Popover>
              <PopoverTrigger asChild>
                <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <p>蛋白質需求 = 蛋白質係數 * 理想體重（公斤）</p>
              </PopoverContent>
            </Popover>
          </CardTitle>
          <ProteinEditDialog />
        </CardHeader>
        <CardContent>
          {isValidIdealWeight ? (
            <>
              {proteinList.length > 0 && proteinList.some(item => item.checked) ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {proteinList.map((item, index) => {
                        if (!item.checked) return null;
                        return (
                          <TableHead key={`head-${index}`}>
                            <span>{item.value}</span>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {proteinList.map((item, index) => {
                        if (!item.checked) return null;
                        return (
                          <TableCell key={`body-${index}`}>
                            <span>{calculateProtein(item.value)}</span>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <span>尚未選擇任何蛋白質參數</span>
              )}
            </>
          ) : (
            <span>請先填寫數值來計算蛋白質需求量</span>
          )}
        </CardContent>
      </Card>
    </CardContent>
  )
}