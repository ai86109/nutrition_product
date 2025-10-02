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
  const specMap = new Map<string, ProcessedSpecData[]>()
  const ingredientsMap = new Map<string, IngredientsData[]>()
  specRows.forEach((row: string[]) => {
    const id = row[0]
    if (!id) return
    if (!specMap.has(id)) {
      specMap.set(id, [])
    }

    const specs: ProcessedSpec[] = []
    let currentSpec: ProcessedSpec | null = null
    specHeaders.forEach((header, index) => {
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
    specMap.get(id)!.push(specData)
  })
  
  ingredientsRows.forEach((row: string[]) => {
    const id = row[0]
    if (!id) return
    if (!ingredientsMap.has(id)) {
      ingredientsMap.set(id, [])
    }
    const ingredientsObj: Partial<IngredientsData> = {}
    ingredientsHeaders.forEach((header, index) => {
      const mappedField = FIELD_MAPPINGS.ingredients[header]
      if (mappedField) {
      ingredientsObj[mappedField as keyof IngredientsData] = Number(row[index]) || 0
      }
    })
    ingredientsMap.get(id)!.push(ingredientsObj as IngredientsData)
  })

  // 合併資料
  const combinedData: ApiProductData[] = infoRows
    .filter((row: string[]) => row[1])
    .map((row: string[]): ApiProductData => {
      const product: Partial<ApiProductData> = {
        categories: [],
      }
      
      // info
      infoHeaders.forEach((header, index) => {
        const mappedField = FIELD_MAPPINGS.info[header] || header
        const value = row[index] || ''

        if (mappedField === 'categories') {
          product[mappedField] = product[mappedField] || [];
          if (value) product[mappedField].push(value);
        } else {
          product[mappedField] = value;
        }
      })
      
      const productId = product.id!
      // spec
      const specResult = specMap.get(productId)
      product.spec = specResult?.[0]?.spec || []
      product.defaultAmount = specResult?.[0]?.defaultAmount || ''

      // ingredients
      const ingredientsResult = ingredientsMap.get(productId)
      const { calories, carbohydrate, protein, fat, phosphorus, potassium, sodium, fiber } = ingredientsResult?.[0] || {}
      product.ingredients = {
        calories: Number(calories) || 0,
        carbohydrate: Number(carbohydrate) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        phosphorus: Number(phosphorus) || 0,
        potassium: Number(potassium) || 0,
        sodium: Number(sodium) || 0,
        fiber: Number(fiber) || 0
      }

      return product as ApiProductData
    })

  // 過濾不完整的 data
  const filteredData = combinedData.filter(product => {
    // id, name, defaultAmount, spec 必須存在
    if (!product.id || !product.name || !product.defaultAmount || product.spec.length <= 0) {
      return false
    }
    // calories 必須存在且大於 0
    if (!product.ingredients || product.ingredients?.calories <= 0) return false

    // 如果沒有被營養師驗證過，不顯示 categories
    if (product.reviewStatus === 'FALSE') product.categories = []

    return product
  })

  return filteredData
}
