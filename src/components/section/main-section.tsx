"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function MainSection() {
  // input
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
  })
  const [gender, setGender] = useState("man")
  const [submittedValues, setSubmittedValues] = useState({
    height: 0,
    weight: 0,
    age: 0,
    gender: "man",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: Number(value),
    }))
  }

  const handleSubmit = () => {
    setSubmittedValues({
      height: Math.abs(Number(formData.height)) || 0,
      weight: Math.abs(Number(formData.weight)) || 0,
      age: Math.abs(Number(formData.age)) || 0,
      gender,
    })
  }

  // Calculate
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

  //TDEE
  const [tdeeFactors, setTdeeFactors] = useState({
    activityFactor: 1,
    stressFactor: 1,
  })

  const handleFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setTdeeFactors((prevData) => ({
      ...prevData,
      [id]: Number(value),
    }))
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

  // protein
  const [proteinFactors, setProteinFactors] = useState({
    min: 0.6,
    max: 0.8,
  })

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

  return (
    <div className="w-[500px]">
      <div>
        <Label htmlFor="height">身高</Label>
        <Input id="height" type="number" placeholder="身高" value={formData.height} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="weight">體重</Label>
        <Input id="weight" type="number" placeholder="體重" value={formData.weight} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="age">年齡</Label>
        <Input id="age" type="number" placeholder="年齡" value={formData.age} onChange={handleInputChange} />
      </div>
      <RadioGroup defaultValue="man" value={gender} onValueChange={setGender}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="man" id="r1" />
          <Label htmlFor="r1">男</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="woman" id="r2" />
          <Label htmlFor="r2">女</Label>
        </div>
      </RadioGroup>

      <Button variant="outline" onClick={handleSubmit}>送出</Button>

      <div>
        <p>BMI：{calculateBMI()}</p>
        <p>理想體重：{calculateIdealWeight()}</p>

        <div>
          <p>TDEE：{calculateTDEE()}</p>
          <div>
            <Label htmlFor="activityFactor">活動因子</Label>
            <Input id="activityFactor" type="number" placeholder="活動因子" value={tdeeFactors.activityFactor} onChange={handleFactorChange} />
            <Label htmlFor="stressFactor">壓力因子</Label>
            <Input id="stressFactor" type="number" placeholder="壓力因子" value={tdeeFactors.stressFactor} onChange={handleFactorChange} />
          </div>
        </div>

        <div>
          <p>蛋白質需求：{calculateProtein().minValue}g - {calculateProtein().maxValue}g</p>
          <div>
            <Label htmlFor="min">區間</Label>
            <Input id="min" type="number" placeholder="0.8" value={proteinFactors.min} onChange={handleProteinFactorChange} />
            -
            <Input id="max" type="number" placeholder="1" value={proteinFactors.max} onChange={handleProteinFactorChange} />
          </div>
        </div>
      </div>
    </div>
  )
}