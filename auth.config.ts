import type { NextAuthConfig} from "next-auth";
import Credentials from "next-auth/providers/credentials"
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
        const { success, data } = SigninSchema.safeParse(credentials)

        if (!success) {
          return null
        }

        const user = await getUserByEmail(data.email)

        if (!user) {
          return null
        }

        const isValidPassword = comparePassword(data.password, user.password)

        if (!isValidPassword) {
          return null
        }

        return user
      },
    }),
  ],
} satisfies NextAuthConfig