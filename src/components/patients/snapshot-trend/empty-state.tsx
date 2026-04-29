interface EmptyStateProps {
  label: string
}

/**
 * 該指標所有 snapshot 都沒記錄時顯示的占位
 */
export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
      無 {label} 資料
    </div>
  )
}
