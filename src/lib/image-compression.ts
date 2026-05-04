import imageCompression from 'browser-image-compression'

export interface CompressedImage {
  /** 壓縮後的 blob（image/webp） */
  blob: Blob
  /** 實際輸出寬度（px） */
  width: number
  /** 實際輸出高度（px） */
  height: number
  /** 壓縮後檔案大小（bytes） */
  byteSize: number
}

/**
 * 將使用者選的圖檔壓縮並轉成 WebP。
 *
 * 設定：
 *   - 最大邊 1200 px（夠 lightbox 顯示，又不至於太大）
 *   - 品質 0.8
 *   - 輸出 WebP
 *
 * 注意：browser-image-compression 用 canvas 解碼，
 *   - HEIC 等非標準格式可能無法處理（瀏覽器原生不支援）
 *   - 動畫 GIF 會被攤平成靜態圖
 * 但對營養品圖片這個 use case 來說都不是問題。
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1200,
    initialQuality: 0.8,
    fileType: 'image/webp',
    useWebWorker: true,
  })

  // 取得壓縮後的實際尺寸（browser-image-compression 不直接回傳，自己讀一次）
  const { width, height } = await readImageDimensions(compressed)

  return {
    blob: compressed,
    width,
    height,
    byteSize: compressed.size,
  }
}

function readImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const result = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(result)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

/** 把 byte 數轉成人類可讀的字串，例："187 KB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
