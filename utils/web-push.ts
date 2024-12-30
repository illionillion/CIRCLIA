import webpush from "web-push"

webpush.setVapidDetails(
  "mailto:your-email@example.com", // 連絡先メールアドレス
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || "",
)

export const sendWebPushNotification = async (
  subscription: webpush.PushSubscription,
  payload: Record<string, any>,
) => {
  try {
    // Web Push通知を送信
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    console.log("Web Push通知を送信しました")
  } catch (err) {
    console.error("Web Push通知の送信に失敗しました", err)
  }
}
