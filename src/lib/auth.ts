import { jwtVerify } from 'jose';

interface UserJwtPayload {
    user_id: string,
    email: string,
    created_at: string,
    updated_at: string,
    exp: number
}

export async function verifyAuth(token: string) {
    console.log("verifyAuth ~ token:", token);
    try {
        const verified = await jwtVerify(token, new TextEncoder().encode('jwtSecret'));
        console.log({
            verified
        });
        return verified.payload;
    } catch (error) {
        console.log("verifyAuth ~ error:", error);
        throw new Error('Your token has expired');
    }
}
