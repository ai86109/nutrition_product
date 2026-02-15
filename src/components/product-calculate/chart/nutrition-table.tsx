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
import { Fragment, useMemo, useState } from "react"
import { useNutritionChartData } from "@/hooks/product-calculate/useNutritionChartData"
import { NUTRIENTS_GROUP, MACRO_NUTRIENTS, MACRO_MINERALS, TRACE_MINERALS, VITAMINS, NUTRIENT_LABELS, NUTRIENT_UNITS, NUTRIENT_INFO_TEXTS, DRIS } from "@/utils/constants"
import { Switch } from "@/components/ui/switch"
import { useDRIsCalculation } from "@/hooks/useDRIsCalculation"
import { WomanStateSelector } from "@/components/product-calculate/chart/woman-state-selector"
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button"
import { redirect } from 'next/navigation'

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
  const baseStyle = "w-full font-bold text-pretty whitespace-normal"
  if (key === 'calories' || key === 'protein') return baseStyle
  return `${baseStyle} max-w-[120px] min-w-[50px]`
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
    <div className={`mb-1 ${isMeetStandard ? 'font-bold text-black' : ''}`}>{children}</div>
  )
}

const LoggedInDRIsCell = ({ 
  drisContent,
  markColor, 
  calculatedValue, 
  nutrient 
}: { 
  drisContent: { item: string, value: number }[], 
  markColor: string, 
  calculatedValue: number, 
  nutrient: string 
}) => {
  const unit = NUTRIENT_UNITS[nutrient] || ''
  const isProtein = nutrient === 'protein'
  const isCalories = nutrient === 'calories'

  return (
    <div className="text-xs text-muted-foreground flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-[1px] h-[20px] bg-gray-300 mr-2"></div>
        <div>
          {drisContent.map(({ item, value }: { item: string, value: number }) => {
            const isAMDR = item === 'amdr'
            const isAiOrRda = ['ai', 'rda'].includes(item)
            const meetStandardPercentage = (calculatedValue / (Array.isArray(value) ? value[0] : value)) * 100
            const isMeetStandard = meetStandardPercentage >= 100 || false

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
                  {isProtein && (<span> / 天</span>)}
                </p>
                <p>{isAiOrRda && (<span>({meetStandardPercentage.toFixed(1)}%)</span>)}</p>
              </DRIsBlock>
            )
          })}
        </div>
      </div>
      {!isCalories && <div className={`material-icons ml-2 ${markColor} drop-shadow-md`}>circle</div>}
    </div>
  )
}

const LoggedOutDRIsCell = ({ drisContent }: { drisContent: { item: string, value: number }[] }) => {
  return (
    <div className="text-xs text-muted-foreground flex items-center justify-between opacity-70">
      <div className="flex items-center">
        <div className="w-[1px] h-[20px] bg-gray-300 mr-2"></div>
        <div>
          {drisContent.map(({ item }: { item: string }) => (
              <DRIsBlock key={item} isMeetStandard={false}>
                {item === 'amdr' && (
                  <p className="font-bold text-black">-</p>
                )}
                <p>
                  <span className="uppercase">{item}:</span>
                  <span className="ml-1">-</span>
                </p>
              </DRIsBlock>
            )
          )}
        </div>
      </div>
    </div>
  )
}

const DRIsCell = ({ nutrientValue, nutrient, state, caloriesValue }: { nutrientValue: number, nutrient: string, state: null | { type: 'pregnancy' | 'lactation', pregnancyState: string | null }, caloriesValue?: number }) => {
  const { drisContent, markColor, calculatedValue } = useDRIsCalculation(nutrient, nutrientValue, state, caloriesValue)
  const { isLoggedIn } = useAuth();

  if (!drisContent || drisContent.length === 0) return null
    
  return (
    <>
      {isLoggedIn
        ? <LoggedInDRIsCell 
            nutrient={nutrient} 
            drisContent={drisContent} 
            markColor={markColor} 
            calculatedValue={calculatedValue} 
          /> 
        : <LoggedOutDRIsCell drisContent={drisContent} />}
    </>
  )
}

const NutritionRow = ({ 
  value, nutrient, state = null, caloriesValue = 0
}: { 
  value: number,
  nutrient: string,
  state: null | { type: 'pregnancy' | 'lactation', pregnancyState: string | null }
  caloriesValue?: number
}) => {
  const { isLoggedIn } = useAuth();
  const { getCaloriesChartData, getProteinChartData, isProteinRangeValid } = useNutritionChartData()
  const { pbw } = useBioInfoCalculations()
  const isShowCaloriesPerWeight = nutrient === 'calories' && value > 0 && pbw > 0
  const isShowProteinRange = nutrient === 'protein' && value > 0 && isProteinRangeValid
  const isCaloriesOrProtein = ['calories', 'protein'].includes(nutrient)
  const hasChart = isCaloriesOrProtein
  
  const chartData = useMemo(() => {
    if (nutrient === 'calories') return getCaloriesChartData(value)
      if (nutrient === 'protein') return getProteinChartData(value)
        return []
    }, [getCaloriesChartData, getProteinChartData, nutrient, value])
    
  const hasDRIs = useMemo(() => DRIS[nutrient] !== undefined, [nutrient])
  const { submittedValues } = useBioInfo()
  const { gender, age } = submittedValues
  const hasGenderAndAge = gender && age > 0
  const isShowDRIs = hasDRIs && hasGenderAndAge && !isCaloriesOrProtein
  const isShowProteinDRIs = nutrient === 'protein' && hasGenderAndAge

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
          <TableCell className="min-w-[120px] min-h-[40px]">
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
          {isLoggedIn && hasGenderAndAge && (
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
            {isLoggedIn ? (
              <DRIsCell nutrientValue={value} nutrient={nutrient} state={state} caloriesValue={caloriesValue} />
            ) : (
              <Button className="cursor-pointer" onClick={() => redirect('/auth')}>
                <span className="material-icons" style={{ fontSize: '14px', height: '14px' }}>lock</span>
                <span className="text-xs font-bold">登入後查看 DRIs</span>
              </Button>
            )}
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

  const { macroNutrientsList, macroMineralsList, traceMineralsList, vitaminsList, otherNutrientsList } = useMemo(() => {
    const validKeys = Object.keys(ingredientsData).filter(key => {
      const value = ingredientsData[key]
      return value !== undefined && value >=0
    })

    const othersList = validKeys.filter(key => !MACRO_NUTRIENTS.includes(key) && !MACRO_MINERALS.includes(key) && !TRACE_MINERALS.includes(key) && !VITAMINS.includes(key))

    return {
      macroNutrientsList: MACRO_NUTRIENTS.filter(key => validKeys.includes(key)),
      macroMineralsList: MACRO_MINERALS.filter(key => validKeys.includes(key)),
      traceMineralsList: TRACE_MINERALS.filter(key => validKeys.includes(key)),
      vitaminsList: VITAMINS.filter(key => validKeys.includes(key)),
      otherNutrientsList: othersList.sort(),
    }
  }, [ingredientsData])

  const orderedGroups = useMemo(() => {
    const groups = [
      { key: "macroNutrients", items: macroNutrientsList },
      { key: "macroMinerals", items: macroMineralsList },
      { key: "traceMinerals", items: traceMineralsList },
      { key: "vitamins", items: vitaminsList },
      { key: "others", items: otherNutrientsList }
    ]

    return groups.filter(group => group.items.length > 0)
  }, [macroNutrientsList, macroMineralsList, traceMineralsList, vitaminsList, otherNutrientsList])

  const handleWomanStateToggle = (state: 'pregnancy' | 'lactation') => {
    setWomanState(prev => prev === state ? 'none' : state)
  }

  const caloriesValue = useMemo(() => rounding(ingredientsData['calories'] || 0), [ingredientsData, rounding])

  return (
    <div className="flex flex-col space-y-4 w-full max-w-[400px]">
      <div className="flex items-center space-x-2 font-medium text-sm">
        <Switch checked={isShowDetail} onCheckedChange={setIsShowDetail} className="cursor-pointer" />
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
          {isShowDetail && orderedGroups.flatMap(group => (
            <Fragment key={group.key}>
              <p className="font-bold mt-2 text-amber-800">{NUTRIENTS_GROUP[group.key]}</p>
              {group.items.map((key) => (
                <NutritionRow
                  key={key}
                  nutrient={key}
                  value={rounding(Number(ingredientsData[key]))}
                  state={state}
                  caloriesValue={caloriesValue}
                />
              ))}
            </Fragment>
          ))}
          
          {!isShowDetail && macroNutrientsList.map((key) => (
            <NutritionRow
              key={key}
              nutrient={key}
              value={rounding(Number(ingredientsData[key]))}
              state={state}
              caloriesValue={caloriesValue}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}