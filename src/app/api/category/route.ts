import prisma from "@/db/prisma";
import { prepareResponse } from "@/helpers/utility";
import { verifyAuth } from "@/lib/auth";
import { Category } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';

interface ContextInterface {
    params: {};
    searchParams: {
        page: number;
        pageSize: number;
    };
}

const saveCategoryObj = z.object({
    user_id: z.string().min(1),
    category_id: z.string().min(1)
})

export async function GET(req: NextRequest, context: any) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        console.log("GET ~ token:", token);
        if (token) {
            const session = await verifyAuth(token);
            console.log("GET ~ session:", session);
        } else {
            return prepareResponse({
                code: 404,
                message: "Not found",
                data: null
            })
        }
        const page = req.nextUrl.searchParams.get('page');
        const pageSize = req.nextUrl.searchParams.get('pageSize');
		console.log("GET ~ page:", page);
		const result: Category[] = await prisma.category.findMany({
			skip: Number(page) - 1,
			take: Number(pageSize),
		});
		console.log("GET ~ getCategoriesByPagination:", result);
		if (!result) {
			return prepareResponse({
				code: 400,
				message: "Data not found",
				data: null,
			});
		}
		return prepareResponse({
			code: 200,
			message: "OK",
			data: {
				result: result,
				nextPage: result.length >= Number(pageSize) ? Number(page) + 1 : null,
			},
		});
	} catch (error) {
		console.log("GET ~ error:", error);
		return prepareResponse({
			code: 400,
			message: "Something went wrong",
			data: null,
		});
	}
}


export async function POST(req:NextRequest, res: NextResponse) {
    try {
        const body = await req.json();
        const parsedData = saveCategoryObj.parse(body);
        const { user_id, category_id } = parsedData;
        const checkIfValidUser = await prisma.user.findFirst({
            where: {
                user_id: user_id
            }
        });
        if (!checkIfValidUser) {
            return prepareResponse({
                code: 401,
                message: "Not authorised to perform the action",
                data: null
            });
        }
        const checkIfValidCategory = await prisma.category.findFirst({
            where: {
                category_id: category_id
            }
        });
        if (!checkIfValidCategory) {
            return prepareResponse({
                code: 400,
                message: "Invalid Category selected",
                data: null
            })
        }
        const saveUserCategory = await prisma.userCategory.create({
            data: {
                user_id: user_id,
                category_id: category_id,
            }
        });
        console.log("POST ~ saveUserCategory:", saveUserCategory);
        if (!saveUserCategory) {
            return prepareResponse({
                code: 400,
                message: "Error saving category",
                data: null
            })
        }
        return prepareResponse({
            code: 201,
            message: "Category saved successfully",
            data: saveUserCategory
        })
    } catch (error) {
        console.log("POST ~ error:", error);
        if (error instanceof z.ZodError) {
            return prepareResponse({
                code: 400,
                message: "Input validation failed",
                data: null
            })
        }
        return prepareResponse({
            code: 400,
            message: "Something went wrong",
            data: null
        })
    }
}

export async function DELETE(req: NextRequest, res: NextResponse) {
    try {
        const body = await req.json();
        let session;
        const parsedData = saveCategoryObj.parse(body);
        const { user_id, category_id } = parsedData;
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (token) {
            session = await verifyAuth(token);
        } else {
            return prepareResponse({
                code: 401,
                message: 'Not authorised the perform the action',
                data: null
            })
        }
        if (session.user_id !== user_id) {
            return prepareResponse({
                code: 401,
                message: 'Not authorised the perform the action',
                data: null
            })
        }
        const removeUserCategory = await prisma.userCategory.deleteMany({
            where: {
                user_id: {
                    equals: user_id
                },
                category_id: {
                    equals: category_id
                }
            }
        });
        if (!removeUserCategory) {
            return prepareResponse({
                code: 400,
                message: "Error removing category",
                data: null
            })
        }
        return prepareResponse({
            code: 201,
            message: "Removed category successfully",
            data: null
        })
    } catch (error) {
        console.log("DELETE ~ error:", error);
        if (error instanceof z.ZodError) {
            return prepareResponse({
                code: 400,
                message: "Input validation failed",
                data: null
            })
        }
        return prepareResponse({
            code: 400,
            message: 'Something went wrong',
            data: null
        })
    }
}