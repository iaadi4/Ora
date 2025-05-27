import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/next-app/lib/auth";
import { HttpStatus } from "@/next-app/lib/http-status";
import uploadFile from "@/next-app/helper/s3-upload";
import { PrismaClient } from "@/next-app/app/generated/prisma";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers
    });
    if (!session?.user) {
        return NextResponse.json({
            success: false,
            message: "Please login before creating journal",
            error: {
                message: "Unauthorized access"
            }
        },{
            status: HttpStatus.UNAUTHORIZED
        });
    }

    try {
        const userId = session.user.id;

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const journalId = formData.get("journalId") as string;
        
        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No file uploaded",
                error: {
                    message: "Missing file"
                }
            },{
                status: HttpStatus.BAD_REQUEST
            });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const s3Url = await uploadFile({
            buffer: buffer,
            originalname: `${uuidv4()}-${file.name}` || "unknown",
        });

        if(!s3Url) {
            return NextResponse.json({
                success: false,
                message: "Failed to upload entry",
                error: {
                    message: "Failed to upload entry"
                }
            }, {
                status: HttpStatus.INTERNAL_SERVER_ERROR
            })
        }

        const entry = await prisma.entry.create({
            data: {
                userId,
                journalId,
                audioUrl: s3Url
            }
        })

        return NextResponse.json({
            success: true,
            message: "Audio uploaded successfully",
            data: entry
        },{
            status: HttpStatus.CREATED
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to upload file",
            error: error,
        },{
            status: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
}