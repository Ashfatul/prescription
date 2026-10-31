import { AppointmentStatus, PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roleRecords = await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const roleByName = Object.fromEntries(roleRecords.map((r) => [r.name, r.id]));

  const passwordHash = await bcrypt.hash("Pass1234!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ppms.local" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@ppms.local",
      passwordHash,
      roleId: roleByName.SUPER_ADMIN,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor@ppms.local" },
    update: {},
    create: {
      name: "Dr. Fahim Rahman",
      email: "doctor@ppms.local",
      passwordHash,
      roleId: roleByName.DOCTOR,
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "patient@ppms.local" },
    update: {},
    create: {
      name: "Nusrat Jahan",
      email: "patient@ppms.local",
      passwordHash,
      roleId: roleByName.PATIENT,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@ppms.local" },
    update: {},
    create: {
      name: "Front Desk Staff",
      email: "staff@ppms.local",
      passwordHash,
      roleId: roleByName.STAFF,
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialization: "Medicine",
      scheduleJson: {
        sundayToThursday: "10:00 AM - 2:00 PM",
      },
      available: true,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      gender: "Female",
      medicalHistory: "Mild seasonal allergy",
    },
  });

  const now = new Date();
  const todayAtTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);

  await prisma.appointment.upsert({
    where: {
      doctorId_appointmentDate_serialNumber: {
        doctorId: doctor.id,
        appointmentDate: todayAtTen,
        serialNumber: 1,
      },
    },
    update: {},
    create: {
      doctorId: doctor.id,
      patientId: patient.id,
      appointmentDate: todayAtTen,
      serialNumber: 1,
      status: AppointmentStatus.BOOKED,
      notes: "Follow-up visit",
    },
  });

  await prisma.medicine.createMany({
    data: [
      {
        name: "Napa",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet after meal, twice daily",
      },
      {
        name: "Monas",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet at night",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.diagnosticTest.createMany({
    data: [
      {
        name: "CBC",
        instructions: "Morning sample preferred",
      },
      {
        name: "X-Ray Chest",
        instructions: "Carry previous reports",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed.");
  console.log("Admin login: admin@ppms.local / Pass1234!");
  console.log("Doctor login: doctor@ppms.local / Pass1234!");
  console.log("Patient login: patient@ppms.local / Pass1234!");
  console.log("Staff login: staff@ppms.local / Pass1234!");

  await prisma.template.upsert({
    where: { id: "default-template" },
    update: {},
    create: {
      id: "default-template",
      name: "Default Prescription",
      createdById: admin.id,
      contentJson: {
        header: "PPMS Standard Template",
      },
    },
  });

  void staffUser;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
