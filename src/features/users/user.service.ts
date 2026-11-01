import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, userPreferencesSchema, updateUserSchema } from "@/features/users/user.schema";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function listUsers(organizationId?: string) {
  return db.user.findMany({
    where: organizationId ? { organizationId } : undefined,
    include: { role: true, doctor: true, patient: true, organization: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(input: unknown, creatorUserId?: string) {
  const data = createUserSchema.parse(input);
  const role = await db.role.findUnique({ where: { name: data.role } });
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError("Email already exists", 409);
  }

  // If organizationId not provided, default to the first active organization if available
  let orgId = data.organizationId;
  if (!orgId) {
    const defaultOrg = await db.organization.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });
    if (defaultOrg) orgId = defaultOrg.id;
  }

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      phone: data.phone,
      imageUrl: data.imageUrl,
      signatureUrl: data.signatureUrl,
      roleId: role.id,
      organizationId: orgId,
    },
    include: { role: true, organization: true },
  });

  if (data.role === RoleName.DOCTOR) {
    await db.doctor.create({
      data: {
        userId: user.id,
        specialization: data.specialization || "General Medicine",
        degrees: data.degrees,
        designation: data.designation,
        hospital: data.hospital || user.organization?.name,
        bmdcRegNo: data.bmdcRegNo,
        chamberAddress: data.chamberAddress,
        contactNumber: data.contactNumber || data.phone,
        visitingHours: data.visitingHours,
      },
    });

    await logActivity({
      organizationId: orgId,
      userId: creatorUserId || user.id,
      userName: user.name,
      userRole: "DOCTOR",
      action: "DOCTOR_CREATED",
      entityType: "Doctor",
      entityId: user.id,
      detailsJson: {
        name: user.name,
        specialization: data.specialization || "General Medicine",
        email: user.email,
      },
    });
  }

  if (data.role === RoleName.STAFF) {
    await logActivity({
      organizationId: orgId,
      userId: creatorUserId || user.id,
      userName: user.name,
      userRole: "STAFF",
      action: "STAFF_CREATED",
      entityType: "User",
      entityId: user.id,
      detailsJson: { name: user.name, email: user.email },
    });
  }

  if (data.role === RoleName.PATIENT) {
    await db.patient.create({
      data: {
        userId: user.id,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        medicalHistory: data.medicalHistory,
      },
    });

    await logActivity({
      organizationId: orgId,
      userId: creatorUserId || user.id,
      userName: user.name,
      userRole: "PATIENT",
      action: "PATIENT_REGISTERED",
      entityType: "Patient",
      entityId: user.id,
      detailsJson: { name: user.name, email: user.email, gender: data.gender },
    });
  }

  return db.user.findUnique({
    where: { id: user.id },
    include: { role: true, doctor: true, patient: true, organization: true },
  });
}

export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: { role: true, doctor: true, patient: true, organization: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function updateUser(id: string, input: unknown) {
  const data = updateUserSchema.parse(input);

  const existing = await db.user.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  let roleId = existing.roleId;
  if (data.role) {
    const role = await db.role.findUnique({ where: { name: data.role } });
    if (!role) {
      throw new AppError("Role not found", 404);
    }
    roleId = role.id;
  }

  const updated = await db.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      imageUrl: data.imageUrl,
      signatureUrl: data.signatureUrl !== undefined ? data.signatureUrl : undefined,
      organizationId: data.organizationId !== undefined ? data.organizationId : undefined,
      roleId,
      passwordHash: data.password ? await hashPassword(data.password) : undefined,
    },
    include: { role: true, doctor: true, patient: true, organization: true },
  });

  if (updated.doctor && (data.specialization || data.degrees || data.bmdcRegNo)) {
    await db.doctor.update({
      where: { id: updated.doctor.id },
      data: {
        specialization: data.specialization !== undefined ? data.specialization : updated.doctor.specialization,
        degrees: data.degrees !== undefined ? data.degrees : updated.doctor.degrees,
        bmdcRegNo: data.bmdcRegNo !== undefined ? data.bmdcRegNo : updated.doctor.bmdcRegNo,
        chamberAddress: data.chamberAddress !== undefined ? data.chamberAddress : updated.doctor.chamberAddress,
        visitingHours: data.visitingHours !== undefined ? data.visitingHours : updated.doctor.visitingHours,
      },
    });
  }

  return updated;
}

export async function deleteUser(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: { role: true, doctor: true, patient: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.doctor) {
    const hasPrescriptions = await db.prescription.count({ where: { doctorId: user.doctor.id } });
    if (hasPrescriptions > 0) {
      throw new AppError("Cannot delete physician who has authored active clinical prescriptions.", 400);
    }
    await db.appointment.deleteMany({ where: { doctorId: user.doctor.id } });
    await db.doctor.delete({ where: { id: user.doctor.id } });
  }

  if (user.patient) {
    const hasPrescriptions = await db.prescription.count({ where: { patientId: user.patient.id } });
    if (hasPrescriptions > 0) {
      throw new AppError("Cannot delete patient who has active prescription medical records.", 400);
    }
    await db.appointment.deleteMany({ where: { patientId: user.patient.id } });
    await db.patient.delete({ where: { id: user.patient.id } });
  }

  // Unlink or remove templates created by user
  await db.prescription.updateMany({
    where: { template: { createdById: id } },
    data: { templateId: null },
  });
  await db.template.deleteMany({ where: { createdById: id } });

  // Remove attachments and files uploaded by user
  await db.prescriptionAttachment.deleteMany({
    where: { file: { uploadedById: id } },
  });
  await db.file.deleteMany({ where: { uploadedById: id } });

  await db.user.delete({ where: { id } });
  return { deleted: true };
}

export async function updateUserPreferences(userId: string, input: unknown) {
  const data = userPreferencesSchema.parse(input);
  return db.user.update({
    where: { id: userId },
    data: {
      ...(data.theme ? { theme: data.theme } : {}),
      ...(data.accent ? { accent: data.accent } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      theme: true,
      accent: true,
    },
  });
}
