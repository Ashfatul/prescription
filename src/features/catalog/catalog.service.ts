import { db } from "@/lib/db";
import { medicineSchema, testSchema } from "@/features/catalog/catalog.schema";

export const medicineService = {
  list: async (organizationId?: string) => {
    if (organizationId) {
      const clinicCount = await db.medicine.count({ where: { organizationId } });
      if (clinicCount === 0) {
        // Auto clone defaults for this clinic
        await medicineService.cloneDefaultsForOrganization(organizationId);
      }
      return db.medicine.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
      });
    }
    return db.medicine.findMany({ orderBy: { createdAt: "desc" } });
  },

  create: (input: unknown, organizationId?: string) => {
    const data = medicineSchema.parse(input);
    return db.medicine.create({
      data: {
        name: data.name,
        type: data.type,
        dosage: data.dosage,
        instructions: data.instructions,
        organizationId: organizationId || undefined,
      },
    });
  },

  update: (id: string, input: unknown) =>
    db.medicine.update({ where: { id }, data: medicineSchema.partial().parse(input) }),

  delete: (id: string) => db.medicine.delete({ where: { id } }),

  cloneDefaultsForOrganization: async (targetOrgId: string) => {
    const existingCount = await db.medicine.count({ where: { organizationId: targetOrgId } });
    if (existingCount > 0) return;

    let templates = await db.medicine.findMany({
      where: { organizationId: null },
      take: 50,
    });
    if (templates.length === 0) {
      templates = await db.medicine.findMany({
        take: 50,
      });
    }

    if (templates.length > 0) {
      // Create distinct by name
      const seenNames = new Set<string>();
      const toCreate = [];
      for (const t of templates) {
        if (!seenNames.has(t.name)) {
          seenNames.add(t.name);
          toCreate.push({
            name: t.name,
            type: t.type,
            dosage: t.dosage,
            instructions: t.instructions,
            organizationId: targetOrgId,
          });
        }
      }
      if (toCreate.length > 0) {
        await db.medicine.createMany({
          data: toCreate,
        });
      }
    }
  },
};

export const testService = {
  list: async (organizationId?: string) => {
    if (organizationId) {
      const clinicCount = await db.diagnosticTest.count({ where: { organizationId } });
      if (clinicCount === 0) {
        // Auto clone defaults for this clinic
        await testService.cloneDefaultsForOrganization(organizationId);
      }
      return db.diagnosticTest.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
      });
    }
    return db.diagnosticTest.findMany({ orderBy: { createdAt: "desc" } });
  },

  create: (input: unknown, organizationId?: string) => {
    const data = testSchema.parse(input);
    return db.diagnosticTest.create({
      data: {
        name: data.name,
        instructions: data.instructions,
        organizationId: organizationId || undefined,
      },
    });
  },

  update: (id: string, input: unknown) =>
    db.diagnosticTest.update({ where: { id }, data: testSchema.partial().parse(input) }),

  delete: (id: string) => db.diagnosticTest.delete({ where: { id } }),

  cloneDefaultsForOrganization: async (targetOrgId: string) => {
    const existingCount = await db.diagnosticTest.count({ where: { organizationId: targetOrgId } });
    if (existingCount > 0) return;

    let templates = await db.diagnosticTest.findMany({
      where: { organizationId: null },
      take: 40,
    });
    if (templates.length === 0) {
      templates = await db.diagnosticTest.findMany({
        take: 40,
      });
    }

    if (templates.length > 0) {
      const seenNames = new Set<string>();
      const toCreate = [];
      for (const t of templates) {
        if (!seenNames.has(t.name)) {
          seenNames.add(t.name);
          toCreate.push({
            name: t.name,
            instructions: t.instructions,
            organizationId: targetOrgId,
          });
        }
      }
      if (toCreate.length > 0) {
        await db.diagnosticTest.createMany({
          data: toCreate,
        });
      }
    }
  },
};
