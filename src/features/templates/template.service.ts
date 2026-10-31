import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { templateSchema } from "@/features/templates/template.schema";

export const templateService = {
  list: () => db.template.findMany({ orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
  get: (id: string) => db.template.findUnique({ where: { id } }),
  create: (input: unknown) => {
    const data = templateSchema.parse(input);
    return db.template.create({
      data: {
        ...data,
        contentJson: data.contentJson as Prisma.InputJsonValue | undefined,
      },
    });
  },
  update: (id: string, input: unknown) => {
    const data = templateSchema.partial().parse(input);
    return db.template.update({
      where: { id },
      data: {
        ...data,
        contentJson: (data.contentJson ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  },
  delete: (id: string) => db.template.delete({ where: { id } }),
};
