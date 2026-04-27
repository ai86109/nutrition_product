# NutriBase

營養師用的營養品查詢與病人每日攝取量計算工具。資料來源為衛福部「特定疾病配方食品」公開資料，經爬蟲擷取後存入 Supabase。

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (New York style)
- Supabase (Database + Auth with Google OAuth)
- Recharts (圖表)、react-hook-form + zod (表單驗證)
- 部署於 Vercel

## Commands

```bash
pnpm dev          # 開發伺服器 (Turbopack)
pnpm build        # 建置
pnpm lint         # ESLint
pnpm test         # Jest 測試
pnpm test -- --coverage  # 測試覆蓋率
```

## Project Structure

```
src/
├── app/                          # App Router
│   ├── layout.tsx                # Root layout (AuthProvider, UserPreferencesProvider)
│   ├── page.tsx                  # 首頁 (Server Component, 從 Supabase 取得產品)
│   ├── auth/page.tsx             # 登入頁 (Google OAuth)
│   ├── auth/callback/route.ts    # OAuth callback
│   └── api/products/route.ts     # 產品 API (Google Sheets, legacy)
│
├── components/
│   ├── ui/                       # shadcn/ui 元件
│   ├── bio-result/               # 生理資訊結果卡片 (熱量、蛋白質、TDEE)
│   ├── dialogs/                  # 編輯設定的 Dialog (熱量、蛋白質、TDEE)
│   ├── product-calculate/        # 產品計算區 (表格、圖表、餐次設定)
│   │   └── chart/                # 圓餅圖、長條圖、營養表格
│   ├── product-search/           # 產品搜尋區 (搜尋表單、結果表格、歷史紀錄)
│   ├── section/                  # 版面區塊 (main-section 處理 RWD 佈局)
│   ├── navigation.tsx            # 頂部導覽列
│   ├── info-popover.tsx          # 資訊 Popover
│   └── conditional-content.tsx   # 條件式渲染 (會員/非會員)
│
├── contexts/                     # React Context
│   ├── AuthContext.tsx            # 登入狀態、session
│   ├── BioInfoContext.tsx         # 生理資訊表單與計算參數
│   ├── ProductContext.tsx         # 產品清單、品牌選項
│   ├── SearchContext.tsx          # 搜尋狀態與篩選邏輯
│   └── UserPreferencesContext.tsx # 使用者偏好設定 (同步 Supabase)
│
├── hooks/
│   ├── useBioInfoCalculations.ts       # BMI、IBW、PBW、ABW、TDEE、蛋白質計算
│   ├── useProductCalculation.ts        # 產品選擇與數量管理
│   ├── useProductCalculationEvents.ts  # 產品計算事件
│   ├── useNutritionChartData.ts        # 圖表資料轉換
│   ├── useDRIsCalculation.ts           # DRIs 百分比計算
│   ├── useIngredientCalculation.ts     # 成分計算
│   ├── usePagination.ts               # 分頁邏輯
│   ├── useScreenWidth.ts              # 螢幕寬度偵測
│   ├── useLocalStorage.ts             # 通用 localStorage hook
│   ├── useCalorieSettings.ts          # 熱量設定 (localStorage)
│   ├── useProteinSettings.ts          # 蛋白質設定 (localStorage)
│   ├── useTdeeSettings.ts             # TDEE 設定 (localStorage)
│   ├── useHistorySettings.ts          # 歷史紀錄 (localStorage)
│   └── useUserSetting.ts              # 使用者設定存取
│
├── lib/
│   ├── utils.ts                       # cn() (clsx + tailwind-merge)
│   ├── products-server.ts             # getProductFromSupabase(), getProductsFromSheets()
│   ├── product-processor.ts           # formatProductData() - Supabase 資料轉 API 格式
│   ├── google-sheet-api.ts            # Google Sheets API (legacy)
│   ├── sheet-data-processor.ts        # Sheet 資料合併 (legacy)
│   └── supabase/
│       ├── queries/user-preferences.ts    # GET 使用者偏好
│       └── mutations/user-preferences.ts  # UPSERT/UPDATE 使用者偏好
│
├── types/
│   ├── api.ts                    # ApiProductData, ProcessedSpec
│   ├── nutrition.ts              # ProductData, IngredientsData, DRISData
│   ├── contexts.ts               # FormData, SearchState, context types
│   ├── hooks.ts                  # Hook return types
│   └── index.ts                  # Re-exports
│
├── utils/
│   ├── constants.ts              # 單位對應、營養素分組、預設設定值
│   ├── external-links.ts         # 外部連結
│   └── supabase/
│       ├── client.ts             # 瀏覽器端 Supabase client
│       ├── server.ts             # 伺服器端 Supabase client (cookies)
│       └── auth.ts               # signInWithGoogle(), signOut()
│
└── __tests__/                    # Jest 測試 (結構對應 src/)
```

## Conventions

- **路徑別名**: `@/*` → `./src/*`
- **類名合併**: 使用 `cn()` from `@/lib/utils`
- **元件組織**: 依功能分資料夾，shadcn/ui 元件放 `components/ui/`
- **狀態管理**: React Context + custom hooks，無外部狀態庫
- **設定持久化**: 登入使用者存 Supabase，未登入存 localStorage
- **介面語言**: 中文，營養學專有術語（IBW 理想體重、PBW 實際體重、ABW 校正體重、TDEE、DRIs）
- **RWD 佈局**: 手機用 Accordion，桌面用 ResizablePanel（`main-section.tsx`）
- **Server Components**: 首頁為 async Server Component，在伺服器端取得產品資料

## Database

Supabase 資料表：
- `products` - 營養品基本資料，關聯 `product_variants`
- `product_variants` - 營養品規格（劑型、容量、預設用量、營養成分）
- `user_preferences` - 使用者偏好（熱量係數、TDEE 係數、蛋白質係數、搜尋歷史）

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase_anon_key>
SITE_URL=http://localhost:3000
```

## Testing

- Jest 30 + @testing-library/react
- 測試檔案在 `src/__tests__/`，目錄結構對應 `src/`
- 覆蓋率排除：`components/ui/`、layouts、pages、utils
- 執行單一測試：`pnpm test -- <test-file-path>`
