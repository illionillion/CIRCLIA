import { AlbumImageSchema } from "@/schema/album"

export const MAX_BASE64_SIZE = 1

export const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024)
  return +result.toFixed(decimalsNum)
}

export const getBase64Image = async (image: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })

export const handleImageValidation = async (
  currentImages: File[] | string[],
  newFiles: File[],
) => {
  const allFiles = [...currentImages, ...newFiles]
  const result = await AlbumImageSchema.safeParseAsync(allFiles)
  if (result.success) return { valid: result.data, error: null }
  const errorMessage =
    result.error.errors[0]?.message || "不明なエラーが発生しました。"
  return { valid: null, error: errorMessage }
}
