import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "@/lib/http-status";
import { auth } from "@/lib/auth";
import PDFDocument from 'pdfkit';

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        })
        if(!session?.user) {
            return NextResponse.json({
                success: false,
                message: "Please login before exporting pdf",
                error: {
                    message: "Unauthorized access"
                }
            }, {
                status: HttpStatus.UNAUTHORIZED
            })
        }

        const body = await req.json();
        const text = body.text || 'No content provided';

        const doc = new PDFDocument();
        const chunks: Uint8Array[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        const pdfPromise = new Promise<Buffer>((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });

        doc.font('Times-Roman')
           .fontSize(12)
           .text(text, {
             width: 410,
             align: 'left',
           });

        doc.end();

        const pdfBuffer = await pdfPromise;

        return new NextResponse(pdfBuffer, {
            status: HttpStatus.OK,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=journal.pdf'
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
            error: error
        }, {
            status: HttpStatus.INTERNAL_SERVER_ERROR
        })
    }
}