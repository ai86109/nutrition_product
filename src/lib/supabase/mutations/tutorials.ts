import { createClient } from '@/utils/supabase/client'
import type { Tutorial, TutorialDirection } from '@/types/tutorial'

interface CreateTutorialInput {
  title: string
  description: string
  href: string
  is_published?: boolean
}

/**
 * Admin 新增 tutorial（走 create_tutorial RPC）。
 * RPC 內會自動把 sort_order 設為目前最大值 + 10。
 */
export async function createTutorial(input: CreateTutorialInput): Promise<Tutorial> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('create_tutorial', {
    p_title: input.title.trim(),
    p_description: (input.description ?? '').trim(),
    p_href: input.href.trim(),
    p_is_published: input.is_published ?? true,
  })

  if (error) {
    console.error('Error creating tutorial:', error)
    throw error
  }

  // RPC 回傳 setof / single row，supabase-js 會解成單一物件
  return data as Tutorial
}

interface UpdateTutorialInput {
  id: string
  title: string
  description: string
  href: string
  is_published: boolean
}

/**
 * Admin 更新 tutorial 全欄位（走 update_tutorial RPC）。
 */
export async function updateTutorial(input: UpdateTutorialInput): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('update_tutorial', {
    p_id: input.id,
    p_title: input.title.trim(),
    p_description: (input.description ?? '').trim(),
    p_href: input.href.trim(),
    p_is_published: input.is_published,
  })

  if (error) {
    console.error('Error updating tutorial:', error)
    throw error
  }
}

/**
 * Admin 刪除 tutorial（走 delete_tutorial RPC）。
 */
export async function deleteTutorial(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('delete_tutorial', {
    p_id: id,
  })

  if (error) {
    console.error('Error deleting tutorial:', error)
    throw error
  }
}

/**
 * Admin 上移 / 下移 tutorial（走 swap_tutorial_order RPC）。
 * 已在最頂 / 最底時 RPC 會靜默回傳，不會報錯。
 */
export async function swapTutorialOrder(
  id: string,
  direction: TutorialDirection,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('swap_tutorial_order', {
    p_id: id,
    p_direction: direction,
  })

  if (error) {
    console.error('Error swapping tutorial order:', error)
    throw error
  }
}
