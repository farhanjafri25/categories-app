import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { prepareResponse } from "@/helpers/utility";
import { genSalt, hash } from "bcryptjs";
import { generateId } from "@/helpers/unique-id";
import { SignJWT } from "jose";
import { z } from "zod";

const registerUser = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1),
})

export async function POST(req: NextRequest) {
	try {
        const body = await req.json();
        const parsedObj = registerUser.parse(body);
		const { email, password } = parsedObj;
		console.log({
			email,
			password,
		});
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
            .setExpirationTime('1d')
            .setProtectedHeader({ alg: "HS256" })
            .sign(new TextEncoder().encode("jwtSecret"));
        const maxAgeSeconds = 24 * 60 * 60;
		console.log(`----- ~ POST ~ newUserPayload:`, newUserPayload);
		return NextResponse.json(
            {
                success: true,
				code: 201,
				message: "Logged in Successfully",
				data: {
                    ...newUserPayload,
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

export async function GET(req: NextRequest) {
    try {
        const email = req.nextUrl.searchParams.get('email');
        if (!email) {
            return prepareResponse({
                code: 400,
                data: null,
                message: 'Enter an email'
            })
        }
        const findUserWithEmail = await prisma.user.findFirst({
            where: {
                email: String(email)
            }
        });
        if (findUserWithEmail) {
            return prepareResponse({
                code: 400,
                data: null,
                message: "Account with this email already exists"
            })
        }
        return prepareResponse({
            code: 200,
            message: "Success",
            data: null
        })
    } catch (error) {
        console.log("GET ~ error:", error);
        return prepareResponse({
            code: 400,
            message: "Something went wrong",
            data: null
        })
    }
}
