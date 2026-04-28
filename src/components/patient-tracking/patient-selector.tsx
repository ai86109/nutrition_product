"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Patient } from "@/types/patient"

export type PatientMode = "existing" | "new"

interface PatientSelectorProps {
  patients: Patient[]
  mode: PatientMode
  onModeChange: (mode: PatientMode) => void
  selectedPatientId: string
  onSelectedPatientIdChange: (id: string) => void
  newPatientName: string
  onNewPatientNameChange: (name: string) => void
  errorMessage?: string | null
}

export default function PatientSelector({
  patients,
  mode,
  onModeChange,
  selectedPatientId,
  onSelectedPatientIdChange,
  newPatientName,
  onNewPatientNameChange,
  errorMessage,
}: PatientSelectorProps) {
  const hasExisting = patients.length > 0

  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold">病人</Label>

      <RadioGroup
        value={mode}
        onValueChange={(v) => onModeChange(v as PatientMode)}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem
            id="patient-mode-existing"
            value="existing"
            disabled={!hasExisting}
          />
          <Label
            htmlFor="patient-mode-existing"
            className={!hasExisting ? "opacity-50" : ""}
          >
            選擇既有病人
          </Label>
          {mode === "existing" && hasExisting && (
            <Select
              value={selectedPatientId}
              onValueChange={onSelectedPatientIdChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="請選擇病人" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <RadioGroupItem id="patient-mode-new" value="new" />
          <Label htmlFor="patient-mode-new">新增病人</Label>
          {mode === "new" && (
            <Input
              className="w-[200px]"
              placeholder="輸入病人名稱"
              value={newPatientName}
              onChange={(e) => onNewPatientNameChange(e.target.value)}
            />
          )}
        </div>
      </RadioGroup>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  )
}
