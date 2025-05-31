import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { HttpStatus } from "@/lib/http-status";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        })
        const user = session?.user;
        if(!user) {
            return NextResponse.json({
                success: false,
                message: "Please login before creating journal",
                error: {
                    message: "Unauthorized access"
                }
            }, {
                status: HttpStatus.UNAUTHORIZED
            })
        }

        const { title } = await req.json();
        if(!title) {
            return NextResponse.json({
                success: false,
                message: "Title is required for creating journal",
                error: {
                    message: "Missing title"
                }
            }, {
                status: HttpStatus.BAD_REQUEST
            })
        }
        const userId = user.id;
        const journal = await prisma.journal.create({
            data: {
                title,
                userId
            }
        })
        return NextResponse.json({
            success: true,
            message: "Journal created successfully",
            data: journal
        }, {
            status: HttpStatus.CREATED
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Internal Server error",
            error: error
        }, {
            status: HttpStatus.INTERNAL_SERVER_ERROR
        })
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        })
        const user = session?.user;
        if(!user) {
            return NextResponse.json({
                success: false,
                message: "Please login before creating journal",
                error: {
                    message: "Unauthorized access"
                }
            }, {
                status: HttpStatus.UNAUTHORIZED
            })
        }

        const userId = user.id;
        const journals = await prisma.journal.findMany({
            where: {
                userId
            }
        })

        return NextResponse.json({
            success: true,
            message: "Journals fetched",
            data: journals
        }, {
            status: HttpStatus.OK
        })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Internal Server error",
            error: error
        }, {
            status: HttpStatus.INTERNAL_SERVER_ERROR
        })
    }
}