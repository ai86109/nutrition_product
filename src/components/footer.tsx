import Link from "next/link"
import { getProductsLastSyncedAt } from "@/lib/products-server"
import FooterContactLink from "@/components/footer-contact-link"

const FDA_SOURCE_URL =
  "https://consumer.fda.gov.tw/Food/SpecialFood.aspx?nodeID=163"

function formatSyncDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export default async function Footer() {
  const lastSyncedAt = await getProductsLastSyncedAt()
  const lastSyncedDate = formatSyncDate(lastSyncedAt)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-8 border-t bg-white text-gray-600">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-4 text-xs sm:text-sm">
        {/* 資料來源 + 免責聲明 */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p>
            <span className="font-medium text-gray-700">資料來源：</span>
            <a
              href={FDA_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gray-900"
            >
              衛生福利部食品藥物管理署「特定疾病配方食品」
            </a>
            {lastSyncedDate && (
              <span className="ml-2 text-gray-500">
                （資料最後同步：{lastSyncedDate}）
              </span>
            )}
          </p>
          <p className="text-gray-500">
            營養成分請以產品包裝實際標示為準，本站資料可能與最新核准內容存在差異。
          </p>
          <p className="text-gray-500">
            本工具僅供臨床營養師參考使用，不可取代專業醫療判斷；使用者應自行對病人照護決策負責。
          </p>
          <p>© {year} NutriBase．版權所有</p>
        </div>

        {/* 連結列 */}
        <div className="flex flex-col gap-3 border-t pt-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="https://www.threads.com/@nutribase.nutrient.calculate_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NutriBase 的 Threads"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M17.19 11.12c-.09-.04-.18-.08-.27-.12-.16-2.93-1.76-4.6-4.45-4.62h-.04c-1.61 0-2.95.69-3.78 1.94l1.48 1.02c.61-.93 1.58-1.13 2.3-1.13h.03c.9.01 1.58.27 2.02.78.32.37.54.88.65 1.52-.81-.14-1.69-.18-2.62-.13-2.63.15-4.33 1.69-4.21 3.82.06 1.08.6 2.01 1.52 2.62.78.52 1.78.77 2.83.72 1.38-.08 2.46-.6 3.21-1.57.57-.73.94-1.68 1.1-2.87.66.4 1.15.93 1.42 1.56.46 1.08.49 2.85-.95 4.28-1.26 1.26-2.78 1.81-5.07 1.82-2.54-.02-4.46-.83-5.71-2.42-1.17-1.49-1.78-3.64-1.8-6.4.02-2.76.63-4.91 1.8-6.4 1.25-1.59 3.17-2.4 5.71-2.42 2.56.02 4.51.84 5.8 2.43.63.79 1.11 1.78 1.42 2.94l1.74-.46c-.38-1.43-.98-2.66-1.78-3.67C16.96 1.46 14.55.43 11.45.41h-.01c-3.1.02-5.48 1.05-7.08 3.07C2.93 5.27 2.2 7.78 2.18 10.99v.02c.02 3.21.75 5.72 2.18 7.51 1.6 2.02 3.98 3.05 7.08 3.07h.01c2.75-.02 4.69-.74 6.29-2.34 2.1-2.09 2.03-4.71 1.34-6.32-.49-1.16-1.43-2.1-2.72-2.72zm-4.62 3.85c-1.16.07-2.36-.45-2.42-1.55-.04-.81.58-1.72 2.49-1.83.22-.01.43-.02.64-.02.69 0 1.34.07 1.93.2-.22 2.78-1.52 3.13-2.64 3.2z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/nutribase.nutrient.calculate_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NutriBase 的 Instagram"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.87 5.87 0 0 0-2.13 1.38A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13.67.65 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.13-1.38 5.87 5.87 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.13A5.87 5.87 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
              </svg>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/privacy"
              className="hover:text-gray-900 hover:underline underline-offset-2"
            >
              隱私權政策
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-900 hover:underline underline-offset-2"
            >
              服務條款
            </Link>
            <FooterContactLink />
          </div>
        </div>
      </div>
    </footer>
  )
}
