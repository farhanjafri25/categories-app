import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "./lib/auth";

export async function middleware(req: NextRequest) {
	const token = req.cookies.get("token")?.value;
    if (token && !req.nextUrl.pathname.startsWith("/user/category")) {
        return Response.redirect(new URL('/user/category', req.url));
    }
    if (!token && !req.nextUrl.pathname.startsWith('/user/auth')) {
        return Response.redirect(new URL('/user/auth/login', req.url))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  }