"use client"
import type { FC} from "@yamada-ui/react";
import { Button, useBoolean } from "@yamada-ui/react"
import { saveSubscription } from "@/actions/notification"

export const EnablePushNotificationButton: FC<{ userId: string }> = ({
  userId,
}) => {
  const [isLoading, { on, off }] = useBoolean(false)

  const requestPushNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.error("このブラウザは通知をサポートしていません。")
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      console.warn("通知の許可が得られませんでした。")
      return
    }

    on()

    try {
      const registration = await navigator.serviceWorker.ready // ここで止まる

      const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!applicationServerKey) {
        console.error("VAPID公開鍵が設定されていません。")
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      const { message, success } = await saveSubscription(
        userId,
        subscription.toJSON(),
      )
      if (!success) {
        console.error("プッシュ通知登録中にエラーが発生しました。", message)
        return
      }
      console.log("プッシュ通知登録が完了しました。")
    } catch (error) {
      console.error("プッシュ通知登録中にエラーが発生しました。", error)
    } finally {
      off()
    }
  }

  return (
    <Button
      colorScheme="riverBlue"
      onClick={requestPushNotificationPermission}
      loading={isLoading}
      disabled={isLoading} // ローディング中は無効化
    >
      プッシュ通知を有効にする
    </Button>
  )
}
