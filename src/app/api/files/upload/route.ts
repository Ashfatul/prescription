import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { fail, ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { cloudinary, cloudinaryReady } from "@/lib/cloudinary";
import { saveFile } from "@/features/files/file.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);

    if (!cloudinaryReady()) {
      return fail("Cloudinary credentials are missing", 500);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return fail("File is required", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "ppms",
            resource_type: "auto",
            unique_filename: true,
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error);
              return;
            }
            resolve(uploadResult as { secure_url: string; public_id: string });
          },
        )
        .end(buffer);
    });

    const saved = await saveFile({
      url: result.secure_url,
      publicId: result.public_id,
      fileType: file.type || "application/octet-stream",
      originalName: file.name,
      uploadedById: auth.sub,
    });

    return ok(saved, 201);
  });
}
