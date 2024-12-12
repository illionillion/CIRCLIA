import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { getUserByEmail } from "./data/user"
import { SigninSchema } from "./schema/auth"
import { comparePassword } from "./utils/password"

export default {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ここでUser型を返すように指定
        const { success, data } = SigninSchema.safeParse(credentials)

        if (!success) {
          return null
        }

        const user = await getUserByEmail(data.email)

        if (!user) {
          return null
        }

        const isValidPassword = comparePassword(
          data.password,
          user.password || "",
        )

        if (!isValidPassword) {
          return null
        }

        return user
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email offline_access",
          prompt: "login", // キャッシュ問題を抑制
        },
      },
    }),
  ],
} satisfies NextAuthConfig
