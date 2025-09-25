"use client"

import { CardContent } from "@/components/ui/card"
import BmiCard from "../bio-result/bmi-card"
import CalorieCard from "../bio-result/calorie-card"
import TdeeCard from "../bio-result/tdee-card"
import ProteinCard from "../bio-result/protein-card"

export default function BioResultSection() {
  return (
    <CardContent className="flex-1 bio-cards-container">
      <div className="bio-cards-grid">
        <BmiCard />
        <CalorieCard />
        <TdeeCard />
        <ProteinCard />
      </div>
    </CardContent>
  )
}