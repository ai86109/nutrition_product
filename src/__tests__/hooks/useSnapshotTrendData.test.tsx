import { renderHook } from "@testing-library/react"
import { useSnapshotTrendData } from "@/hooks/useSnapshotTrendData"
import type { PatientSnapshot } from "@/types/patient"

function makeSnap(overrides: Partial<PatientSnapshot> = {}): PatientSnapshot {
  return {
    id: "s1",
    patient_id: "p1",
    user_id: "u1",
    bio_info: { height: null, weight: null, gender: null },
    calorie_range: null,
    protein_range: null,
    actual_calorie: null,
    actual_protein: null,
    meals_per_day: null,
    selected_products: [],
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    snapshot_date: null,
    ...overrides,
  }
}

describe("useSnapshotTrendData", () => {
  test("returns empty result when no snapshots", () => {
    const { result } = renderHook(() => useSnapshotTrendData([]))
    expect(result.current.weight).toEqual([])
    expect(result.current.calorie).toEqual([])
    expect(result.current.protein).toEqual([])
    expect(result.current.productHistory).toEqual([])
    expect(result.current.dateRange).toBeNull()
    expect(result.current.totalCount).toBe(0)
  })

  test("sorts snapshots ascending by created_at regardless of input order", () => {
    const newer = makeSnap({
      id: "newer",
      created_at: "2026-04-15T00:00:00Z",
      bio_info: { weight: 70, height: null, gender: null },
    })
    const older = makeSnap({
      id: "older",
      created_at: "2026-01-01T00:00:00Z",
      bio_info: { weight: 65, height: null, gender: null },
    })
    const { result } = renderHook(() => useSnapshotTrendData([newer, older]))
    expect(result.current.weight.map((p) => p.snapshotId)).toEqual([
      "older",
      "newer",
    ])
    expect(result.current.weight.map((p) => p.value)).toEqual([65, 70])
  })

  test("filters out points with null weight per series", () => {
    const noWeight = makeSnap({ id: "a" })
    const withWeight = makeSnap({
      id: "b",
      created_at: "2026-02-01T00:00:00Z",
      bio_info: { weight: 70, height: null, gender: null },
    })
    const { result } = renderHook(() =>
      useSnapshotTrendData([noWeight, withWeight])
    )
    expect(result.current.weight).toHaveLength(1)
    expect(result.current.weight[0].snapshotId).toBe("b")
  })

  test("includes calorie only when both min and max are finite numbers", () => {
    const noCal = makeSnap({ id: "a" })
    const onlyMin = makeSnap({
      id: "min-only",
      created_at: "2026-01-15T00:00:00Z",
      calorie_range: { min: 1800, max: null },
    })
    const withRange = makeSnap({
      id: "b",
      created_at: "2026-02-01T00:00:00Z",
      calorie_range: { min: 1800, max: 2000 },
    })
    const { result } = renderHook(() =>
      useSnapshotTrendData([noCal, onlyMin, withRange])
    )
    expect(result.current.calorie).toHaveLength(1)
    expect(result.current.calorie[0].snapshotId).toBe("b")
    expect(result.current.calorie[0].range).toEqual([1800, 2000])
    expect(result.current.calorie[0].min).toBe(1800)
    expect(result.current.calorie[0].max).toBe(2000)
  })

  test("includes calorie point when only actual_calorie is set (range null)", () => {
    const onlyActual = makeSnap({
      id: "actual",
      created_at: "2026-02-10T00:00:00Z",
      actual_calorie: 1750,
    })
    const { result } = renderHook(() => useSnapshotTrendData([onlyActual]))
    expect(result.current.calorie).toHaveLength(1)
    expect(result.current.calorie[0].range).toBeNull()
    expect(result.current.calorie[0].min).toBeNull()
    expect(result.current.calorie[0].max).toBeNull()
    expect(result.current.calorie[0].actual).toBe(1750)
  })

  test("includes protein only when both min and max are finite numbers", () => {
    const onlyMin = makeSnap({
      id: "a",
      protein_range: { min: 60, max: null },
    })
    const both = makeSnap({
      id: "b",
      created_at: "2026-02-01T00:00:00Z",
      protein_range: { min: 60, max: 75 },
    })
    const nullPr = makeSnap({
      id: "c",
      created_at: "2026-03-01T00:00:00Z",
      protein_range: null,
    })
    const { result } = renderHook(() =>
      useSnapshotTrendData([onlyMin, both, nullPr])
    )
    expect(result.current.protein).toHaveLength(1)
    expect(result.current.protein[0].snapshotId).toBe("b")
    expect(result.current.protein[0].range).toEqual([60, 75])
    expect(result.current.protein[0].min).toBe(60)
    expect(result.current.protein[0].max).toBe(75)
  })

  test("productHistory includes only snapshots with products, newest first", () => {
    const products = [
      {
        product_id: "p1",
        name_zh: "亞培安素",
        brand: "亞培",
        form: "powder",
        serving_label: "1包",
        serving_amount: 23,
        serving_unit: "g",
        quantity: 2,
      },
    ]
    const withProducts = makeSnap({
      id: "with",
      created_at: "2026-02-01T00:00:00Z",
      selected_products: products,
    })
    const noProducts = makeSnap({
      id: "without",
      created_at: "2026-03-01T00:00:00Z",
      selected_products: [],
    })
    const { result } = renderHook(() =>
      useSnapshotTrendData([withProducts, noProducts])
    )
    expect(result.current.productHistory).toHaveLength(1)
    expect(result.current.productHistory[0].snapshotId).toBe("with")
    expect(result.current.productHistory[0].products).toEqual(products)
  })

  test("productHistory is ordered newest first when multiple snapshots have products", () => {
    const older = makeSnap({
      id: "older",
      created_at: "2026-01-01T00:00:00Z",
      selected_products: [
        { product_id: "p1", name_zh: "A", serving_label: "1包", serving_amount: 10, serving_unit: "g", quantity: 1 },
      ],
    })
    const newer = makeSnap({
      id: "newer",
      created_at: "2026-04-01T00:00:00Z",
      selected_products: [
        { product_id: "p2", name_zh: "B", serving_label: "1罐", serving_amount: 200, serving_unit: "ml", quantity: 2 },
      ],
    })
    const { result } = renderHook(() => useSnapshotTrendData([older, newer]))
    expect(result.current.productHistory.map((p) => p.snapshotId)).toEqual([
      "newer",
      "older",
    ])
  })

  test("dateRange returns earliest and latest dates as YYYY-MM-DD", () => {
    const a = makeSnap({ id: "a", created_at: "2026-01-15T08:00:00Z" })
    const b = makeSnap({ id: "b", created_at: "2026-04-01T08:00:00Z" })
    const c = makeSnap({ id: "c", created_at: "2026-02-10T08:00:00Z" })
    const { result } = renderHook(() => useSnapshotTrendData([a, b, c]))
    expect(result.current.dateRange).not.toBeNull()
    const { from, to } = result.current.dateRange!
    expect(from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // YYYY-MM-DD 字串可直接比較
    expect(from <= to).toBe(true)
  })

  test("totalCount equals input length, ignoring null filtering", () => {
    const a = makeSnap({ id: "a" })
    const b = makeSnap({
      id: "b",
      created_at: "2026-02-01T00:00:00Z",
      bio_info: { weight: 70, height: null, gender: null },
    })
    const { result } = renderHook(() => useSnapshotTrendData([a, b]))
    expect(result.current.totalCount).toBe(2)
    expect(result.current.weight).toHaveLength(1) // null 被濾掉
  })

  test("snapshot_date overrides created_at for ordering", () => {
    // a 雖然 created_at 較晚，但 snapshot_date 把它放回較早的位置
    const a = makeSnap({
      id: "a",
      created_at: "2026-04-15T00:00:00Z",
      snapshot_date: "2026-01-05",
      bio_info: { weight: 65, height: null, gender: null },
    })
    const b = makeSnap({
      id: "b",
      created_at: "2026-02-01T00:00:00Z",
      snapshot_date: null,
      bio_info: { weight: 70, height: null, gender: null },
    })
    const { result } = renderHook(() => useSnapshotTrendData([a, b]))
    // a 的 effective 是 2026-01-05，比 b 的 2026-02-01 早 → asc 排序 a 在前
    expect(result.current.weight.map((p) => p.snapshotId)).toEqual(["a", "b"])
    expect(result.current.weight.map((p) => p.value)).toEqual([65, 70])
    expect(result.current.weight[0].date).toBe("2026-01-05")
  })
})
