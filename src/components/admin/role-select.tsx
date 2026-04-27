'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateUserRole } from '@/lib/supabase/mutations/user-roles'
import type { UserRole } from '@/lib/supabase/queries/user-roles'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理員',
  premium: '進階會員',
  member: '一般會員',
}

interface RoleSelectProps {
  userId: string
  currentRole: UserRole
  disabled?: boolean
}

export default function RoleSelect({ userId, currentRole, disabled }: RoleSelectProps) {
  const [role, setRole] = useState<UserRole>(currentRole)
  const [loading, setLoading] = useState(false)

  async function handleChange(newRole: UserRole) {
    if (newRole === role) return
    setLoading(true)
    const previousRole = role
    setRole(newRole)

    try {
      await updateUserRole(userId, newRole)
    } catch (error) {
      console.error('Failed to update role:', error)
      setRole(previousRole)
      alert('更新角色失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={role} onValueChange={handleChange} disabled={disabled || loading}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
