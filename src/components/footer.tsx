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
          {/* TODO: 粉絲專頁建好後把下方 <span> 換成
               <a href="https://www.facebook.com/<page>" target="_blank" rel="noopener noreferrer">
                 Facebook 粉絲專頁
               </a> */}
          <p className="text-gray-400">粉絲專頁：建置中</p>

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
