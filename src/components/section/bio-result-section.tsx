"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBioInfo } from "@/contexts/BioInfoContext"
import { CardContent } from "@/components/ui/card"

export default function BioResultSection() {
  const { submittedValues, tdeeFactors, setTdeeFactors, proteinFactors, setProteinFactors } = useBioInfo()

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

  const calculateProtein = () => {
    const idealWeight = calculateIdealWeight()
    const { min, max } = proteinFactors
    const minValue = Math.min(min * idealWeight, max * idealWeight).toFixed(2)
    const maxValue = Math.max(min * idealWeight, max * idealWeight).toFixed(2)

    return { minValue, maxValue }
  }
  
  const calculateBMI = () => {
    const { height, weight } = submittedValues
    if (height === 0 || weight === 0) return 0
    
    return (weight / ((height / 100) ** 2)).toFixed(2)
  }

  const calculateIdealWeight = () => {
    const { height } = submittedValues
    if (height === 0) return 0
    return Math.abs(Number((((height / 100) ** 2) * 22).toFixed(2))) || 0
  }

  const calculateTDEE = () => {
    const { height, weight, age, gender } = submittedValues
    const { activityFactor, stressFactor } = tdeeFactors
    if (height === 0 || weight === 0 || age === 0) return 0

    const idealWeight = calculateIdealWeight()
    const manBEE = 13.7 * idealWeight + 5 * height - 6.8 * age + 66
    const womanBEE = 9.6 * idealWeight + 1.8 * height - 4.7 * age + 655
    const BEE = gender === "man" ? manBEE : womanBEE
    const TDEE = BEE * activityFactor * stressFactor
    return TDEE.toFixed(2)
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

      <div className="mt-2">
        <span className="font-bold">TDEE：</span>
        <span>{calculateTDEE()}</span>
        <div className="flex space-x-2">
          <div>
            <Label htmlFor="activityFactor" className="mb-2">活動因子</Label>
            <Input id="activityFactor" type="number" placeholder="活動因子" value={tdeeFactors.activityFactor} onChange={handleFactorChange} />
          </div>
          <div>
            <Label htmlFor="stressFactor" className="mb-2">壓力因子</Label>
            <Input id="stressFactor" type="number" placeholder="壓力因子" value={tdeeFactors.stressFactor} onChange={handleFactorChange} />
          </div>
        </div>
      </div>

      <div className="mt-2">
        <span className="font-bold">蛋白質需求：</span>
        <span>{calculateProtein().minValue}g - {calculateProtein().maxValue}g</span>
        <div className="flex items-center space-x-2 mb-2">
          <Input id="min" type="number" placeholder="0.8" value={proteinFactors.min} onChange={handleProteinFactorChange} />
          <p>-</p>
          <Input id="max" type="number" placeholder="1" value={proteinFactors.max} onChange={handleProteinFactorChange} />
        </div>
      </div>
    </CardContent>
  )
}