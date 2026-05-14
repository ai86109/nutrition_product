import {
  convertToStandardUnit,
  formatProductData,
  normalizeUnit,
} from '@/lib/product-processor'

// 共用：建一個 factor=1 的 RawProduct，方便驗 ingredients 數值
// （defaultAmount / standard_weight = 100 / 100 = 1）
const makeProduct = (
  nutritionFacts: Record<string, { unit?: string; value?: unknown }>
) => ({
  license_no: 'TEST-001',
  name_zh: '測試品',
  name_en: 'Test',
  brand: 'TestBrand',
  form: 'powder',
  standard_weight: 100,
  is_approved: true,
  categories: [],
  nutrition_facts: nutritionFacts,
  product_variants: [{ is_default: true, volume: 100, quantity: 1, unit: 'spoon' }],
})

describe('normalizeUnit', () => {
  describe('vitamin_a (µg RE) 的各種變體', () => {
    test.each([
      ['ug', 'ug'],
      ['ugRE', 'ug'],
      ['ug RE', 'ug'],
      ['ugRE ', 'ug'],
      ['µgRE', 'ug'],
      ['µg RE', 'ug'],
      ['µg-RE', 'ug'],
      [' µg RE ', 'ug'],            // 前後都有空白
      ['UGRE', 'ug'],                // 全大寫
    ])('"%s" → "%s"', (input, expected) => {
      expect(normalizeUnit(input)).toBe(expected)
    })
  })

  describe('niacin (mg NE) 的變體', () => {
    test.each([
      ['mgNE', 'mg'],
      ['mg NE', 'mg'],
      ['mg-NE', 'mg'],
      ['MgNe', 'mg'],
    ])('"%s" → "%s"', (input, expected) => {
      expect(normalizeUnit(input)).toBe(expected)
    })
  })

  describe('vitamin_e (mg α-TE) 的變體', () => {
    test.each([
      ['mgαTE', 'mg'],
      ['mg α-TE', 'mg'],
      ['mgα-TE', 'mg'],
      ['mg αTE', 'mg'],
    ])('"%s" → "%s"', (input, expected) => {
      expect(normalizeUnit(input)).toBe(expected)
    })
  })

  describe('mcg (美式寫法) → ug', () => {
    test.each([
      ['mcg', 'ug'],
      ['mcgRE', 'ug'],
      ['mcg RE', 'ug'],
      ['MCG', 'ug'],
    ])('"%s" → "%s"', (input, expected) => {
      expect(normalizeUnit(input)).toBe(expected)
    })
  })

  describe('NUTRIENT_UNITS 表內既有寫法（µ + 空白）', () => {
    test.each([
      ['µg RE', 'ug'],   // vitamin_a
      ['mg α-TE', 'mg'], // vitamin_e
      ['mg NE', 'mg'],   // niacin
      ['µg', 'ug'],      // vitamin_b12 / d / k / iodine ...
      ['mg', 'mg'],
      ['g', 'g'],
    ])('"%s" → "%s"', (input, expected) => {
      expect(normalizeUnit(input)).toBe(expected)
    })
  })

  describe('edge cases', () => {
    test('undefined → 空字串', () => {
      expect(normalizeUnit(undefined)).toBe('')
    })

    test('空字串 → 空字串', () => {
      expect(normalizeUnit('')).toBe('')
    })

    test('沒命中規則的單位原樣 lowercase（守衛會擋下後續換算）', () => {
      expect(normalizeUnit('IU')).toBe('iu')
      expect(normalizeUnit('CFU')).toBe('cfu')
      expect(normalizeUnit('kcal')).toBe('kcal')
    })
  })
})

describe('convertToStandardUnit', () => {
  test('同單位不換算', () => {
    expect(convertToStandardUnit(100, 'mg', 'mg')).toBe(100)
  })

  test('mg → g（÷1000）', () => {
    expect(convertToStandardUnit(1000, 'mg', 'g')).toBe(1)
  })

  test('g → mg（×1000）', () => {
    expect(convertToStandardUnit(1, 'g', 'mg')).toBe(1000)
  })

  test('ug → mg（÷1000）', () => {
    expect(convertToStandardUnit(1000, 'ug', 'mg')).toBe(1)
  })

  test('未知單位走守衛，回傳原值並 console.warn', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(convertToStandardUnit(130, 'ugRE', 'ug')).toBe(130)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('unknown unit')
    )
    warnSpy.mockRestore()
  })

  test('未知 toUnit 也走守衛', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(convertToStandardUnit(5, 'mg', 'iu')).toBe(5)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

describe('ingredientsProcessor (透過 formatProductData)', () => {
  describe('修掉的 bug：當量後綴不再被當成「克」灌水', () => {
    test('vitamin_a "ugRE" 130 → 130（過去會被換算成 130,000,000）', () => {
      const [result] = formatProductData([
        makeProduct({ vitamin_a: { unit: 'ugRE', value: 130 } }),
      ])
      expect(result.ingredients.vitamin_a).toBe(130)
    })

    test('vitamin_a "µg-RE" 100 → 100', () => {
      const [result] = formatProductData([
        makeProduct({ vitamin_a: { unit: 'µg-RE', value: 100 } }),
      ])
      expect(result.ingredients.vitamin_a).toBe(100)
    })

    test('niacin "mgNE" 5 → 5（過去會被換算成 5000）', () => {
      const [result] = formatProductData([
        makeProduct({ niacin: { unit: 'mgNE', value: 5 } }),
      ])
      expect(result.ingredients.niacin).toBe(5)
    })

    test('vitamin_e "mgαTE" 8 → 8', () => {
      const [result] = formatProductData([
        makeProduct({ vitamin_e: { unit: 'mgαTE', value: 8 } }),
      ])
      expect(result.ingredients.vitamin_e).toBe(8)
    })

    test('vitamin_a "mcg" 150 → 150（美式寫法）', () => {
      const [result] = formatProductData([
        makeProduct({ vitamin_a: { unit: 'mcg', value: 150 } }),
      ])
      expect(result.ingredients.vitamin_a).toBe(150)
    })
  })

  describe('正常的 mass 單位換算仍可運作', () => {
    test('protein 預設是 g：unit=mg, value=1000 → 1', () => {
      const [result] = formatProductData([
        makeProduct({ protein: { unit: 'mg', value: 1000 } }),
      ])
      expect(result.ingredients.protein).toBe(1)
    })

    test('calcium 預設是 mg：unit=g, value=1 → 1000', () => {
      const [result] = formatProductData([
        makeProduct({ calcium: { unit: 'g', value: 1 } }),
      ])
      expect(result.ingredients.calcium).toBe(1000)
    })

    test('vitamin_b12 預設是 µg：unit=mg, value=1 → 1000', () => {
      const [result] = formatProductData([
        makeProduct({ vitamin_b12: { unit: 'mg', value: 1 } }),
      ])
      expect(result.ingredients.vitamin_b12).toBe(1000)
    })
  })

  describe('未知單位走守衛，回傳原值（不灌水）', () => {
    test('IU 之類不認得的單位不會被當成克', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const [result] = formatProductData([
        makeProduct({ vitamin_a: { unit: 'IU', value: 500 } }),
      ])
      // 不換算，原值 500 × factor(1) = 500
      expect(result.ingredients.vitamin_a).toBe(500)
      warnSpy.mockRestore()
    })
  })

  describe('其他既有行為不受影響', () => {
    test('value 為字串也能處理（既有行為）', () => {
      const [result] = formatProductData([
        makeProduct({ protein: { unit: 'g', value: '12' } }),
      ])
      expect(result.ingredients.protein).toBe(12)
    })

    test('value 為非數字 fallback 0', () => {
      const [result] = formatProductData([
        makeProduct({ protein: { unit: 'g', value: 'abc' } }),
      ])
      expect(result.ingredients.protein).toBe(0)
    })

    test('套用 factor（defaultAmount / standard_weight）', () => {
      // 用 standard_weight=200, defaultAmount=100 → factor=0.5
      const product = {
        ...makeProduct({ protein: { unit: 'g', value: 20 } }),
        standard_weight: 200,
      }
      const [result] = formatProductData([product])
      expect(result.ingredients.protein).toBe(10)
    })
  })
})
