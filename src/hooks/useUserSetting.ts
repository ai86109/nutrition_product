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

  const addSetting = useCallback(async (field, value) => {
    if (!value || value?.length === 0) return;

    const currentSettings = getCurrentSettings(field);
    const newSettings = [...currentSettings, value];
    if (JSON.stringify(newSettings) === JSON.stringify(currentSettings)) return;
    
    await updateSetting(field, newSettings);
    await refresh();
  }, [getCurrentSettings, refresh]);

  const deleteSetting = useCallback(async (field, index) => {
    const currentSettings = getCurrentSettings(field);
    if (index < 0 || index >= currentSettings.length) return;

    const newSettings = currentSettings.filter((_, i) => i !== index);
    if (JSON.stringify(newSettings) === JSON.stringify(currentSettings)) return;

    await updateSetting(field, newSettings);
    await refresh();
  }, [getCurrentSettings, refresh]);

  const updateSetting = useCallback(async (field, newSettings) => {
    if (!userId) return alert("此功能請登入後使用");
    if (JSON.stringify(newSettings) === JSON.stringify(getCurrentSettings(field))) return;

    await upsertUserPreferences(userId, { [`${field}_factors`]: newSettings });
    await refresh();
  }, [userId, getCurrentSettings]);

  return {
    addSetting,
    deleteSetting,
    updateSetting
  }
}