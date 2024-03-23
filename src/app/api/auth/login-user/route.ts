import prisma from "@/db/prisma";
import { prepareResponse } from "@/helpers/utility";
import { compare, genSalt } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { z } from "zod";

const loginUserObj = z.object({
	email: z.string().email().min(1),
	password: z.string().min(1),
});

export async function POST(req: NextRequest, res: NextRequest) {
	try {
		const body = await req.json();
		const parsedObj = loginUserObj.parse(body);
		const { email, password } = parsedObj;
		console.log({
			email,
			password,
		});

		const findAccount = await prisma.user.findFirst({
			where: {
				email: email,
			},
		});
		if (!findAccount) {
			return prepareResponse({
				code: 400,
				message: "User not found",
				data: null,
			});
		}
		const isValid = await compare(password, findAccount.password);
		if (!isValid) {
			return prepareResponse({
				code: 400,
				message: "Password do not match",
				data: null,
			});
        }
		const token = await new SignJWT({
			user_id: findAccount.user_id,
			email: findAccount.email,
			created_at: findAccount.created_at,
			updated_at: findAccount.updated_at,
		})
			.setExpirationTime("1d")
			.setProtectedHeader({ alg: "HS256" })
            .sign(new TextEncoder().encode("jwtSecret"));
        const maxAgeSeconds = 24 * 60 * 60;
		// res.cookies.set("token", token);
		return NextResponse.json(
            {
                success: true,
				code: 201,
				message: "Logged in Successfully",
				data: {
                    ...findAccount,
                    password: '',
					token,
				},
			},
			{
				status: 201,
				headers: {
                    "Set-Cookie": `token=${token}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; Secure; SameSite=Strict`,
				},
			}
		);
	} catch (error) {
		console.log("POST ~ error:", error);
		if (error instanceof z.ZodError) {
			return prepareResponse({
				code: 400,
				message: "Input validation failed",
				data: null,
			});
		}
		return prepareResponse({
			code: 400,
			message: "Something went wrong",
			data: null,
		});
	}
}
