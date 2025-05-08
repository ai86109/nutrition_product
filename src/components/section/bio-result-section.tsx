"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBioInfo } from "@/contexts/BioInfoContext"
import { CardContent } from "@/components/ui/card"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"

export default function BioResultSection() {
  const { tdeeFactors, setTdeeFactors, proteinFactors, setProteinFactors } = useBioInfo()
  const { calculateBMI, calculateIdealWeight, calculateTDEE, calculateProtein } = useNutritionCalculations()

  const handleFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setTdeeFactors((prevData) => ({
      ...prevData,
      [id]: Number(value),
    }))
  }

  const handleProteinFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProteinFactors((prevData) => ({
      ...prevData,
      [id]: Number(value),
    }))
  }

  return (
    <CardContent>
      <div>
        <span className="font-bold">BMI：</span>
        <span>{calculateBMI()}</span>
      </div>

      <div className="mt-2">
        <span className="font-bold">理想體重：</span>
        <span>{calculateIdealWeight()}</span>
      </div>

      <div className="mt-2 flex items-center justify-between space-x-2">
        <div>
          <span className="font-bold">TDEE：</span>
          <span className="mr-4">{calculateTDEE()}</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex">
            <Label htmlFor="activityFactor" className="mr-2">活動因子</Label>
            <Input className="w-[50px]" id="activityFactor" type="number" placeholder="活動因子" value={tdeeFactors.activityFactor} onChange={handleFactorChange} />
          </div>
          <div className="flex">
            <Label htmlFor="stressFactor" className="mr-2">壓力因子</Label>
            <Input className="w-[50px]" id="stressFactor" type="number" placeholder="壓力因子" value={tdeeFactors.stressFactor} onChange={handleFactorChange} />
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between items-center space-x-1">
        <div>
          <p className="font-bold">蛋白質需求：</p>
          <p>{calculateProtein().minValue}g - {calculateProtein().maxValue}g</p>
        </div>
        <div className="flex items-center w-[150px] space-x-2 ml-4">
          <Input className="w-[70px]" id="min" type="number" placeholder="0.8" value={proteinFactors.min} onChange={handleProteinFactorChange} />
          <p>-</p>
          <Input className="w-[70px]" id="max" type="number" placeholder="1" value={proteinFactors.max} onChange={handleProteinFactorChange} />
        </div>
      </div>
    </CardContent>
  )
}