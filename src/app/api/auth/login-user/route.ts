import prisma from "@/db/prisma";
import { prepareResponse } from "@/helpers/utility";
import { compare, genSalt } from "bcryptjs";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { email, password } = body;
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
			.setExpirationTime('1d')
			.setProtectedHeader({ alg: "HS256" })
			.sign(new TextEncoder().encode("jwtSecret"));
		return prepareResponse({
			code: 200,
			message: "Logged in Successfully",
			data: {
				...findAccount,
				token,
			},
		});
	} catch (error) {
		console.log("POST ~ error:", error);
		return prepareResponse({
			code: 400,
			message: "Something went wrong",
			data: null,
		});
	}
}
