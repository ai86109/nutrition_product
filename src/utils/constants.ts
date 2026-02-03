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
  // tier 2 nutrients
  biotin: '生物素',
  calcium: '鈣',
  chloride: '氯',
  choline: '膽素',
  chromium: '鉻',
  copper: '銅',
  folic_acid: '葉酸',
  iodine: '碘',
  iron: '鐵',
  magnesium: '鎂',
  manganese: '錳',
  molybdenum: '鉬',
  niacin: '菸鹼素',
  pantothenic_acid: '泛酸',
  selenium: '硒',
  taurine: '牛磺酸',
  vitamin_a: '維生素A',
  vitamin_b1: '維生素B1',
  vitamin_b2: '維生素B2',
  vitamin_b6: '維生素B6',
  vitamin_b12: '維生素B12',
  vitamin_c: '維生素C',
  vitamin_d: '維生素D',
  vitamin_e: '維生素E',
  vitamin_k: '維生素K',
  zinc: '鋅',
  trans_fat: '反式脂肪',
  saturated_fat: '飽和脂肪',
  cholesterol: '膽固醇',
  inositol: '肌醇',
  lactose: '乳糖',
  fructose: '果糖',
  sucrose: '蔗糖',
  sugar: '糖',
  beta_glucan: 'β-聚葡萄糖',
  soluble_dietary_fiber: '水溶性膳食纖維',
  insoluble_dietary_fiber: '非水溶性膳食纖維',
  l_carnitine: '左旋肉鹼',
  alanine: '丙胺酸',
  arginine: '精胺酸',
  aspartic_acid: '天門冬胺酸',
  cystine: '胱胺酸',
  glutamic_acid: '麩胺酸',
  glycine: '甘胺酸',
  histidine: '組胺酸',
  isoleucine: '異白胺酸',
  leucine: '白胺酸',
  lysine: '離胺酸',
  methionine: '甲硫胺酸',
  phenylalanine: '苯丙胺酸',
  proline: '脯胺酸',
  serine: '絲胺酸',
  threonine: '酥胺酸',
  tryptophan: '色胺酸',
  tyrosine: '酪胺酸',
  valine: '纈胺酸',
  beta_carotene: 'β-胡蘿蔔素',
  moisture: '水分',
  hmb: 'β-羥基-β-甲基丁酸(HMB)',
  ca_hmb: 'β-羥基-β-甲基丁酸鈣(CaHMB)',
  bcaa: '支鏈胺基酸',
  eaa: '必需胺基酸',
  mcfa: '中鏈脂肪酸',
  mufa: '單元不飽和脂肪酸',
  pufa: '多元不飽和脂肪酸',
  omega_3_fatty_acid: 'Omega-3 脂肪酸',
  omega_6_fatty_acid: 'Omega-6 脂肪酸',
  omega_9_fatty_acid: 'Omega-9 脂肪酸',
  fructooligosaccharides: '果寡糖',
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
  // tier 2 nutrients
  biotin: 'µg',
  calcium: 'mg',
  chloride: 'mg',
  choline: 'mg',
  chromium: 'µg',
  copper: 'mg',
  folic_acid: 'µg',
  iodine: 'µg',
  iron: 'mg',
  magnesium: 'mg',
  manganese: 'mg',
  molybdenum: 'µg',
  niacin: 'µg NE',
  pantothenic_acid: 'mg',
  selenium: 'µg',
  taurine: 'mg',
  vitamin_a: 'µg RE',
  vitamin_b1: 'mg',
  vitamin_b2: 'mg',
  vitamin_b6: 'mg',
  vitamin_b12: 'µg',
  vitamin_c: 'mg',
  vitamin_d: 'µg',
  vitamin_e: 'mg α-TE',
  vitamin_k: 'µg',
  trans_fat: 'g',
  saturated_fat: 'g',
  cholesterol: 'mg',
  zinc: 'mg',
  inositol: 'mg',
  lactose: 'g',
  fructose: 'g',
  sucrose: 'g',
  sugar: 'g',
  beta_glucan: 'g',
  soluble_dietary_fiber: 'g',
  insoluble_dietary_fiber: 'g',
  l_carnitine: 'mg',
  alanine: 'mg',
  arginine: 'mg',
  aspartic_acid: 'mg',
  cystine: 'mg',
  glutamic_acid: 'mg',
  glycine: 'mg',
  histidine: 'mg',
  isoleucine: 'mg',
  leucine: 'mg',
  lysine: 'mg',
  methionine: 'mg',
  phenylalanine: 'mg',
  proline: 'mg',
  serine: 'mg',
  threonine: 'mg',
  tryptophan: 'mg',
  tyrosine: 'mg',
  valine: 'mg',
  beta_carotene: 'µg',
  moisture: 'g',
  hmb: 'mg',
  ca_hmb: 'mg',
  bcaa: 'g',
  eaa: 'g',
  mcfa: 'g',
  mufa: 'g',
  pufa: 'g',
  omega_3_fatty_acid: 'g',
  omega_6_fatty_acid: 'g',
  omega_9_fatty_acid: 'g',
  fructooligosaccharides: 'g',
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