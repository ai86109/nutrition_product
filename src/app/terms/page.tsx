import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "服務條款",
  description: "NutriBase 服務條款規範本平台與使用者間之權利義務關係。",
}

const LAST_UPDATED = "2026-05-11"

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">服務條款</CardTitle>
        </CardHeader>
        <CardContent className="text-sm sm:text-base text-gray-700 leading-relaxed">
          <p className="mb-6">
            歡迎使用「NutriBase 營養品查詢計算工具」（以下簡稱「本平台」）。本服務條款（以下簡稱「本條款」）規範您與本平台間之權利義務關係，請您於使用本平台前詳閱本條款。當您開始使用本平台之服務時，即視為您已閱讀、瞭解並同意接受本條款之全部內容。
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                一、服務說明
              </h2>
              <p className="mb-2">
                本平台為協助臨床營養師查詢營養品資料、計算病人每日營養攝取量之輔助工具。主要功能包括：
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>衛生福利部食品藥物管理署「特定疾病配方食品」之資料查詢</li>
                <li>熱量、蛋白質、TDEE 等營養相關計算</li>
                <li>多項產品營養素之比較與 DRIs 換算</li>
                <li>病人營養快照之追蹤與管理</li>
              </ul>
              <p className="mt-3">
                本平台之資料來源為衛生福利部食品藥物管理署公開資料，經本平台自動爬取與彙整。本平台目前免費提供，未來如推出付費訂閱服務，將另行公告計費方式並取得使用者同意。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                二、帳號註冊與使用
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>本平台採 Google 帳號登入；註冊即視為您同意本條款及隱私權政策。</li>
                <li>使用者應自行妥善保管帳號與登入裝置，因帳號被冒用所生之損害由使用者自行負責。</li>
                <li>本平台部分功能（如病人追蹤、許願池）僅開放登入使用者使用。</li>
                <li>本平台得依使用者實際身分（一般使用者、管理員等）開放不同權限之功能。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                三、使用者責任
              </h2>
              <p className="mb-2">使用本平台時，您同意遵守下列規範：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>不得將本平台用於違反中華民國法令、公共秩序或善良風俗之目的。</li>
                <li>不得以自動化程式、爬蟲或其他類似方式大量抓取本平台資料。</li>
                <li>不得對本平台進行逆向工程、破解、攻擊或干擾正常運作。</li>
                <li>不得冒用他人身分、提供不實資料或惡意散布錯誤資訊。</li>
                <li>
                  使用「病人追蹤」功能時，請以代號或匿名標示輸入資料，避免輸入足以直接識別病人之真實姓名或身分證字號；使用者就其所輸入之第三人資料，應自行確認符合所屬機構規範與相關法規（包含個人資料保護法、醫療法等）。
                </li>
                <li>使用「許願池」、「產品回報」等功能提交內容時，不得發表侮辱、攻擊、誹謗或侵害他人權利之言論。</li>
              </ul>
              <p className="mt-3">
                如違反前述規範，本平台得不經通知逕行刪除相關內容、暫停或終止使用者之帳號，並保留依法追訴之權利。
              </p>
            </section>

            <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                四、免責聲明
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium">資料準確性：</span>
                  本平台所呈現之營養成分與產品資料係彙整自衛生福利部食品藥物管理署之公開資料，並透過自動化流程處理。實際營養成分應以產品包裝實際標示為準；本平台無法保證資料絕對即時或與最新核准內容完全一致。
                </li>
                <li>
                  <span className="font-medium">醫療輔助性質：</span>
                  本平台所提供之計算結果（如熱量需求、蛋白質需求、TDEE 估算等）僅供臨床營養師專業判斷之輔助參考，
                  <span className="font-medium">不構成醫療建議、診斷或處方</span>
                  ，亦不取代專業醫療人員之判斷。使用者應就其專業職責，自行對病人之照護決策負責。
                </li>
                <li>
                  <span className="font-medium">服務可用性：</span>
                  本平台得因系統維護、升級或不可抗力因素中斷或暫停服務，本平台對因此造成之任何不便或損害不負賠償責任。
                </li>
                <li>
                  <span className="font-medium">第三方服務：</span>
                  本平台倚賴 Google、Supabase、Vercel 等第三方服務運作；上述服務商所提供服務之穩定性與安全性，非本平台所能完全控制。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                五、智慧財產權
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  本平台之程式碼、介面設計、商標、圖示等智慧財產權均屬本平台所有或經合法授權使用。未經本平台書面同意，使用者不得擅自重製、改作、散布、公開傳輸或為其他商業利用。
                </li>
                <li>
                  本平台所收錄之衛生福利部食品藥物管理署資料，其著作權屬原權利人所有；本平台僅為彙整與呈現之用。
                </li>
                <li>
                  使用者於本平台提交之內容（如許願池留言、產品回報），仍由使用者保有著作權；惟使用者同意本平台得於提供服務之必要範圍內使用、改作、公開傳輸該等內容。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                六、服務之變更、中止與終止
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>本平台得隨時新增、修改、暫停或停止任一服務功能，無須事前通知。</li>
                <li>如使用者違反本條款或相關法令，本平台得逕行暫停或終止其帳號之使用權。</li>
                <li>使用者得隨時停止使用本平台或申請刪除帳號；申請後之資料處理方式詳見隱私權政策。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                七、責任限制
              </h2>
              <p>
                於法律所允許之最大範圍內，本平台對於使用者因使用或無法使用本平台所生之任何直接、間接、附帶、衍生性損害（包括但不限於利潤損失、資料遺失、商譽損害、病人照護決策之結果等）均不負賠償責任。本平台之累計賠償責任，以使用者實際支付予本平台之費用為上限；未支付任何費用者，則以新臺幣壹仟元為上限。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                八、條款修訂
              </h2>
              <p>
                本平台得不時修訂本條款，修訂後之內容將公告於本網站。如有重大變更，將另行以適當方式通知使用者。如使用者於修訂公告後繼續使用本平台，即視為同意修訂後之條款。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                九、準據法與管轄法院
              </h2>
              <p>
                本條款之解釋與適用，以及因本條款所生之爭議，均以中華民國法律為準據法，並以臺灣士林地方法院內湖院區為第一審管轄法院。
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                十、聯絡方式
              </h2>
              <p>
                如您對本條款有任何疑問或建議，歡迎透過本平台「許願池」功能與我們聯絡。
              </p>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
            <span>本條款最後更新日：{LAST_UPDATED}</span>
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
