import { db } from "@/lib/db";
import { medicineSchema, testSchema } from "@/features/catalog/catalog.schema";

export const medicineService = {
  list: () => db.medicine.findMany({ orderBy: { createdAt: "desc" } }),
  create: (input: unknown) => db.medicine.create({ data: medicineSchema.parse(input) }),
  update: (id: string, input: unknown) =>
    db.medicine.update({ where: { id }, data: medicineSchema.partial().parse(input) }),
  delete: (id: string) => db.medicine.delete({ where: { id } }),
};

export const testService = {
  list: () => db.diagnosticTest.findMany({ orderBy: { createdAt: "desc" } }),
  create: (input: unknown) => db.diagnosticTest.create({ data: testSchema.parse(input) }),
  update: (id: string, input: unknown) =>
    db.diagnosticTest.update({ where: { id }, data: testSchema.partial().parse(input) }),
  delete: (id: string) => db.diagnosticTest.delete({ where: { id } }),
};
