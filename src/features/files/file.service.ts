import { db } from "@/lib/db";

export async function listFiles(userId: string) {
  return db.file.findMany({
    where: { uploadedById: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveFile(input: {
  url: string;
  publicId: string;
  fileType: string;
  originalName: string;
  uploadedById: string;
}) {
  return db.file.create({
    data: input,
  });
}
