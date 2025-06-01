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
        });
        const user = session?.user;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Please login to view journals",
                error: {
                    message: "Unauthorized access"
                }
            }, {
                status: HttpStatus.UNAUTHORIZED
            });
        }

        const { searchParams } = new URL(req.url);
        const top = searchParams.get("top");

        const userId = user.id;

        if (top === "true") {
            const topJournals = await prisma.journal.findMany({
                where: {
                    userId
                },
                include: {
                    entries: true
                }
            });

            const sorted = topJournals
                .map(j => ({ ...j, entryCount: j.entries.length }))
                .sort((a, b) => b.entryCount - a.entryCount)
                .slice(0, 3)
                .map(journal => {
                    const { ...rest } = journal;
                    return rest;
                });
            
            return NextResponse.json({
                success: true,
                message: "Top 3 journals fetched",
                data: sorted
            }, {
                status: HttpStatus.OK
            });
        }

        const journals = await prisma.journal.findMany({
            where: {
                userId
            }
        });

        return NextResponse.json({
            success: true,
            message: "Journals fetched",
            data: journals
        }, {
            status: HttpStatus.OK
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error
        }, {
            status: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
}
