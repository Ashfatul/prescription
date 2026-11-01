import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { withErrorHandling } from "@/lib/api-handler";
import { fail, ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { cloudinary, cloudinaryReady } from "@/lib/cloudinary";
import { saveFile } from "@/features/files/file.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return fail("File is required", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let fileUrl: string;
    let publicId: string;

    if (cloudinaryReady()) {
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
      fileUrl = result.secure_url;
      publicId = result.public_id;
    } else {
      // Local static storage fallback for development / offline hospital servers
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.promises.mkdir(uploadDir, { recursive: true });
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const ext = path.extname(sanitizedName) || ".png";
      const uniqueName = `img-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);
      await fs.promises.writeFile(filePath, buffer);

      fileUrl = `/uploads/${uniqueName}`;
      publicId = uniqueName;
    }

    const saved = await saveFile({
      url: fileUrl,
      publicId,
      fileType: file.type || "application/octet-stream",
      originalName: file.name,
      uploadedById: auth.sub,
    });

    return ok(saved, 201);
  });
}
