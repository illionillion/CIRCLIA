export const sendMail = async (
  accessToken: string,
  recipientEmail: string,
  subject: string,
  content: string,
) => {
  try {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/sendMail",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            subject,
            body: {
              contentType: "HTML",
              content,
            },
            toRecipients: [{ emailAddress: { address: recipientEmail } }],
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("メール送信エラー:", response.status, errorData)
      throw new Error(
        `メール送信に失敗しました。ステータス: ${response.status}`,
      )
    }

    console.log("メール送信成功")
  } catch (error) {
    console.error("メール送信中にエラーが発生しました:", error)
    throw error
  }
}
