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
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"
import { IngredientsData } from "@/types"
import { useMemo, useState } from "react"
import { useNutritionChartData } from "@/hooks/product-calculate/useNutritionChartData"
import { CORE_NUTRIENTS, NUTRIENT_LABELS, NUTRIENT_UNITS, NUTRIENT_INFO_TEXTS } from "@/utils/constants"
import { Switch } from "@/components/ui/switch"

function ProteinRangeBlock({ protein }: { protein: number }) {
  const { proteinRange } = useBioInfo()
  const { min, max } = proteinRange
  const minValue = Math.min(Number(min), Number(max))
  const maxValue = Math.max(Number(min), Number(max))

  const isInRange = protein >= minValue && protein <= maxValue
  let statusText = '符合'
  if (!isInRange) {
    statusText = protein < minValue ? '低於' : '高於'
  }

  return (
    <p className={`text-xs font-bold ${isInRange ? 'text-green-700' : 'text-red-700'}`}>{statusText}蛋白質範圍</p>
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
  value, nutrient 
}: { 
  value: number,
  nutrient: string,
}) => {
  const { getCaloriesChartData, getProteinChartData, isProteinRangeValid } = useNutritionChartData()
  const { pbw } = useBioInfoCalculations()
  const isShowCaloriesPerWeight = nutrient === 'calories' && value > 0 && pbw > 0
  const isShowProteinRange = nutrient === 'protein' && value > 0 && isProteinRangeValid
  const hasChart = nutrient === 'calories' || nutrient === 'protein'

  const chartData = useMemo(() => {
    if (nutrient === 'calories') return getCaloriesChartData(value)
    if (nutrient === 'protein') return getProteinChartData(value)
    return []
  }, [getCaloriesChartData, getProteinChartData, nutrient, value])

  return (
    <>
      <TableRow key={nutrient}>
        <TableCell className={getNutritionTitleStyle(nutrient)}>
          <NutritionTitle label={NUTRIENT_LABELS[nutrient] ?? nutrient} infoText={NUTRIENT_INFO_TEXTS[nutrient]} />
        </TableCell>
        <TableCell>
          <p>{value} {NUTRIENT_UNITS[nutrient] ?? ''}</p>
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

export function NutritionTable({ ingredientsData }: { ingredientsData: IngredientsData }) {
  const { rounding } = useBioInfoCalculations()
  const [isShowDetail, setIsShowDetail] = useState(false)
  // console.log('ingredientsData in NutritionTable', ingredientsData)

  const { coreNutrientsList, otherNutrientsList } = useMemo(() => {
    const validKeys = Object.keys(ingredientsData).filter(key => {
      const value = ingredientsData[key]
      return value !== undefined && value >=0
    })

    return {
      coreNutrientsList: CORE_NUTRIENTS.filter(key => validKeys.includes(key)),
      otherNutrientsList: validKeys.filter(key => !CORE_NUTRIENTS.includes(key)).sort(),
    }
  }, [ingredientsData])

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2 font-medium text-sm">
        <Switch value={isShowDetail} onCheckedChange={() => setIsShowDetail(!isShowDetail)} />
        <span>顯示全部營養素</span>
      </div>
      
      <Table className="min-w-[250px] max-w-[400px]">
        <TableBody>
          {coreNutrientsList.map((key) => (
            <NutritionRow
              key={key}
              nutrient={key}
              value={rounding(ingredientsData[key])}
            />
          ))}
          {isShowDetail && otherNutrientsList.map((key) => (
            <NutritionRow
              key={key}
              nutrient={key}
              value={rounding(ingredientsData[key])}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}