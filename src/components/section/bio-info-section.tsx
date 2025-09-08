"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useBioInfo, type FormData, type Gender } from "@/contexts/BioInfoContext"
import { CardContent } from "@/components/ui/card"

export default function BioInfoSection() {
  const { formData, setFormData, gender, setGender, setSubmittedValues } = useBioInfo()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target
    setFormData((prevData: FormData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  const handleGenderChange = (value: string): void => {
    if (value === "man" || value === "woman") {
      setGender(value as Gender)
    }
  }

  const handleSubmit = (): void => {
    setSubmittedValues({
      height: Math.abs(Number(formData.height)) || 0,
      weight: Math.abs(Number(formData.weight)) || 0,
      age: Math.abs(Number(formData.age)) || 0,
      gender,
    })
  }

  return (
    <CardContent>
      <div className="mb-2">
        <Label htmlFor="height" className="mb-2">身高(cm)</Label>
        <Input id="height" type="number" placeholder="身高" value={formData.height} min="0" onChange={handleInputChange} />
      </div>
      <div className="mb-2">
        <Label htmlFor="weight" className="mb-2">體重(kg)</Label>
        <Input id="weight" type="number" placeholder="體重" value={formData.weight} min="0" onChange={handleInputChange} />
      </div>
      <div className="mb-2">
        <Label htmlFor="age" className="mb-2">年齡</Label>
        <Input id="age" type="number" placeholder="年齡" value={formData.age} min="0" onChange={handleInputChange} />
      </div>
      <div className="flex items-end space-x-4">
        <RadioGroup defaultValue="man" value={gender} onValueChange={handleGenderChange} className="w-[50%]">
          <Label className="mb-0">性別</Label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="man" id="r1" />
              <Label htmlFor="r1">男</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="woman" id="r2" />
              <Label htmlFor="r2">女</Label>
            </div>
          </div>
        </RadioGroup>

        <Button className="cursor-pointer" onClick={handleSubmit}>送出</Button>
      </div>
    </CardContent>
  )
}