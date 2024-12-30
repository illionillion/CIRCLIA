"use client"
import type { FC } from "@yamada-ui/react"
import { Button, useBoolean, useSafeLayoutEffect } from "@yamada-ui/react"
import { saveSubscription } from "@/actions/notification"

export const EnablePushNotificationButton: FC<{ userId: string }> = ({
  userId,
}) => {
  const [isLoading, { on: start, off: end }] = useBoolean(false)
  const [isSubscribed, { on, off }] = useBoolean(false) // サブスクリプション状態管理

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        on() // サブスクリプションが存在する場合は登録済みとする
      } else {
        off()
      }
    } catch (error) {
      console.error(
        "サブスクリプション状態の確認中にエラーが発生しました:",
        error,
      )
    }
  }

  useSafeLayoutEffect(() => {
    checkSubscription()
  }, [])

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

    start()

    try {
      const registration = await navigator.serviceWorker.ready

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
      on()
    } catch (error) {
      console.error("プッシュ通知登録中にエラーが発生しました。", error)
    } finally {
      end()
    }
  }

  const unsubscribePushNotification = async () => {
    if (!("serviceWorker" in navigator)) return

    start()

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        console.log("サブスクリプションの解除に成功しました。")
        off()
      } else {
        console.warn("解除可能なサブスクリプションが存在しません。")
      }
    } catch (error) {
      console.error("サブスクリプションの解除中にエラーが発生しました:", error)
    } finally {
      end()
    }
  }

  return (
    <Button
      colorScheme={isSubscribed ? "red" : "riverBlue"}
      onClick={
        isSubscribed
          ? unsubscribePushNotification
          : requestPushNotificationPermission
      }
      loading={isLoading}
      disabled={isLoading} // ローディング中は無効化
    >
      {isSubscribed ? "プッシュ通知を無効にする" : "プッシュ通知を有効にする"}
    </Button>
  )
}
