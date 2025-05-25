import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuid } from "uuid";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_BUCKET_NAME  = process.env.AWS_BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;

const s3Client = new S3Client({
    region: BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
});

interface UploadFile {
    buffer: Buffer | Promise<Buffer>;
    originalname: string;
}

const uploadFile = async (file: UploadFile) => {
    const fileContent = await file.buffer;

    const uploadParams = {
        Bucket: AWS_BUCKET_NAME!,
        Key: `${uuid()}-${file.originalname}`,
        Body: fileContent,
    };

    try {
        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
        });
        const data = await upload.done();
        return data?.Location;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export default uploadFile;
