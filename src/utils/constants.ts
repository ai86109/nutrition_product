import { TDEEList, CalorieFactorList, ProteinList } from "@/types";

interface UnitMapping {
  [key: string]: string;
}

export const UNIT_MAPPINGS: UnitMapping = {
  "匙": "spoon",
  "包": "pack",
  "罐": "can"
}

interface CalcUnitMapping {
  [key: string]: string;
}

export const CALC_UNIT_MAPPINGS: CalcUnitMapping = {
  "匙": "g",
  "包": "g",
  "罐": "ml",
}

export const TYPE_OPTIONS = [
  { id: "全部", name: "全部" },
  { id: "粉劑", name: "粉劑" },
  { id: "液劑", name: "液劑" },
]

export const CATEGORY_OPTIONS = [
  { id: "全部", name: "全部" },
  { id: "均衡配方", name: "均衡配方" },
  { id: "低蛋白配方", name: "低蛋白配方" },
  { id: "腎臟病配方", name: "腎臟病配方" },
  { id: "癌症配方", name: "癌症配方" },
  { id: "濃縮配方", name: "濃縮配方" },
  { id: "糖尿病配方", name: "糖尿病配方" },
  { id: "元素配方", name: "元素配方" },
  { id: "單素配方", name: "單素配方" },
]

export const OPERATOR_OPTIONS = [
  { id: "or", name: "或" },
  { id: "and", name: "和" },
]

export const CORE_NUTRIENTS = [
  'calories',
  'protein',
  'carbohydrates',
  'fat',
  'phosphorus',
  'potassium',
  'sodium',
  'dietary_fiber'
] as const

export const NUTRIENT_LABELS = {
  calories: '熱量',
  carbohydrates: '碳水化合物',
  protein: '蛋白質',
  fat: '脂肪',
  phosphorus: '磷',
  potassium: '鉀',
  sodium: '鈉',
  dietary_fiber: '纖維',
}

export const NUTRIENT_UNITS = {
  calories: 'Kcal',
  carbohydrates: 'g',
  protein: 'g',
  fat: 'g',
  phosphorus: 'mg',
  potassium: 'mg',
  sodium: 'mg',
  dietary_fiber: 'g',
}

export const NUTRIENT_INFO_TEXTS = {
  calories: '百分比 = 營養品熱量 / 輸入的熱量',
  protein: '百分比 = 營養品蛋白質 / 輸入的最小蛋白質',
}

export const DEFAULT_TDEE_SETTINGS: TDEEList[] = [
  {
    name: '預設',
    activityFactor: 1.2,
    stressFactor: 1.2,
  }
]
export const DEFAULT_CALORIE_SETTINGS: CalorieFactorList[] = [
  { id: 1, value: 25, checked: true },
  { id: 2, value: 30, checked: true },
  { id: 3, value: 35, checked: true },
]

export const DEFAULT_PROTEIN_SETTINGS: ProteinList[] = [
  { id: 1, value: 0.6, checked: true },
  { id: 2, value: 0.8, checked: true },
  { id: 3, value: 1.0, checked: true },
  { id: 4, value: 1.2, checked: true },
  { id: 5, value: 1.5, checked: true },
  { id: 6, value: 2.0, checked: true },
]