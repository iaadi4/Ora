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

    const journal = await prisma.journal.findUnique({
        where: {
            id: params.id,
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
