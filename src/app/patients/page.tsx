"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import PatientCard from "@/components/patients/patient-card"
import { useAuth } from "@/contexts/AuthContext"
import { getPatients } from "@/lib/supabase/queries/patients"
import { getAllSnapshotsByUser } from "@/lib/supabase/queries/patient-snapshots"
import { updatePatientSortOrders } from "@/lib/supabase/mutations/patients"
import type { Patient, PatientSnapshot } from "@/types/patient"
import { Skeleton } from "@/components/ui/skeleton"

export default function PatientsPage() {
  const { session, loading: authLoading, isLoggedIn } = useAuth()
  const router = useRouter()

  const [patients, setPatients] = useState<Patient[]>([])
  const [snapshots, setSnapshots] = useState<PatientSnapshot[]>([])
  const [loading, setLoading] = useState(true)

  // 摺疊／展開狀態
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(
    new Set()
  )
  const [expandedSnapshots, setExpandedSnapshots] = useState<Set<string>>(
    new Set()
  )
  const [hasInitDefaults, setHasInitDefaults] = useState(false)

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

  // 把 snapshots 依 patient_id 分組（每位病人內部已是 created_at desc）
  const snapshotsByPatient = useMemo(() => {
    const map: Record<string, PatientSnapshot[]> = {}
    snapshots.forEach((s) => {
      if (!map[s.patient_id]) map[s.patient_id] = []
      map[s.patient_id].push(s)
    })
    return map
  }, [snapshots])

  // 初次載入完成後設定預設展開：最上面病人 + 該病人最新一筆 snapshot
  useEffect(() => {
    if (hasInitDefaults || loading || patients.length === 0) return
    const firstPatient = patients[0]
    const firstSnap = snapshotsByPatient[firstPatient.id]?.[0]
    setExpandedPatients(new Set([firstPatient.id]))
    if (firstSnap) {
      setExpandedSnapshots(new Set([firstSnap.id]))
    }
    setHasInitDefaults(true)
  }, [hasInitDefaults, loading, patients, snapshotsByPatient])

  const togglePatient = useCallback((id: string) => {
    setExpandedPatients((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSnapshot = useCallback((id: string) => {
    setExpandedSnapshots((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const swap = useCallback(
    async (idxA: number, idxB: number) => {
      const a = patients[idxA]
      const b = patients[idxB]
      if (!a || !b) return

      // Optimistic：先在 local state 換位
      const next = [...patients]
      next[idxA] = b
      next[idxB] = a
      setPatients(next)

      try {
        await updatePatientSortOrders([
          { id: a.id, sort_order: b.sort_order },
          { id: b.id, sort_order: a.sort_order },
        ])
        // 成功後 reload 拿到正確的 sort_order（避免 local 與 DB 漂移）
        reload()
      } catch (err) {
        console.error(err)
        alert("更新排序失敗，請稍後再試")
        reload() // 還原
      }
    },
    [patients, reload]
  )

  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    }

    if (!isLoggedIn) {
      return null
    }

    if (patients.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          還沒有任何病人。從首頁點「儲存病人紀錄」可以新增第一位病人。
        </p>
      )
    }

    return (
      <div className="space-y-4">
        {patients.map((p, i) => (
          <PatientCard
            key={p.id}
            patient={p}
            snapshots={snapshotsByPatient[p.id] ?? []}
            isExpanded={expandedPatients.has(p.id)}
            onToggleExpand={() => togglePatient(p.id)}
            expandedSnapshotIds={expandedSnapshots}
            onToggleSnapshot={toggleSnapshot}
            canMoveUp={i > 0}
            canMoveDown={i < patients.length - 1}
            onMoveUp={() => swap(i, i - 1)}
            onMoveDown={() => swap(i, i + 1)}
            onChanged={reload}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">病人追蹤</h1>
        {renderContent()}
      </main>
    </>
  )
}
