import { NextRequest } from "next/server";
import prisma from "@/db/prisma";
import { prepareResponse } from "@/helpers/utility";
import { genSalt, hash } from "bcryptjs";
import { generateId } from "@/helpers/unique-id";
import { SignJWT } from "jose";
import { z } from "zod";

const registerUser = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1),
    confirmPassword: z.string().min(1)
})

export async function POST(req: NextRequest) {
	try {
        const body = await req.json();
        const parsedObj = registerUser.parse(body);
		const { email, password, confirmPassword } = parsedObj;
		console.log({
			email,
			password,
			confirmPassword,
		});
		if (password !== confirmPassword) {
			return prepareResponse({
				code: 401,
				message: "Passwords do not match",
				data: null,
			});
		}
		const foundAccount = await prisma.user.findFirst({
			where: {
				email: email,
			},
		});
		console.log(`----- ~ POST ~ foundAccount:`, foundAccount);
		if (foundAccount) {
			return prepareResponse({
				code: 403,
				message: "Account already exists!",
				data: null,
			});
		}
		const salt = await genSalt(10);
		const passwordHash = await hash(password, salt);
		const createdAccount = await prisma.user.create({
			data: {
				user_id: generateId(),
				email,
				password: passwordHash,
			},
		});
		console.log(`----- ~ POST ~ createdAccount:`, createdAccount);
		if (!createdAccount) {
			throw new Error("Something went wrong!");
		}

		const newUserPayload = {
			user_id: createdAccount.user_id,
			email: createdAccount.email,
			created_at: createdAccount.created_at,
			updated_at: createdAccount.updated_at,
		};
        const token = await new SignJWT(newUserPayload)
			.setExpirationTime(24 * 60 * 60)
			.sign(new TextEncoder().encode("jwtSecret"));
		console.log(`----- ~ POST ~ newUserPayload:`, newUserPayload);
		return prepareResponse({
			code: 201,
			message: "Account created successfully",
			data: { ...newUserPayload, token },
		});
	} catch (error) {
        console.log(`----- ~ POST ~ error:`, error);
        if (error instanceof z.ZodError) {
            return prepareResponse({
                code: 400,
                message: "Input validation failed",
                data: null
            })
        }
		return prepareResponse({
			code: 500,
			message: "Something went wrong!",
			data: null,
		});
	}
}
