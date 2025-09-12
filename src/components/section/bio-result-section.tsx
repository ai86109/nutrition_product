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
import { useCalorieSettings, type CalorieFactorList } from "@/hooks/useCalorieSettings"


export default function BioResultSection() {
  const { calorieFactorLists, updateChecked, updateValue }: { calorieFactorLists: CalorieFactorList[], updateChecked: (checked: boolean, index: number) => void, updateValue: (id: string, value: string) => void } = useCalorieSettings();

  const { calorieTypeLists, setCalorieTypeLists, tdeeList, proteinList, submittedValues } = useBioInfo()
  const { height, age } = submittedValues
  const { calculateBMI, calculatePBW, calculateIBW, calculateABW, calculateTDEE, rounding } = useNutritionCalculations()
  
  const isValidBMI = calculateBMI() > 0
  const isValidPBW = calculatePBW() > 0
  const isValidIBW = calculateIBW() > 0

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

  const calculateProtein = (type: string, factor: number): number | string => {
    if (type === 'PBW') return rounding(factor * calculatePBW(), 1)
    else if (type === 'IBW') return rounding(factor * calculateIBW(), 1)
    else if (type === 'ABW') return rounding(factor * calculateABW(), 1)
    return '--'
  }

  const adjustmentFactor = (item: TDEEList): number => {
    const { activityFactor, stressFactor } = item
    if (!activityFactor || !stressFactor) return 1
    if (isNaN(Number(activityFactor)) || isNaN(Number(stressFactor))) return 1
    return rounding(Math.abs(Number(activityFactor)) * Math.abs(Number(stressFactor)), 2)
  }

  return (
    <CardContent className="flex-1 bio-cards-container">
      <div className="bio-cards-grid">
        <Card className="max-h-[80px]">
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
                <PopoverContent className="w-auto text-sm">
                  <p>BMI = 體重（公斤）/ 身高²（公尺）</p>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-auto">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1">
              <p>熱量計算</p>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
                </PopoverTrigger>
                <PopoverContent className="w-auto text-sm">
                  <p className="font-bold">熱量需求（kcal）</p>
                  <p>PBW = 實際體重* 係數</p>
                  <p>IBW = 理想體重* 係數</p>
                  <p>ABW = (理想體重+ 0.25 * (實際體重 - 理想體重)) * 係數</p>
                </PopoverContent>
              </Popover>
            </CardTitle>
            <CalorieCountingEditDialog calorieFactorLists={calorieFactorLists} updateChecked={updateChecked} updateValue={updateValue} />
          </CardHeader>
          <CardContent>
            {isValidPBW || isValidIBW ? (
              <>
                {calorieFactorLists.length > 0 && calorieFactorLists.some(item => item.checked) ? (
                  <>
                    <div className="flex gap-2 mb-2">
                      {calorieTypeLists.map((type) => (
                        <div key={type.id}>
                          <Checkbox checked={type.checked} onCheckedChange={(checked) => handleCalorieTypeCheck(!!checked, type.id)} className="mr-1" />
                          {type.label}
                        </div>
                      ))}
                    </div>
                    {calorieTypeLists.length > 0 && calorieTypeLists.some(item => item.checked) ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
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
                                <TableCell className="bg-gray-100">{type.label}</TableCell>
                                {calorieFactorLists.map((item) => {
                                  if (!item.checked) return null;
                                  return (
                                    <TableCell key={`cell-${item.id}`}>
                                      {calculateCalorie(type.label, Number(item.value))}
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

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1">
              <p>TDEE</p>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
                </PopoverTrigger>
                <PopoverContent className="w-auto text-sm">
                  <p>TDEE = BEE * 調整係數</p>
                  <p>男性 BEE = 13.7 * 實際體重 + 5 * 身高 - 6.8 * 年齡 + 66</p>
                  <p>女性 BEE = 9.6 * 實際體重 + 1.8 * 身高 - 4.7 * 年齡 + 655</p>
                  <p className="text-sm font-bold">＊調整係數（括號中的數字）：壓力因子 * 活動因子</p>
                </PopoverContent>
              </Popover>
            </CardTitle>
            <TDEEEditDialog />
          </CardHeader>
          <CardContent>
            {isValidPBW && height && age ? (
              <>
                {tdeeList.length > 0 ? tdeeList.map((item, index) => (
                  <div key={`${item.name}-${index}`}>
                    <span className="font-bold">- {item.name}（{adjustmentFactor(item)}）：</span>
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

        <Card className="overflow-auto">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1">
              <p>蛋白質需求</p>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
                </PopoverTrigger>
                <PopoverContent className="w-auto text-sm">
                  <p className="font-bold">蛋白質需求（g）</p>
                  <p>PBW = 實際體重 * 蛋白質係數</p>
                  <p>IBW = 理想體重 * 蛋白質係數</p>
                  <p>ABW = 調整體重 * 蛋白質係數</p>
                </PopoverContent>
              </Popover>
            </CardTitle>
            <ProteinEditDialog />
          </CardHeader>
          <CardContent>
            {isValidPBW || isValidIBW ? (
              <>
                <div className="flex gap-2 mb-2">
                  {calorieTypeLists.map((type) => (
                    <div key={type.id}>
                      <Checkbox checked={type.checked} onCheckedChange={(checked) => handleCalorieTypeCheck(!!checked, type.id)} className="mr-1" />
                      {type.label}
                    </div>
                  ))}
                </div>
                {calorieTypeLists.length > 0 && calorieTypeLists.some(item => item.checked) ? (
                  <>
                  {proteinList.length > 0 && proteinList.some(item => item.checked) ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead></TableHead>
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
                        {calorieTypeLists.map((type) => {
                          if (!type.checked) return null;
                          return (
                            <TableRow key={type.id}>
                              <TableCell className="bg-gray-100">{type.label}</TableCell>
                              {proteinList.map((item, index) => {
                              if (!item.checked) return null;
                              return (
                                <TableCell key={`body-${index}`}>
                                  <span>{calculateProtein(type.label, Number(item.value))}</span>
                                </TableCell>
                              )
                            })}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <span>尚未選擇任何蛋白質參數</span>
                  )}
                  </>) : (
                    <span>請至少選擇一個熱量類型</span>
                  )}
              </>
            ) : (
              <span>請先填寫數值來計算蛋白質需求量</span>
            )}
          </CardContent>
        </Card>
      </div>
    </CardContent>
  )
}