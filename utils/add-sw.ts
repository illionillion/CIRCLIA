"use client"

import { useSafeLayoutEffect } from "@yamada-ui/react"

export const ServiceWorkerRegister = () => {
  useSafeLayoutEffect(() => {
    // サービスワーカーがサポートされているか確認
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker 登録成功:", registration)
        })
        .catch((error) => {
          console.error("Service Worker 登録失敗:", error)
        })
    } else {
      console.error("このブラウザはService Workerをサポートしていません")
    }
  }, [])

  return null
}
