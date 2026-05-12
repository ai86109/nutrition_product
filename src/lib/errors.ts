/**
 * 達到 cap 上限時 mutation 會 throw 這個 error。
 * Caller 用 `err instanceof CapLimitError` 判斷後直接 toast.error(err.message)。
 *
 * 這是 client-side 檢查（mutation 內部先 count 再 insert），會被刻意繞過 API 的人破壞。
 * 未來若要硬擋，可改成 DB 層 RLS policy 或 RPC function。
 */
export class CapLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CapLimitError"
  }
}
