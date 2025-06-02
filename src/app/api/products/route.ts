export async function GET() {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID
  const API_KEY = process.env.GOOGLE_SHEET_API_KEY
  try {
    // const query = `SELECT * WHERE C = '亞培'`
    // const response = await fetch(`https://docs.google.com/a/google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tq=${encodeURIComponent(query)}&sheet=list&key=${API_KEY}`)

    // get worksheet 'info' 'spec' 'ingredients'
    const [infoResponse, specResponse, ingredientsResponse] = await Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/info?key=${API_KEY}`),
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/spec?key=${API_KEY}`),
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ingredients?key=${API_KEY}`)
    ])

    // 檢查所有回應是否成功
    if (!infoResponse.ok || !specResponse.ok || !ingredientsResponse.ok) {
      throw new Error('One or more sheets failed to load')
    }

    // 解析 JSON 資料
    const [infoData, specData, ingredientsData] = await Promise.all([
      infoResponse.json(),
      specResponse.json(),
      ingredientsResponse.json()
    ])

    const combinedData = combineSheetData(infoData.values, specData.values, ingredientsData.values)

    return Response.json(combinedData)
  } catch (error) {
    console.error('Error fetching products:', error)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

const FIELD_MAPPINGS = {
    info: {
      '審核狀態': 'reviewStatus',
      '許可證字號': 'id',
      '中文品名': 'name',
      '英文品名': 'engName',
      '申請商名稱': 'brand',
      '劑型': 'type',
      '類別': 'categories',
      // '更新時間': 'updatedAt',
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
      'kalium': 'kalium',
      'sodium': 'sodium',
      'fiber': 'fiber'
    }
  }

function combineSheetData(infoData, specData, ingredientsData) {
  if (!infoData || !specData || !ingredientsData) {
    throw new Error('Missing one or more sheet data')
  }

  const [infoHeaders, ...infoRows] = infoData
  const [specHeaders, ...specRows] = specData
  const [ingredientsHeaders, ...ingredientsRows] = ingredientsData

  // 建立索引
  const specMap = new Map()
  const ingredientsMap = new Map()
  specRows.forEach(row => {
    const id = row[0]
    if (!specMap.has(id)) {
      specMap.set(id, [])
    }

    const specs = []
    let currentSpec = null
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
        currentSpec[mappedField] = value
      }
    })
    specMap.get(id).push({
      id: row[0],
      name: row[1],
      defaultAmount: row[2],
      spec: specs
    })
  })
  ingredientsRows.forEach(row => {
    const id = row[0]
    if (!ingredientsMap.has(id)) {
      ingredientsMap.set(id, [])
    }
    const ingredientsObj = {}
    ingredientsHeaders.forEach((header, index) => {
      ingredientsObj[header] = row[index] || ''
    })
    ingredientsMap.get(id).push(ingredientsObj)
  })

  // 合併資料
  const combinedData = infoRows.filter(row => row[1]).map(row => {
    const product = {}
    
    // info
    infoHeaders.forEach((header, index) => {
      const mappedField = FIELD_MAPPINGS.info[header] || header
      const value = row[index] || ''

      if (mappedField === 'categories') {
        if (!value) product[mappedField] = []
        else if (product[mappedField]) product[mappedField].push(value)
        else product[mappedField] = [value]
      } else {
        product[mappedField] = value
      }
    })
    
    const productId = product.id
    // spec
    const specResult = specMap.get(productId)
    product.spec = specResult[0]?.spec || []
    product.defaultAmount = specResult[0]?.defaultAmount || ''

    // ingredients
    const ingredientsResult = ingredientsMap.get(productId)
    const { calories, carbohydrate, protein, fat, phosphorus, kalium, sodium, fiber } = ingredientsResult[0] || {}
    product.ingredients = {
      calories,
      carbohydrate,
      protein,
      fat,
      phosphorus,
      kalium,
      sodium,
      fiber
    }

    return product
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
