"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import PatientFilters from "@/components/patients/patient-filters"
import PatientListItem from "@/components/patients/patient-list-item"
import SnapshotListItem from "@/components/patients/snapshot-list-item"
import PatientInfoPanel from "@/components/patients/patient-info-panel"
import SnapshotDetailPanel from "@/components/patients/snapshot-detail-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { getPatients } from "@/lib/supabase/queries/patients"
import { getAllSnapshotsByUser } from "@/lib/supabase/queries/patient-snapshots"
import { updatePatientSortOrders } from "@/lib/supabase/mutations/patients"
import { getEffectiveDateMs } from "@/lib/snapshot-date"
import type { Patient, PatientSnapshot } from "@/types/patient"
import { Skeleton } from "@/components/ui/skeleton"

type MobileTab = "patients" | "snapshots" | "detail"

export default function PatientsPage() {
  const { session, loading: authLoading, isLoggedIn } = useAuth()
  const router = useRouter()

  const [patients, setPatients] = useState<Patient[]>([])
  const [snapshots, setSnapshots] = useState<PatientSnapshot[]>([])
  const [loading, setLoading] = useState(true)

  // 選取狀態
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null)
  const [hasInitDefaults, setHasInitDefaults] = useState(false)

  // 手機 Tabs 狀態（桌面忽略此 state）
  const [mobileTab, setMobileTab] = useState<MobileTab>("patients")

  // 篩選狀態
  const [nameQuery, setNameQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("") // YYYY-MM-DD
  const [dateTo, setDateTo] = useState("")     // YYYY-MM-DD

  const handleResetFilters = useCallback(() => {
    setNameQuery("")
    setDateFrom("")
    setDateTo("")
  }, [])

  // 未登入導去 /auth
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/auth")
    }
  }, [authLoading, isLoggedIn, router])

  const userId = session?.user?.id

  const reload = useCallback(async () => {
    if (!userId) return
    const [p, s] = await Promise.all([
      getPatients(userId),
      getAllSnapshotsByUser(userId),
    ])
    setPatients(p)
    setSnapshots(s)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, [userId, reload])

  // 把 snapshots 依 patient_id 分組
  const snapshotsByPatient = useMemo(() => {
    const map: Record<string, PatientSnapshot[]> = {}
    snapshots.forEach((s) => {
      if (!map[s.patient_id]) map[s.patient_id] = []
      map[s.patient_id].push(s)
    })
    return map
  }, [snapshots])

  // 套用篩選
  const isFiltered = nameQuery !== "" || dateFrom !== "" || dateTo !== ""

  const filteredPatients = useMemo(() => {
    const trimmedName = nameQuery.trim().toLowerCase()
    const hasDateFilter = dateFrom !== "" || dateTo !== ""
    const fromMs = dateFrom
      ? new Date(`${dateFrom}T00:00:00`).getTime()
      : Number.NEGATIVE_INFINITY
    const toMs = dateTo
      ? new Date(`${dateTo}T23:59:59.999`).getTime()
      : Number.POSITIVE_INFINITY

    return patients.flatMap((p) => {
      if (trimmedName && !p.name.toLowerCase().includes(trimmedName)) {
        return []
      }

      const allSnapshots = snapshotsByPatient[p.id] ?? []

      if (hasDateFilter) {
        const inRange = allSnapshots.filter((s) => {
          const t = getEffectiveDateMs(s)
          return t >= fromMs && t <= toMs
        })
        if (inRange.length === 0) return []
        return [{ patient: p, snapshots: inRange }]
      }

      return [{ patient: p, snapshots: allSnapshots }]
    })
  }, [patients, snapshotsByPatient, nameQuery, dateFrom, dateTo])

  // 初次載入後預設選取第一個病人及其第一筆 snapshot
  useEffect(() => {
    if (hasInitDefaults || loading || patients.length === 0) return
    const firstPatient = patients[0]
    const firstSnap = snapshotsByPatient[firstPatient.id]?.[0]
    setSelectedPatientId(firstPatient.id)
    if (firstSnap) setSelectedSnapshotId(firstSnap.id)
    setHasInitDefaults(true)
  }, [hasInitDefaults, loading, patients, snapshotsByPatient])

  // 切換選取病人時，自動選取該病人第一筆 snapshot
  // 手機上同時跳到「紀錄」分頁（桌面忽略 mobileTab）
  const handleSelectPatient = useCallback(
    (patientId: string, patientSnapshots: PatientSnapshot[]) => {
      setSelectedPatientId(patientId)
      setSelectedSnapshotId(patientSnapshots[0]?.id ?? null)
      setMobileTab("snapshots")
    },
    []
  )

  // 選取 snapshot 時，手機上跳到「詳情」分頁
  const handleSelectSnapshot = useCallback((snapshotId: string) => {
    setSelectedSnapshotId(snapshotId)
    setMobileTab("detail")
  }, [])

  // 當 snapshots 更新後，確保 selectedSnapshotId 仍有效
  useEffect(() => {
    if (!selectedPatientId) return
    const entry = filteredPatients.find((e) => e.patient.id === selectedPatientId)
    const snaps = entry?.snapshots ?? []
    if (snaps.length === 0) {
      setSelectedSnapshotId(null)
      return
    }
    if (!snaps.find((s) => s.id === selectedSnapshotId)) {
      setSelectedSnapshotId(snaps[0].id)
    }
  }, [filteredPatients, selectedPatientId, selectedSnapshotId])

  // 當篩選後選取的病人不在 filteredPatients 中，改選第一個
  useEffect(() => {
    if (filteredPatients.length === 0) {
      setSelectedPatientId(null)
      setSelectedSnapshotId(null)
      return
    }
    const stillInList = filteredPatients.find(
      (e) => e.patient.id === selectedPatientId
    )
    if (!stillInList) {
      const first = filteredPatients[0]
      setSelectedPatientId(first.patient.id)
      setSelectedSnapshotId(first.snapshots[0]?.id ?? null)
    }
  }, [filteredPatients, selectedPatientId])

  const swap = useCallback(
    async (idxA: number, idxB: number) => {
      const a = patients[idxA]
      const b = patients[idxB]
      if (!a || !b) return

      const next = [...patients]
      next[idxA] = b
      next[idxB] = a
      setPatients(next)

      try {
        await updatePatientSortOrders([
          { id: a.id, sort_order: b.sort_order },
          { id: b.id, sort_order: a.sort_order },
        ])
        reload()
      } catch (err) {
        console.error(err)
        alert("更新排序失敗，請稍後再試")
        reload()
      }
    },
    [patients, reload]
  )

  // 目前選取的病人資料
  const selectedEntry = filteredPatients.find(
    (e) => e.patient.id === selectedPatientId
  )
  const selectedPatient: Patient | null = selectedEntry?.patient ?? null
  const selectedPatientSnapshots: PatientSnapshot[] =
    selectedEntry?.snapshots ?? []
  const selectedSnapshot: PatientSnapshot | null =
    selectedPatientSnapshots.find((s) => s.id === selectedSnapshotId) ?? null

  if (authLoading || loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">病人追蹤</h1>
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        </main>
      </>
    )
  }

  if (!isLoggedIn) return null

  if (patients.length === 0) {
    return (
      <>
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">病人追蹤</h1>
          <p className="text-sm text-muted-foreground">
            還沒有任何病人。從首頁點「儲存病人紀錄」可以新增第一位病人。
          </p>
        </main>
      </>
    )
  }

  // 共用：病人列表（給桌面與手機 Tabs 共用）
  const patientListContent = (
    <>
      {filteredPatients.map(({ patient: p, snapshots: ss }) => {
        const fullIdx = patients.findIndex((x) => x.id === p.id)
        return (
          <PatientListItem
            key={p.id}
            patient={p}
            snapshotCount={ss.length}
            isSelected={p.id === selectedPatientId}
            canMoveUp={!isFiltered && fullIdx > 0}
            canMoveDown={!isFiltered && fullIdx < patients.length - 1}
            onSelect={() => handleSelectPatient(p.id, ss)}
            onMoveUp={() => swap(fullIdx, fullIdx - 1)}
            onMoveDown={() => swap(fullIdx, fullIdx + 1)}
            onChanged={reload}
          />
        )
      })}
    </>
  )

  const snapshotListContent =
    selectedPatientSnapshots.length === 0 ? (
      <p className="px-3 py-3 text-xs text-muted-foreground">尚無紀錄</p>
    ) : (
      selectedPatientSnapshots.map((s) => (
        <SnapshotListItem
          key={s.id}
          snapshot={s}
          isSelected={s.id === selectedSnapshotId}
          onSelect={() => handleSelectSnapshot(s.id)}
          onChanged={reload}
        />
      ))
    )

  const detailContent = (
    <>
      {selectedPatient && (
        <PatientInfoPanel
          patient={selectedPatient}
          snapshots={selectedPatientSnapshots}
          onChanged={reload}
          onViewRecord={(id) => setSelectedSnapshotId(id)}
        />
      )}
      {selectedSnapshot && selectedPatient ? (
        <SnapshotDetailPanel
          snapshot={selectedSnapshot}
          patient={selectedPatient}
          onChanged={reload}
        />
      ) : (
        selectedPatient && (
          <div className="flex-1 flex items-center justify-center rounded-lg border bg-muted/20 min-h-[200px]">
            <p className="text-sm text-muted-foreground">
              請從「紀錄」選擇一筆紀錄
            </p>
          </div>
        )
      )}
    </>
  )

  return (
    <>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4 md:h-[calc(100vh-64px)]">
        <h1 className="text-2xl font-bold shrink-0">病人追蹤</h1>

        {/* 篩選列 */}
        <PatientFilters
          nameQuery={nameQuery}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onNameQueryChange={setNameQuery}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onReset={handleResetFilters}
        />

        {filteredPatients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            沒有符合條件的病人
          </p>
        ) : (
          <>
            {/* 桌面：左右兩欄 */}
            <div className="hidden md:flex gap-3 flex-1 min-h-0">
              {/* 左側：病人列表 + snapshot 列表 */}
              <div className="flex w-[380px] shrink-0 rounded-lg border overflow-hidden">
                {/* 左1：病人列表 */}
                <div className="flex-1 flex flex-col border-r min-w-0">
                  <div className="px-3 py-2 border-b text-xs font-semibold text-muted-foreground bg-muted/40 shrink-0">
                    病人
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {patientListContent}
                  </div>
                </div>

                {/* 左2：snapshot 列表 */}
                <div className="w-[148px] shrink-0 flex flex-col">
                  <div className="px-3 py-2 border-b text-xs font-semibold text-muted-foreground bg-muted/40 shrink-0">
                    紀錄
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {snapshotListContent}
                  </div>
                </div>
              </div>

              {/* 右側：病人資訊 + snapshot 詳情 */}
              <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
                {detailContent}
              </div>
            </div>

            {/* 手機：Tabs */}
            <Tabs
              value={mobileTab}
              onValueChange={(v) => setMobileTab(v as MobileTab)}
              className="md:hidden flex flex-col flex-1 min-h-0 gap-3"
            >
              <TabsList className="grid w-full grid-cols-3 h-10">
                <TabsTrigger value="patients">病人</TabsTrigger>
                <TabsTrigger
                  value="snapshots"
                  disabled={!selectedPatient}
                >
                  紀錄
                </TabsTrigger>
                <TabsTrigger
                  value="detail"
                  disabled={!selectedPatient}
                >
                  詳情
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="patients"
                className="rounded-lg border overflow-y-auto"
              >
                {patientListContent}
              </TabsContent>

              <TabsContent
                value="snapshots"
                className="rounded-lg border overflow-y-auto"
              >
                {snapshotListContent}
              </TabsContent>

              <TabsContent
                value="detail"
                className="flex flex-col gap-3 overflow-y-auto"
              >
                {detailContent}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </>
  )
}
