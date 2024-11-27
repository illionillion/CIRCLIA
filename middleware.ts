import { NextResponse } from "next/server"
import { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images/).*)", // `images/` を追加
  ],
}

export default middleware((req) => {
  const reqUrl = new URL(req.url)

  console.log("auth", reqUrl.pathname)

  if (!req.auth && reqUrl.pathname !== "/signin") {
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  if (req.auth && reqUrl.pathname === "/signin") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // return NextResponse.next()
})
