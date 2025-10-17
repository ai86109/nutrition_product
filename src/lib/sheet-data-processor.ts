import type { 
  FieldMappings,
  ApiProductData,
  ProcessedSpec,
  ProcessedSpecData,
  IngredientsData
} from '@/types'

const FIELD_MAPPINGS: FieldMappings = {
  info: {
    '審核狀態': 'reviewStatus',
    '許可證字號': 'id',
    '中文品名': 'name',
    '英文品名': 'engName',
    '申請商名稱': 'brand',
    '劑型': 'type',
    '類別': 'categories',
  },
  spec: {
    '許可證字號': 'id',
    '中文品名': 'name',
    '預設份量': 'defaultAmount',
    'type': 'type',
    'unit': 'unit',
    'defaultAmount': 'defaultAmount',
    'volume': 'volume',
  },
  ingredients: {
    'calories': 'calories',
    'carbohydrate': 'carbohydrate',
    'protein': 'protein',
    'fat': 'fat',
    'phosphorus': 'phosphorus',
    'potassium': 'potassium',
    'sodium': 'sodium',
    'fiber': 'fiber'
  }
}

function buildMapFromRows<T>(
  rows: string[][],
  processor: (row: string[]) => T
): Map<string, T[]> {
  const map = new Map<string, T[]>()

  rows.forEach((row) => {
    const id = row[0]
    if (!id) return

    const processedData = processor(row)
    if (!processedData) return

    if (!map.has(id)) {
      map.set(id, [])
    }
    map.get(id)!.push(processedData)
  })

  return map
}

function processSpecRow(row: string[], headers: string[]): ProcessedSpecData {
  const specs: ProcessedSpec[] = []
  let currentSpec: ProcessedSpec | null = null
  headers.forEach((header, index) => {
    const mappedField = FIELD_MAPPINGS.spec[header] || header
    
    if (mappedField === 'id' || mappedField === 'name' || header === '預設份量') return

    const value = row[index] || ''
    if (!value) return // 如果沒有值，則跳過

    if (!currentSpec) {
      currentSpec = { type: value }
      specs.push(currentSpec)
    } else if (mappedField === 'type') {
      currentSpec = { type: value }
      specs.push(currentSpec)
    } else {
      currentSpec[mappedField as keyof ProcessedSpec] = value
    }
  })

  const specData: ProcessedSpecData = {
    id: row[0],
    name: row[1],
    defaultAmount: row[2],
    spec: specs
  }

  return specData
}

function processIngredientsRow(row: string[], headers: string[]): IngredientsData {
  const ingredientsObj: Partial<IngredientsData> = {}
  headers.forEach((header, index) => {
    const mappedField = FIELD_MAPPINGS.ingredients[header]
    if (mappedField) {
    ingredientsObj[mappedField as keyof IngredientsData] = Number(row[index]) || 0
    }
  })
  return ingredientsObj as IngredientsData
}

function processInfoRow(row: string[], headers: string[]): Partial<ApiProductData> | null {
  const product: Partial<ApiProductData> = {
    categories: [],
  }
  
  headers.forEach((header, index) => {
    const mappedField = FIELD_MAPPINGS.info[header] || header
    const value = row[index] || ''

    if (mappedField === 'categories') {
      product[mappedField] = product[mappedField] || [];
      if (value) product[mappedField].push(value);
    } else {
      (product as any)[mappedField] = value;
    }
  })
  
  return product.id ? product : null
}

function mergeProductData(
  infoData: Partial<ApiProductData>,
  specMap: Map<string, ProcessedSpecData[]>,
  ingredientsMap: Map<string, IngredientsData[]>
) {
  const productId = infoData.id!
      
  // spec
  const specResult = specMap.get(productId)
  const spec = specResult?.[0]?.spec || []
  const defaultAmount = specResult?.[0]?.defaultAmount || ''

  // ingredients
  const ingredientsResult = ingredientsMap.get(productId)
  const { calories, carbohydrate, protein, fat, phosphorus, potassium, sodium, fiber } = ingredientsResult?.[0] || {}
  const ingredients = {
    calories: Number(calories) || 0,
    carbohydrate: Number(carbohydrate) || 0,
    protein: Number(protein) || 0,
    fat: Number(fat) || 0,
    phosphorus: Number(phosphorus) || 0,
    potassium: Number(potassium) || 0,
    sodium: Number(sodium) || 0,
    fiber: Number(fiber) || 0
  }

  return {
    ...infoData,
    defaultAmount,
    spec,
    ingredients
  } as ApiProductData
}

function isValidProduct(product: ApiProductData): boolean {
  // id, name, defaultAmount
  if (!product.id || !product.name || !product.defaultAmount) return false

  // spec 必須存在
  if (!product.spec || product.spec.length <= 0) return false

  // calories 必須存在且大於 0
  if (!product.ingredients || product.ingredients?.calories <= 0) return false

  return true
}

function sanitizeProduct(product: ApiProductData): ApiProductData {
  const sanitized = { ...product }
  // 如果沒有被營養師驗證過，不顯示 categories
  if (sanitized.reviewStatus === 'FALSE') {
    sanitized.categories = []
  }

  return sanitized
}

export function combineSheetData(
  infoData: string[][],
  specData: string[][],
  ingredientsData: string[][]
): ApiProductData[] {
  if (!infoData || !specData || !ingredientsData) {
    throw new Error('Missing one or more sheet data')
  }

  const [infoHeaders, ...infoRows] = infoData
  const [specHeaders, ...specRows] = specData
  const [ingredientsHeaders, ...ingredientsRows] = ingredientsData

  // 建立索引
  const specMap = buildMapFromRows(specRows, (row) => 
    processSpecRow(row, specHeaders)
  )

  const ingredientsMap = buildMapFromRows(ingredientsRows, (row) => 
    processIngredientsRow(row, ingredientsHeaders)
  )

  // 合併資料
  const combinedData: ApiProductData[] = infoRows
    .map((row) => processInfoRow(row, infoHeaders))
    .filter((product): product is Partial<ApiProductData> => product !== null)
    .map((infoData) => mergeProductData(infoData, specMap, ingredientsMap))
    .filter(isValidProduct)
    .map(sanitizeProduct)

  return combinedData
}
