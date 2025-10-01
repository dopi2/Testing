import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") || path.startsWith("/user")) {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const payload = verifyAccessToken(token);

      if (path.startsWith("/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (path.startsWith("/user") && payload.role !== "user") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
