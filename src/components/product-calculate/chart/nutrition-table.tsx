import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import InfoPopover from "@/components/info-popover"
import { NutritionBarChart } from "./nutrition-bar-chart"
import { CaloriesPerWeightInfo } from "./calories-per-weight-info"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"
import { IngredientsData } from "@/types/nutrition"
import { NUTRITION_CONFIG, NutritionConfig } from "@/utils/constants"
import { useMemo } from "react"
import { useNutritionChartData } from "@/hooks/useNutritionChartData"

function ProteinRangeBlock({ protein }: { protein: number }) {
  const { proteinRange } = useBioInfo()
  const { min, max } = proteinRange
  const minValue = Number(Math.min(Number(min), Number(max)))
  const maxValue = Number(Math.max(Number(min), Number(max)))

  let proteinRangeText = '符合'
  let isIncludedInRange = true
  const isProteinInRange: boolean = protein >= minValue && protein <= maxValue
  if (!isProteinInRange) {
    if (protein < minValue) proteinRangeText = `低於`
    else if (protein > maxValue) proteinRangeText = `高於`

    isIncludedInRange = false
  }
  return (
    <p className={`text-xs font-bold ${isIncludedInRange ? 'text-green-700' : 'text-red-700'}`}>{proteinRangeText}蛋白質範圍</p>
  )
}

const getNutritionTitleStyle = (key: string) => {
  const baseStyle = "font-bold"
  if (key === 'calories' || key === 'protein') return baseStyle
  return `${baseStyle} max-w-[45px] overflow-hidden text-ellipsis sm:max-w-auto`
}

const NutritionTitle = ({ label, infoText }: { label: string; infoText?: string }) => {
  return (
    <>
      <span>{label}</span>
      {infoText && (
        <InfoPopover size={14}>
          <p className="text-sm">{infoText}</p>
        </InfoPopover>
      )}
    </>
  )
}

const NutritionRow = ({ 
  value, config 
}: { 
  value: number,
  config: NutritionConfig,
}) => {
  const { getCaloriesChartData, getProteinChartData, isProteinRangeValid } = useNutritionChartData()
  const { calculatePBW } = useNutritionCalculations()
  const PBW = calculatePBW()
  const { key, label, unit, hasChart, infoText } = config;
  const isShowCaloriesPerWeight = key === 'calories' && value > 0 && PBW > 0
  const isShowProteinRange = key === 'protein' && value > 0 && isProteinRangeValid 

  const chartData = useMemo(() => {
    if (key === 'calories') return getCaloriesChartData(value)
    if (key === 'protein') return getProteinChartData(value)
    return []
  }, [getCaloriesChartData, getProteinChartData, key, value])

  return (
    <>
      <TableRow key={key}>
        <TableCell className={getNutritionTitleStyle(key)}>
          <NutritionTitle label={label} infoText={infoText} />
        </TableCell>
        <TableCell>
          <p>{value} {unit}</p>
          {isShowProteinRange && <ProteinRangeBlock protein={value} />}
        </TableCell>
        {hasChart && chartData.length > 0 && (
          <TableCell>
            <NutritionBarChart data={chartData} />
          </TableCell>
        )}
      </TableRow>

      {isShowCaloriesPerWeight && (
        <TableRow>
          <TableCell></TableCell>
          <TableCell>
            <CaloriesPerWeightInfo value={value} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

interface NutritionTableProps {
  ingredientsData: IngredientsData
}

export function NutritionTable({ ingredientsData }: NutritionTableProps) {
  const { rounding } = useNutritionCalculations()

  return (
    <Table className="min-w-[250px] max-w-[400px]">
      <TableBody>
        {NUTRITION_CONFIG.map((item) => (
          <NutritionRow
            key={item.key}
            value={rounding(ingredientsData[item.key])}
            config={item}
          />
        ))}
      </TableBody>
    </Table>
  )
}