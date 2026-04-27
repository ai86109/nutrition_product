import { NextResponse } from 'next/server'
import { getProductDetailFromSupabase } from '@/lib/products-server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  }

  const product = await getProductDetailFromSupabase(id)

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}
