import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { upsertUserPreferences } from "@/lib/supabase/mutations/user-preferences";
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

type SettingField = 'calorie' | 'tdee' | 'protein' | 'history' | 'favorite';

const FIELD_TO_COLUMN: Record<SettingField, string> = {
  calorie: 'calorie_factors',
  tdee: 'tdee_factors',
  protein: 'protein_factors',
  history: 'search_history',
  favorite: 'favorites',
}

export function useUserSetting() {
  const { calorieFactors, tdeeFactors, proteinFactors, history, favorites, refresh } = useUserPreferences();
  const { session } = useAuth();
  const { id: userId } = session?.user || {};

  const getCurrentSettings = useCallback((field: SettingField) => {
    const currentSettings = {
      calorie: calorieFactors,
      tdee: tdeeFactors,
      protein: proteinFactors,
      history,
      favorite: favorites,
    };
    return currentSettings[field] || [];
  }, [calorieFactors, tdeeFactors, proteinFactors, history, favorites]);

  const updateSetting = useCallback(async (field: SettingField, newSettings: unknown) => {
    if (!userId) return alert("此功能請登入後使用");
    if (JSON.stringify(newSettings) === JSON.stringify(getCurrentSettings(field))) return;

    const columnName = FIELD_TO_COLUMN[field];
    await upsertUserPreferences(userId, { [columnName]: newSettings });
    await refresh();
  }, [userId, getCurrentSettings, refresh]);

  return { updateSetting }
}
