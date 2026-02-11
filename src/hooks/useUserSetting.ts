import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { upsertUserPreferences } from "@/lib/supabase/mutations/user-preferences";
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useUserSetting() {
  const { calorieFactors, tdeeFactors, proteinFactors, refresh } = useUserPreferences();
  const { session } = useAuth();
  const { id: userId } = session?.user || {};

  const getCurrentSettings = useCallback((field) => {
    const currentSettings = {
      calorie: calorieFactors,
      tdee: tdeeFactors,
      protein: proteinFactors
    };
    return currentSettings[field] || [];
  }, [calorieFactors, tdeeFactors, proteinFactors]);

  const updateSetting = useCallback(async (field, newSettings) => {
    if (!userId) return alert("此功能請登入後使用");
    if (JSON.stringify(newSettings) === JSON.stringify(getCurrentSettings(field))) return;

    await upsertUserPreferences(userId, { [`${field}_factors`]: newSettings });
    await refresh();
  }, [userId, getCurrentSettings, refresh]);

  return { updateSetting }
}