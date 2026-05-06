/**
 * 將模板內容附加到既有備註結尾。
 *
 * - prev 為空字串（或全為空白）→ 直接回傳 content
 * - prev 結尾換行不重複，附加時用單一 \n 分隔
 * - 不修改 content 本身（保留模板內的換行）
 */
export function appendTemplate(prev: string, content: string): string {
  const trimmedPrev = prev.trimEnd()
  if (trimmedPrev === "") return content
  return `${trimmedPrev}\n${content}`
}
