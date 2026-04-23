import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useUserSetting } from '@/hooks/useUserSetting'

export function useFavoriteSettings() {
  const { updateSetting } = useUserSetting()
  const { favorites } = useUserPreferences()

  const addFavorite = (id: string) => {
    if (favorites.includes(id)) return

    const newFavoriteList = [...favorites, id];
    updateSetting('favorite', newFavoriteList);
  }

  const removeFavorite = (id: string) => {
    const newFavoriteList = favorites.filter(item => item !== id);
    updateSetting('favorite', newFavoriteList);
  }

  const isFavorite = (id: string) => favorites.includes(id)

  const toggleFavorite = (id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id)
    } else {
      addFavorite(id)
    }
  }

  return { addFavorite, removeFavorite, isFavorite, toggleFavorite }
}
