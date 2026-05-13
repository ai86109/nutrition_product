export interface Tutorial {
  id: string
  title: string
  description: string
  href: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

/** 對外公開頁面只需要這幾個欄位。 */
export type PublicTutorial = Pick<Tutorial, 'id' | 'title' | 'description' | 'href'>

export type TutorialDirection = 'up' | 'down'
