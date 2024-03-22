import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from './lib/auth';


export async function middleware(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    console.log(req.nextUrl.pathname);
    const verifiedToken = token && await verifyAuth(token).catch((err) => {
        console.log(err);  
    });
    console.log("middleware ~ verifiedToken:", verifiedToken);
    if (req.nextUrl.pathname.includes('/auth') && !verifiedToken) {
        return;
    }
    const user = verifiedToken;
    if (user) {
        req.cookies.set('user', JSON.stringify(user));
    }
    if (req.url.includes('/login') && verifiedToken) {
        return NextResponse.redirect(new URL('/category', req.url))
    }
    if (!verifiedToken) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }
}