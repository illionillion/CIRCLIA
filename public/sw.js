console.log("Service Worker Loaded...")

self.addEventListener("push", (event) => {
  console.log("Received a push message", event)

  // デフォルトの通知データ
  const defaultData = {
    title: "CIRCLIA",
    body: "新しい通知があります。",
    icon: "/images/icon.png",
    url: "/notifications", // デフォルト遷移先
  }

  let data
  try {
    data = event.data ? event.data.json() : defaultData // JSONデータをパース
  } catch (err) {
    console.warn("Invalid push data format", err)
    data = defaultData // パース失敗時はデフォルトを使用
  }

  const options = {
    body: data.body,
    icon: data.icon || defaultData.icon,
    data: { url: data.url || defaultData.url }, // クリック時の遷移先URL
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// プッシュ通知のクリック処理
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received", event)

  event.notification.close()

  const url = event.notification.data?.url || "/notifications" // URLがない場合はデフォルト遷移先

  event.waitUntil(
    clients.openWindow(url), // 通知の内容に基づいたページに遷移
  )
})
