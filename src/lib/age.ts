/**
 * 由生日計算在指定日期的歲數。
 *
 * @param birthday     'YYYY-MM-DD' 格式的生日字串
 * @param referenceDate 'YYYY-MM-DD' 格式的基準日（預設為今天）
 * @returns 整數歲數，若輸入無效則回傳 null
 */
export function calculateAgeAt(
  birthday: string | null | undefined,
  referenceDate?: string
): number | null {
  if (!birthday) return null

  const birth = new Date(birthday)
  if (isNaN(birth.getTime())) return null

  const ref = referenceDate ? new Date(referenceDate) : new Date()
  if (isNaN(ref.getTime())) return null

  let age = ref.getFullYear() - birth.getFullYear()
  const monthDiff = ref.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

/**
 * 格式化生日顯示（YYYY-MM-DD → YYYY/MM/DD）
 */
export function formatBirthday(birthday: string | null | undefined): string {
  if (!birthday) return "—"
  return birthday.replace(/-/g, "/")
}
