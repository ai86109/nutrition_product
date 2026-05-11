import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "NutriBase — 特定疾病配方食品查詢與計算工具";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEAL = "#1d9e75";
const TEAL_LIGHT = "#5dcaa5";
const TEAL_BG = "rgba(29,158,117,0.15)";
const TEAL_BORDER = "rgba(29,158,117,0.4)";
const BLUE = "#378add";
const BLUE_LIGHT = "#85b7eb";
const BLUE_BG = "rgba(55,138,221,0.15)";
const BLUE_BORDER = "rgba(55,138,221,0.4)";
const AMBER_LIGHT = "#ef9f27";
const AMBER_BG = "rgba(186,117,23,0.15)";
const AMBER_BORDER = "rgba(186,117,23,0.4)";
const PURPLE_LIGHT = "#c4a0e8";
const PURPLE_BG = "rgba(141,71,183,0.12)";
const PURPLE_BORDER = "rgba(141,71,183,0.35)";
const CARD_BG = "rgba(15,26,46,0.88)";
const TEXT_PRIMARY = "#f0f6ff";
const TEXT_MUTED = "#7eb8d8";
const BG = "#0f1a2e";

function InfoCard({
  label,
  value,
  sub,
  accent,
  accentBg,
  accentBorder,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: CARD_BG,
        border: `1px solid ${accentBorder}`,
        borderRadius: "12px",
        padding: "20px 24px",
        width: "200px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: "16px",
          color: accent,
          marginBottom: "8px",
          background: accentBg,
          padding: "4px 10px",
          borderRadius: "6px",
          alignSelf: "flex-start",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: "28px",
          fontWeight: 500,
          color: TEXT_PRIMARY,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: "15px",
          color: TEXT_MUTED,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

export default function OGImage() {
  const iconData = readFileSync(join(process.cwd(), "src/app/icon.png"));
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  const badges = [
    { label: "產品搜尋", accent: TEAL_LIGHT, bg: TEAL_BG, border: TEAL_BORDER },
    { label: "攝取量計算", accent: BLUE_LIGHT, bg: BLUE_BG, border: BLUE_BORDER },
    { label: "營養圖表", accent: AMBER_LIGHT, bg: AMBER_BG, border: AMBER_BORDER },
    { label: "衛福部資料", accent: PURPLE_LIGHT, bg: PURPLE_BG, border: PURPLE_BORDER },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: BG,
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景裝飾圓 */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            backgroundColor: TEAL,
            opacity: 0.1,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "35%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            backgroundColor: BLUE,
            opacity: 0.08,
            display: "flex",
          }}
        />

        {/* 左側內容 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "60px 56px",
          }}
        >
          {/* 品牌 logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconSrc}
              width={44}
              height={44}
              alt=""
              style={{ borderRadius: "10px" }}
            />
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                fontWeight: 500,
                color: TEAL_LIGHT,
                letterSpacing: "0.04em",
              }}
            >
              NutriBase
            </div>
          </div>

          {/* 主標題 + 副標題 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                fontSize: "48px",
                fontWeight: 500,
                color: TEXT_PRIMARY,
                lineHeight: 1.25,
                maxWidth: "580px",
              }}
            >
              特定疾病配方食品
              {"\n"}查詢與計算工具
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                color: TEXT_MUTED,
                lineHeight: 1.6,
                maxWidth: "500px",
              }}
            >
              為臨床營養師設計的產品搜尋、熱量與蛋白質需求計算平台
            </div>
          </div>

          {/* 功能 badges */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {badges.map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: b.bg,
                  border: `1px solid ${b.border}`,
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "18px",
                  color: b.accent,
                }}
              >
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* 右側資訊卡片 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
            padding: "60px 56px 60px 0",
          }}
        >
          <InfoCard
            label="TDEE 估算"
            value="1,820 kcal"
            sub="IBW 56 kg · 係數 1.5"
            accent={TEAL_LIGHT}
            accentBg={TEAL_BG}
            accentBorder={TEAL_BORDER}
          />
          <InfoCard
            label="蛋白質需求"
            value="84 g / 天"
            sub="1.5 g × IBW"
            accent={BLUE_LIGHT}
            accentBg={BLUE_BG}
            accentBorder={BLUE_BORDER}
          />
          <InfoCard
            label="選用產品"
            value="亞培 葡勝納"
            sub="250 ml × 4 罐"
            accent={AMBER_LIGHT}
            accentBg={AMBER_BG}
            accentBorder={AMBER_BORDER}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
