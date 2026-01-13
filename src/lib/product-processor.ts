const categoryMap = {
  'balanced': '均衡配方',
  'concentrated': '濃縮配方',
}

const formMap = {
  'powder': '粉劑',
  'liquid': '液劑',
}

const unitMap = {
  "spoon": "匙",
  "pack": "包",
  "can": "罐"
}

const categoryProcessor = (categories) => {
  return categories.map((cate) => {
    return categoryMap[cate] || cate
  })
}

const ingredientsProcessor = (ingredients, factor) => {
  if (!factor || factor <= 0) return ingredients

  const processedIngredients = {}
  for (const [key, value] of Object.entries(ingredients)) {
    processedIngredients[key] = Number((value.value * factor).toFixed(2))
  }

  return processedIngredients
}

const isValidProduct = (product) => {
  // check defaultAmount
  const defaultAmount = product.product_variants?.find(variant => variant.is_default)?.volume || null
  if (!defaultAmount) return false;

  // check nutrition_facts
  if (!product.nutrition_facts || Object.keys(product.nutrition_facts).length === 0) return false;

  return true;
}

export const formatProductData = (products) => {
  return products
    .filter(isValidProduct)
    .map((product) => {
      const { is_approved, categories: rawCate, product_variants, form, standard_weight } = product
      const categories = is_approved ? categoryProcessor(rawCate || []) : []

      const defaultAmount = product_variants?.find(variant => variant.is_default)?.volume || null

      const type = formMap[form] || form

      const factor = defaultAmount / standard_weight || 1
      const ingredients = ingredientsProcessor(product.nutrition_facts, factor)

      const spec = product_variants.map(variant => {
        return {
          defaultAmount: variant.quantity,
          unit: unitMap[variant.unit] || variant.unit,
          volume: variant.volume,
        }
      })

      return {
        brand: product.brand,
        categories,
        defaultAmount,
        id: product.license_no,
        name: product.name_zh,
        engName: product.name_en,
        ingredients,
        type,
        spec,
        reviewStatus: is_approved
      }
    })
}