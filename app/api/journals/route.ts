import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { HttpStatus } from "@/lib/http-status";
import uploadFile from "@/helper/s3-upload";
import { randomUUID } from "crypto";

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
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
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
            originalname: `${randomUUID}-${file.name}` || "unknown",
        });

        return NextResponse.json({
            success: true,
            message: "Audio uploaded successfully",
            data: {
                audioUrl: s3Url
            }
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