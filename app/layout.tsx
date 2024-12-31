import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getUserById } from "@/actions/user/user"
import { auth } from "@/auth"
import { AppLayout } from "@/components/layouts/app-layout"
import { AppProvider } from "@/provider"
import { ServiceWorkerRegister } from "@/utils/add-sw"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CIRCLIA",
  description: "CIRCLIA",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  themeColor: "#ffffff", // テーマカラー
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  const user = await getUserById(session?.user?.id || "")
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ServiceWorkerRegister />
        <AppProvider>
          <AppLayout user={user}>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  )
}
