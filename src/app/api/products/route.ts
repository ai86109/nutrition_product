import { fetchSheetsData } from '@/lib/google-sheet-api'
import { combineSheetData } from '@/lib/sheet-data-processor'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { infoData, specData, ingredientsData } = await fetchSheetsData()
    const combinedData = combineSheetData(infoData, specData, ingredientsData)
    return NextResponse.json(combinedData)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
