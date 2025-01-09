import type { User as NextAuthUser } from "next-auth"

declare module "next-auth" {
  interface User extends NextAuthUser {
    studentNumber: string
    instructorFlag: boolean
    profileImageUrl: string | null
    accessToken?: string
  }

  // interface Session extends DefaultSession {
  //   user: User & DefaultSession["user"]
  //   accessToken?: string
  // }
}
