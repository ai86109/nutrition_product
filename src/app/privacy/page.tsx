import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "NutriBase 隱私權政策說明本平台如何蒐集、處理及利用使用者個人資料。",
}

const LAST_UPDATED = "2026-05-11"

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">隱私權政策</CardTitle>
        </CardHeader>
        <CardContent className="text-sm sm:text-base text-gray-700 leading-relaxed">
          <p className="mb-6">
            歡迎使用「NutriBase 營養品查詢計算工具」（以下簡稱「本平台」）。為了讓您能安心使用本平台之各項服務，特此向您說明本平台之隱私權保護政策，請您詳閱下列內容。
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                一、政策適用範圍
              </h2>
              <p>
                本政策說明本平台在您使用服務時，如何蒐集、處理及利用您所提供之個人資料。本政策不適用於本平台對外連結之第三方網站，亦不適用於非本平台所委託或參與管理之人員。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                二、蒐集的個人資料項目
              </h2>
              <p className="mb-2">本平台會蒐集下列個人資料：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">帳號資料：</span>
                  透過 Google 帳號登入時取得之使用者姓名、電子郵件地址、頭像圖片。
                </li>
                <li>
                  <span className="font-medium">使用者偏好設定：</span>
                  您於本平台設定之計算參數（如熱量係數、蛋白質係數、TDEE 係數）、搜尋歷史、收藏清單與介面偏好。
                </li>
                <li>
                  <span className="font-medium">病人追蹤資料：</span>
                  您於「病人追蹤」功能中輸入之病人代號、生日、性別、生理資訊、疾病史、營養快照與相關備註。
                </li>
                <li>
                  <span className="font-medium">使用者回饋內容：</span>
                  您於「許願池」或「產品回報」功能中提交之文字內容。
                </li>
                <li>
                  <span className="font-medium">技術性資料：</span>
                  瀏覽紀錄、IP 位址、瀏覽器類型、登入時間戳記等系統運作過程中自動產生之資料。
                </li>
              </ul>
              <p className="mt-3 text-gray-500 text-xs sm:text-sm">
                本平台目前不蒐集消費或交易資料；未來如推出付費訂閱服務，將於蒐集前另行告知並取得您的同意。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                三、個人資料之處理與利用目的
              </h2>
              <p className="mb-2">本平台蒐集之個人資料，僅於下列目的範圍內處理及利用：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>提供帳號驗證與登入服務</li>
                <li>儲存並同步您個人化的計算與搜尋設定</li>
                <li>提供病人追蹤功能之資料儲存與檢視</li>
                <li>處理您提交之使用者回饋與產品回報</li>
                <li>維護服務運作、偵測異常及防範濫用</li>
                <li>依法律規定或主管機關要求提供資料</li>
              </ul>
              <p className="mt-3">
                除前述目的外，本平台不會將足以識別您身分之個人資料提供予第三人（包含境內及境外），亦不會作為蒐集目的以外之用途。
              </p>
            </section>

            <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                四、病人資料之特別聲明
              </h2>
              <p className="mb-2">
                本平台之「病人追蹤」功能係供臨床營養師管理工作上之個案資料。使用該功能時請特別注意：
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">建議使用代號或匿名標示，</span>
                  避免輸入足以直接識別病人之真實姓名、身分證字號等資料。
                </li>
                <li>
                  使用者於本平台輸入之病人資料，應符合所屬機構之資料處理規範與相關法規（包含個人資料保護法、醫療法等）。
                </li>
                <li>
                  使用者就其輸入之病人資料負完整管理責任，本平台僅為儲存與運算之工具。
                </li>
                <li>
                  如發現有違反前述原則之資料輸入，本平台保留要求使用者刪除或自行刪除之權利。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                五、資料儲存與安全保護
              </h2>
              <p className="mb-2">
                本平台部署於 Vercel，資料儲存於 Supabase 雲端資料庫，並倚賴上述服務商所提供之業界標準安全機制，包括：
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>全站 HTTPS 加密傳輸</li>
                <li>資料庫靜態加密儲存</li>
                <li>透過 Row Level Security 控制使用者僅能存取自身資料</li>
                <li>定期備份與災難復原機制（由 Supabase 提供）</li>
              </ul>
              <p className="mt-3">
                僅有經授權之人員始能存取後端資料；相關人員均負有保密義務。雖已採取合理之保護措施，但網際網路傳輸無法保證絕對安全，本平台無法對非可歸責於本平台之外部入侵、駭客攻擊或不可抗力事件造成之資料損害承擔責任。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                六、第三方服務
              </h2>
              <p className="mb-2">為提供完整服務，本平台串接下列第三方服務，這些服務商擁有獨立之隱私權政策：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">Google：</span>
                  提供 OAuth 帳號登入；於登入過程取得您之姓名、電子郵件與頭像。
                </li>
                <li>
                  <span className="font-medium">Supabase：</span>
                  提供後端資料庫與身分驗證服務。
                </li>
                <li>
                  <span className="font-medium">Vercel：</span>
                  提供網站代管與內容傳遞服務。
                </li>
              </ul>
              <p className="mt-3">
                當您使用本平台時，部分資料將不可避免地由上述服務商代為處理。建議您一併參閱各服務商之隱私權政策。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                七、Cookie 之使用
              </h2>
              <p className="mb-2">
                本平台會於您的裝置寫入必要之 Cookie，主要用途為：
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>維持您的登入狀態（Supabase Auth 之 session token）</li>
                <li>記憶您的介面偏好設定</li>
              </ul>
              <p className="mt-3">
                您可透過瀏覽器設定拒絕 Cookie 寫入，惟可能導致部分功能（如登入）無法正常使用。各主流瀏覽器（Chrome、Firefox、Safari、Edge）皆於設定中提供 Cookie 管理選項。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                八、使用者之資料權利
              </h2>
              <p className="mb-2">依個人資料保護法第 3 條，您就本平台所蒐集之個人資料享有下列權利：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>查詢或請求閱覽</li>
                <li>請求製給複製本</li>
                <li>請求補充或更正</li>
                <li>請求停止蒐集、處理或利用</li>
                <li>請求刪除</li>
              </ul>
              <p className="mt-3">
                行使上述權利請透過本平台「許願池」功能聯絡我們。為保護您的資料安全，行使部分權利前可能需要驗證您的身分。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                九、資料保留期間
              </h2>
              <p>
                您的個人資料將於本平台運作期間及完成蒐集目的所必要之期間內保留。若您主動刪除帳號或申請註銷，本平台將於 30 日內刪除相關個人資料；但因法律保存義務、爭議處理之必要、或備份系統循環週期之故，部分資料可能於前述期間後仍保留一段合理時間。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                十、對外連結
              </h2>
              <p>
                本平台之網頁可能提供連結至其他網站（例如衛生福利部食品藥物管理署之公開資料來源頁面）。該等連結網站不適用本隱私權政策，請您於使用時參考各該網站之相關政策。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                十一、隱私權政策之修訂
              </h2>
              <p>
                本平台得因應實際需要不時修訂本隱私權政策，修訂後之內容將公告於本網站；如有重大變更，將另行以適當方式通知使用者。建議您定期回到本頁查閱最新版本。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                十二、聯絡方式
              </h2>
              <p>
                如您對本隱私權政策或本平台之個人資料處理有任何疑問或建議，歡迎透過本平台「許願池」功能與我們聯絡。
              </p>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
            <span>本政策最後更新日：{LAST_UPDATED}</span>
            <Link
              href="/"
              className="hover:text-gray-900 hover:underline underline-offset-2"
            >
              ← 返回首頁
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
