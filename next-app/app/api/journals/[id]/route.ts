import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { HttpStatus } from "@/lib/http-status";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers
    });
    const user = session?.user;

    if (!user) {
        return NextResponse.json({
            success: false,
            message: "Please login before accessing journal",
            error: {
                message: "Unauthorized access"
            }
        },{
            status: HttpStatus.UNAUTHORIZED
        });
    }

    const { id } = await params;
    const journal = await prisma.journal.findUnique({
        where: {
            id,
            userId: user.id,
        }
    });

    if (!journal) {
        return NextResponse.json({
            success: false,
            message: "Journal not found",
            error: {
                message: "Invalid journal ID or access denied"
            }
        },{
            status: HttpStatus.NOT_FOUND
        });
    }

    return NextResponse.json({
        success: true,
        message: "Journal fetched successfully",
        data: journal,
    },{
        status: HttpStatus.OK
    });
    
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error
        },{
            status: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
}


export async function PUT(req: NextRequest, { params } : { params : { id: string }}) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });
        const user = session?.user;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Please login before accessing journal",
                error: {
                    message: "Unauthorized access"
                }
            },{
                status: HttpStatus.UNAUTHORIZED
            });
        }

        const { id } = await params;
        const { content, title } = await req.json();
        const userId = user.id;

        let journal = await prisma.journal.findFirst({
            where: {
                id,
                userId
            }
        })

        if (!journal) {
            return NextResponse.json({
                success: false,
                message: "Journal not found",
                error: {
                    message: "Invalid journal ID or access denied"
                }
            },{
                status: HttpStatus.NOT_FOUND
            });
        }

        journal = await prisma.journal.update({
            where: {
                id,
                userId
            },
            data: {
                content,
                title
            }
        })

        return NextResponse.json({
            success: true,
            message: "Journal updated successfully",
            data: journal
        }, {
            status: HttpStatus.OK
        })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error
        },{
            status: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string }}) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });
        const user = session?.user;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Please login before accessing journal",
                error: {
                    message: "Unauthorized access"
                }
            },{
                status: HttpStatus.UNAUTHORIZED
            });
        }

        const userId = user.id;
        const { id } = await params;
        const journal = await prisma.journal.findFirst({
            where: {
                id,
                userId
            }
        })

        if(!journal) {
            return NextResponse.json({
                success: false,
                message: "Journal with this id not found",
                error: {
                    message: "Journal doesn't exist"
                }
            })
        }

        await prisma.journal.delete({
            where: {
                id,
                userId
            }
        })

        return NextResponse.json({
            success: true,
            message: "Journal deleted successfully",
            data: {}
        }, {
            status: HttpStatus.OK
        })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error
        },{
            status: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
}