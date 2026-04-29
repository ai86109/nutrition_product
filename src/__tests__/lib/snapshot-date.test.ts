import {
  compareByEffectiveDateAsc,
  compareByEffectiveDateDesc,
  getEffectiveDate,
  getEffectiveDateMs,
} from "@/lib/snapshot-date"

describe("snapshot-date helpers", () => {
  describe("getEffectiveDate", () => {
    test("returns snapshot_date when set", () => {
      expect(
        getEffectiveDate({
          created_at: "2026-04-15T08:00:00Z",
          snapshot_date: "2026-04-10",
        })
      ).toBe("2026-04-10")
    })

    test("falls back to created_at as local YYYY-MM-DD when snapshot_date is null", () => {
      const result = getEffectiveDate({
        created_at: "2026-04-15T08:00:00Z",
        snapshot_date: null,
      })
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe("getEffectiveDateMs", () => {
    test("uses snapshot_date midnight (local) when set", () => {
      const ms = getEffectiveDateMs({
        created_at: "2026-04-15T08:00:00Z",
        snapshot_date: "2026-04-10",
      })
      const d = new Date(ms)
      expect(d.getFullYear()).toBe(2026)
      expect(d.getMonth() + 1).toBe(4)
      expect(d.getDate()).toBe(10)
      // 應該是本地 00:00
      expect(d.getHours()).toBe(0)
      expect(d.getMinutes()).toBe(0)
    })

    test("uses created_at timestamp directly when snapshot_date is null", () => {
      const ms = getEffectiveDateMs({
        created_at: "2026-04-15T08:00:00Z",
        snapshot_date: null,
      })
      expect(ms).toBe(new Date("2026-04-15T08:00:00Z").getTime())
    })
  })

  describe("compareByEffectiveDateAsc", () => {
    test("orders by snapshot_date ascending", () => {
      const a = { created_at: "2026-01-01T00:00:00Z", snapshot_date: "2026-04-15" }
      const b = { created_at: "2026-01-01T00:00:00Z", snapshot_date: "2026-04-10" }
      expect(compareByEffectiveDateAsc(a, b)).toBeGreaterThan(0)
      expect(compareByEffectiveDateAsc(b, a)).toBeLessThan(0)
    })

    test("falls back to created_at when snapshot_date is null", () => {
      const older = {
        created_at: "2026-04-10T00:00:00Z",
        snapshot_date: null,
      }
      const overridden = {
        created_at: "2026-04-20T00:00:00Z",
        snapshot_date: "2026-04-15",
      }
      // overridden 的 effective 是 4/15，older 是 4/10
      expect(compareByEffectiveDateAsc(older, overridden)).toBeLessThan(0)
    })

    test("uses created_at as tiebreaker when effective dates match", () => {
      const earlier = {
        created_at: "2026-04-15T08:00:00Z",
        snapshot_date: null,
      }
      const later = {
        created_at: "2026-04-15T18:00:00Z",
        snapshot_date: "2026-04-15",
      }
      // 同一天，用 created_at 比
      expect(compareByEffectiveDateAsc(earlier, later)).toBeLessThan(0)
    })
  })

  describe("compareByEffectiveDateDesc", () => {
    test("is reverse of asc", () => {
      const a = { created_at: "2026-01-01T00:00:00Z", snapshot_date: "2026-04-15" }
      const b = { created_at: "2026-01-01T00:00:00Z", snapshot_date: "2026-04-10" }
      expect(compareByEffectiveDateDesc(a, b)).toBeLessThan(0)
      expect(compareByEffectiveDateDesc(b, a)).toBeGreaterThan(0)
    })
  })
})
