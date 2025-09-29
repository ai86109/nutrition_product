import { IngredientsData } from "@/types/nutrition";

type UnitMapping = {
  [key: string]: string;
};

export const UNIT_MAPPINGS: UnitMapping = {
  "匙": "spoon",
  "包": "pack",
  "罐": "can"
}

type CalcUnitMapping = {
  [key: string]: string;
};

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

export interface NutritionConfig {
  key: keyof IngredientsData
  label: string
  unit: string
  hasChart: boolean
  infoText?: string
}

export const NUTRITION_CONFIG: NutritionConfig[] = [
  {
    key: 'calories',
    label: '熱量',
    unit: 'Kcal',
    hasChart: true,
    infoText: '百分比 = 營養品熱量 / 輸入的熱量'
  },
  {
    key: 'protein',
    label: '蛋白質',
    unit: 'g',
    hasChart: true,
    infoText: '百分比 = 營養品蛋白質 / 輸入的最小蛋白質'
  },
  {
    key: 'carbohydrate',
    label: '碳水化合物',
    unit: 'g',
    hasChart: false,
  },
  {
    key: 'fat',
    label: '脂肪',
    unit: 'g',
    hasChart: false,
  },
  {
    key: 'phosphorus',
    label: '磷',
    unit: 'mg',
    hasChart: false,
  },
  {
    key: 'potassium',
    label: '鉀',
    unit: 'mg',
    hasChart: false,
  },
  {
    key: 'sodium',
    label: '鈉',
    unit: 'mg',
    hasChart: false,
  },
  {
    key: 'fiber',
    label: '纖維',
    unit: 'g',
    hasChart: false,
  }
]