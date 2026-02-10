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
import { CORE_NUTRIENTS, NUTRIENT_LABELS, NUTRIENT_UNITS, NUTRIENT_INFO_TEXTS, DRIS } from "@/utils/constants"
import { Switch } from "@/components/ui/switch"
import { useDRIsCalculation } from "@/hooks/useDRIsCalculation"
import { WomanStateSelector } from "@/components/product-calculate/chart/woman-state-selector"

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
  return `${baseStyle} max-w-[100px] overflow-hidden text-ellipsis sm:max-w-auto`
}

const NutritionTitle = ({ label, infoText }: { label: string; infoText?: string }) => {
  return (
    <>
      <span className="text-base">{label}</span>
      {infoText && (
        <InfoPopover size={14}>
          <p className="text-sm">{infoText}</p>
        </InfoPopover>
      )}
    </>
  )
}

const DRIsBlock = ({ 
  isMeetStandard,
  children
}: {
  isMeetStandard: boolean,
  children: React.ReactNode
}) => {
  return (
    <div className={isMeetStandard ? 'font-bold text-black' : ''}>{children}</div>
  )
}

const DRIsCell = ({ nutrientValue, nutrient, state, caloriesValue }: { nutrientValue: number, nutrient: string, state: null | { type: 'pregnancy' | 'lactation', pregnancyState: number | null }, caloriesValue?: number }) => {
  const { drisContent, markColor, calculatedValue } = useDRIsCalculation(nutrient, nutrientValue, state, caloriesValue)
  
  if (!drisContent || drisContent.length === 0) return null
  
  const unit = NUTRIENT_UNITS[nutrient] || ''
  const isProtein = nutrient === 'protein'
  
  return (
    <div className="text-xs text-muted-foreground flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-[1px] h-[20px] bg-gray-300 mr-2"></div>
        <div>
          {drisContent.map(({ item, value }) => {
            const isAMDR = item === 'amdr'
            const isMeetStandard = calculatedValue >= (Array.isArray(value) ? value[0] : value)

            return (
              <DRIsBlock key={item} isMeetStandard={isMeetStandard}>
                {isAMDR && (
                  <p className="font-bold text-black">{calculatedValue}%</p>
                )}
                <p>
                  <span className="uppercase">{item}:</span>
                  <span className="ml-1">
                    {Array.isArray(value)
                      ? `${value[0]}% - ${value[1]}%`
                      : isAMDR
                        ? `<${value}%`
                        : `${value} ${unit}`
                    }
                  </span>
                  {isProtein && (<span> / kg</span>)}
                </p>
              </DRIsBlock>
            )
          })}
        </div>
      </div>
      <div className={`material-icons ml-2 ${markColor} drop-shadow-md`}>circle</div>
    </div>
  )
}

const NutritionRow = ({ 
  value, nutrient, state = null, caloriesValue = 0
}: { 
  value: number,
  nutrient: string,
  state: null | { type: 'pregnancy' | 'lactation', pregnancyState: number | null }
  caloriesValue?: number
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
    
  const hasDRIs = useMemo(() => DRIS[nutrient] !== undefined, [nutrient])
  const { submittedValues } = useBioInfo()
  const { gender, age } = submittedValues
  const isShowDRIs = hasDRIs && gender && age > 0 && !['calories', 'protein'].includes(nutrient)
  const isShowProteinDRIs = nutrient === 'protein' && gender && age > 0

  return (
    <>
      <TableRow key={nutrient}>
        <TableCell className={getNutritionTitleStyle(nutrient)}>
          <NutritionTitle label={NUTRIENT_LABELS[nutrient] ?? nutrient} infoText={NUTRIENT_INFO_TEXTS[nutrient]} />
        </TableCell>
        <TableCell>
          <p>
            <span className="text-base font-bold">{value}</span>
            <span className="text-sm ml-1">{NUTRIENT_UNITS[nutrient] ?? ''}</span>
          </p>
          {isShowProteinRange && <ProteinRangeBlock protein={value} />}
        </TableCell>
        {hasChart && chartData.length > 0 && (
          <TableCell>
            <NutritionBarChart data={chartData} />
          </TableCell>
        )}
        {isShowDRIs && (
          <TableCell>
            <DRIsCell nutrientValue={value} nutrient={nutrient} state={state} caloriesValue={caloriesValue} />
          </TableCell>
        )}
      </TableRow>

      {isShowCaloriesPerWeight && (
        <TableRow>
          <TableCell></TableCell>
          <TableCell>
            <CaloriesPerWeightInfo value={value} />
          </TableCell>
          {gender && age > 0 && (
            <TableCell>
              <DRIsCell nutrientValue={value} nutrient={nutrient} state={state} caloriesValue={caloriesValue} />
            </TableCell>
          )}
        </TableRow>
      )}

      {isShowProteinDRIs && (
        <TableRow>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell>
            <DRIsCell nutrientValue={value} nutrient={nutrient} state={state} caloriesValue={caloriesValue} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function NutritionTable({ ingredientsData }: { ingredientsData: IngredientsData }) {
  const { rounding } = useBioInfoCalculations()
  const { submittedValues } = useBioInfo()
  const { gender, age } = submittedValues

  const [isShowDetail, setIsShowDetail] = useState(false)
  const [womanState, setWomanState] = useState<'none' | 'pregnancy' | 'lactation'>('none')
  const [pregnancyState, setPregnancyState] = useState('state1')
  
  const isShowWomanStateOptions = gender === 'woman' && age > 0

  const state = useMemo(() => {
    if (!isShowWomanStateOptions) return null
    if (womanState === 'none') return null
    return {
      type: womanState,
      pregnancyState: womanState === 'pregnancy' ? pregnancyState : null,
    }
  }, [isShowWomanStateOptions, womanState, pregnancyState])

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

  const handleWomanStateToggle = (state: 'pregnancy' | 'lactation') => {
    setWomanState(prev => prev === state ? 'none' : state)
  }

  const caloriesValue = useMemo(() => rounding(ingredientsData['calories'] || 0), [ingredientsData, rounding])

  return (
    <div className="flex flex-col space-y-4 w-full max-w-[400px]">
      <div className="flex items-center space-x-2 font-medium text-sm">
        <Switch checked={isShowDetail} onCheckedChange={setIsShowDetail} />
        <span>顯示全部營養素</span>
      </div>

      {isShowWomanStateOptions && (
        <WomanStateSelector 
          womanState={womanState}
          pregnancyState={pregnancyState}
          handleWomanStateToggle={handleWomanStateToggle}
          setPregnancyState={setPregnancyState}
        />
      )}
      
      <Table className="min-w-[250px] max-w-[400px]">
        <TableBody>
          {coreNutrientsList.map((key) => (
            <NutritionRow
              key={key}
              nutrient={key}
              value={rounding(ingredientsData[key])}
              state={state}
              caloriesValue={caloriesValue}
            />
          ))}
          {isShowDetail && otherNutrientsList.map((key) => (
            <NutritionRow
              key={key}
              nutrient={key}
              value={rounding(ingredientsData[key])}
              state={state}
              caloriesValue={caloriesValue}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}