"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useBioInfo, type FormData, type Gender } from "@/contexts/BioInfoContext"
import { CardContent } from "@/components/ui/card"

const formFieldUnits = {
  height: "cm",
  weight: "kg",
  age: "歲",
}

const formFieldLabels = {
  height: "身高",
  weight: "體重",
  age: "年齡",
}

type FormFieldProps = {
  id: keyof FormData,
  value: string | number,
  placeholder: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FormField = ({ id, value, placeholder, onChange }: FormFieldProps) => (
  <div className="mb-2">
    <Label htmlFor={id} className="mb-2">{formFieldLabels[id]}({formFieldUnits[id]})</Label>
    <Input id={id} type="number" placeholder={placeholder} value={value} min="0" onChange={onChange} />
  </div>
)

const GenderSelector = ({ value, onChange }: { value: Gender, onChange: (value: Gender) => void}) => (
  <RadioGroup defaultValue="man" value={value} onValueChange={onChange} className="w-[50%]">
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
)

export default function BioInfoSection() {
  const { formData, setFormData, gender, setGender, setSubmittedValues } = useBioInfo()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target
    setFormData((prev: FormData) => ({ ...prev, [id]: value }))
  }

  const handleGenderChange = (value: string): void => {
    if (value === "man" || value === "woman") {
      setGender(value as Gender)
    }
  }

  const convertToNumber = (value: string | number): number => {
    return Math.abs(Number(value)) || 0
  }

  const handleSubmit = (): void => {
    setSubmittedValues({
      height: convertToNumber(formData.height),
      weight: convertToNumber(formData.weight),
      age: convertToNumber(formData.age),
      gender,
    })
  }

  return (
    <CardContent>
      <FormField id="height" value={formData.height} placeholder="輸入身高" onChange={handleInputChange} />
      <FormField id="weight" value={formData.weight} placeholder="輸入體重" onChange={handleInputChange} />
      <FormField id="age" value={formData.age} placeholder="輸入年齡" onChange={handleInputChange} />

      <div className="flex items-end space-x-4">
        <GenderSelector value={gender} onChange={handleGenderChange} />
        <Button className="cursor-pointer" onClick={handleSubmit}>送出</Button>
      </div>
    </CardContent>
  )
}
