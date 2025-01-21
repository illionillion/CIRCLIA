import { z } from "zod"
import { getBase64Image } from "@/utils/file"

// カードのスキーマを定義
export const WelcomeCardSchema = z.object({
  frontTitle: z.string(),
  backTitle: z.string(),
  backDescription: z.string(),
}) //.brand("welcomeCard")

export const FrontWelcomeCardSchema = WelcomeCardSchema.extend({
  frontImage: z
    .custom<FileList>()
    .optional() // 画像ファイルはオプション
    .refine(
      (file) =>
        typeof file === "string" ||
        !file ||
        file.length === 0 ||
        (file.length > 0 && file[0].type.startsWith("image/")),
      {
        message: "画像ファイルを選択してください",
      },
    )
    .transform(async (file) => {
      if (typeof file === "string" || !file || file.length === 0) {
        return null // 画像がない場合はnullを返す
      }
      const selectedFile = file[0]
      return await getBase64Image(selectedFile)
    }),
})

export type WelcomeCard = z.infer<typeof WelcomeCardSchema>

export type FrontWelcomeCard = z.infer<typeof FrontWelcomeCardSchema>
