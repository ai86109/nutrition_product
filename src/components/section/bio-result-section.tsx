"use client"

import { CardContent } from "@/components/ui/card"
import BioCard from "../bio-result/bio-card"
import CalorieCard from "../bio-result/calorie-card"
import TdeeCard from "../bio-result/tdee-card"
import ProteinCard from "../bio-result/protein-card"

export default function BioResultSection() {
  return (
    <CardContent className="flex-1 @container">
      <div className="grid grid-cols-1 gap-4 @[40rem]:grid-cols-2 @[64rem]:grid-cols-4">
        <BioCard />
        <CalorieCard />
        <TdeeCard />
        <ProteinCard />
      </div>
    </CardContent>
  )
}