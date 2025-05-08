"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { CardContent } from "@/components/ui/card"

export default function BioInfoSection() {
  const { formData, setFormData, gender, setGender, setSubmittedValues } = useBioInfo()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
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

  return (
    <CardContent>
      <div className="flex justify-between items-center space-x-2">
        <div>
          <Label htmlFor="height" className="mb-2">身高</Label>
          <Input id="height" type="number" placeholder="身高" value={formData.height} onChange={handleInputChange} />
        </div>
        <div>
          <Label htmlFor="weight" className="mb-2">體重</Label>
          <Input id="weight" type="number" placeholder="體重" value={formData.weight} onChange={handleInputChange} />
        </div>
      </div>
      
      <div className="flex justify-between items-center space-x-2 mt-4">
        <div>
          <Label htmlFor="age" className="mb-2">年齡</Label>
          <Input id="age" type="number" placeholder="年齡" value={formData.age} onChange={handleInputChange} />
        </div>
        <RadioGroup defaultValue="man" value={gender} onValueChange={setGender} className="w-[50%]">
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
        <Button className="mt-4" variant="outline" onClick={handleSubmit}>送出</Button>
      </div>

    </CardContent>
  )
}