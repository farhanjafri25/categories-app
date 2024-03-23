import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "./lib/auth";

export async function middleware(req: NextRequest) {
	const token = req.cookies.get("token")?.value;
	console.log("middleware ~ token:", token);
	// requested static resources or apis
	// if (req.url.includes("_next/static") || req.url.includes("/api/")) return;
	// if (!token && !req.url.includes("/auth")) {
	// 	console.log("requesting to visit on protected pages");
	// 	return NextResponse.redirect(new URL("/auth/login", req.url));
	// } else if (token && req.url.includes("/auth")) {
	// 	console.log("has token and requesting auth pages");
	// 	return NextResponse.redirect(new URL("/category", req.url));
	// } else {
	// 	return;
	// }
    if (token && !req.nextUrl.pathname.startsWith("/user/category")) {
        return Response.redirect(new URL('/user/category', req.url));
    }
    // if (!token && !req.nextUrl.pathname.startsWith('/user/auth')) {
    //     return Response.redirect(new URL('/auth/login', req.url))
    // }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  }

// export const config = {
// 	matcher: "/auth/:path*",
// };
