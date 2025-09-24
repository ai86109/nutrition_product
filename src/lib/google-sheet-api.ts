export async function fetchSheetsData(): Promise<{
  infoData: string[][],
  specData: string[][],
  ingredientsData: string[][]
}> {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID
  const API_KEY = process.env.GOOGLE_SHEET_API_KEY

  if (!SHEET_ID || !API_KEY) {
    console.error('Missing Google Sheets configuration')
    return {
      infoData: [],
      specData: [],
      ingredientsData: []
    }
  }

  // get worksheet 'info' 'spec' 'ingredients'
  const [infoResponse, specResponse, ingredientsResponse] = await Promise.all([
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/info?key=${API_KEY}`, {
      next: { revalidate: 60 * 60 * 24 } // Revalidate every day
    }),
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/spec?key=${API_KEY}`, {
      next: { revalidate: 60 * 60 * 24 } // Revalidate every day
    }),
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ingredients?key=${API_KEY}`, {
      next: { revalidate: 60 * 60 * 24 } // Revalidate every day
    })
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

  return {
    infoData: infoData.values,
    specData: specData.values,
    ingredientsData: ingredientsData.values
  }
}
