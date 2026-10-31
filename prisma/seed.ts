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

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      gender: "Female",
      medicalHistory: "Mild seasonal allergy",
    },
  });

  const doctorsData = [
    {
      name: "Dr. Fahim Rahman",
      email: "doctor@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      specialization: "General Medicine",
      available: true,
      schedule: {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        startTime: "09:00 AM",
        endTime: "01:00 PM",
        chamber: "Room 301",
      },
    },
    {
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      specialization: "Cardiology",
      available: true,
      schedule: {
        days: ["Monday", "Wednesday", "Friday"],
        startTime: "10:00 AM",
        endTime: "02:00 PM",
        chamber: "Cardio Suite 204",
      },
    },
    {
      name: "Dr. Tariq Al-Mansoor",
      email: "tariq.mansoor@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&q=80",
      specialization: "Pediatrics & Child Health",
      available: true,
      schedule: {
        days: ["Sunday", "Tuesday", "Thursday"],
        startTime: "04:00 PM",
        endTime: "08:00 PM",
        chamber: "Pediatric Wing 102",
      },
    },
    {
      name: "Dr. Ayesha Siddiqua",
      email: "ayesha.siddiqua@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1594824813637-2309e53b6ee9?auto=format&fit=crop&w=400&q=80",
      specialization: "Dermatology",
      available: true,
      schedule: {
        days: ["Saturday", "Monday", "Wednesday"],
        startTime: "02:00 PM",
        endTime: "06:00 PM",
        chamber: "Skin Clinic 405",
      },
    },
    {
      name: "Dr. Marcus Vance",
      email: "marcus.vance@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
      specialization: "Orthopedics & Trauma",
      available: false,
      schedule: {
        days: ["Sunday", "Monday", "Wednesday", "Thursday"],
        startTime: "11:00 AM",
        endTime: "03:00 PM",
        chamber: "Orthopedic Center 512",
      },
    },
    {
      name: "Dr. Nusrat Parvin",
      email: "nusrat.parvin@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80",
      specialization: "Gynecology & Obstetrics",
      available: true,
      schedule: {
        days: ["Sunday", "Tuesday", "Wednesday", "Thursday"],
        startTime: "05:00 PM",
        endTime: "09:00 PM",
        chamber: "Women's Health 208",
      },
    },
  ];

  const now = new Date();
  const todayAtTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);

  for (let i = 0; i < doctorsData.length; i++) {
    const item = doctorsData[i];

    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        imageUrl: item.imageUrl,
      },
      create: {
        name: item.name,
        email: item.email,
        passwordHash,
        roleId: roleByName.DOCTOR,
        imageUrl: item.imageUrl,
      },
    });

    const doc = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        specialization: item.specialization,
        scheduleJson: item.schedule,
        available: item.available,
      },
      create: {
        userId: user.id,
        specialization: item.specialization,
        scheduleJson: item.schedule,
        available: item.available,
      },
    });

    if (item.available) {
      await prisma.appointment.upsert({
        where: {
          doctorId_appointmentDate_serialNumber: {
            doctorId: doc.id,
            appointmentDate: todayAtTen,
            serialNumber: i + 1,
          },
        },
        update: {},
        create: {
          doctorId: doc.id,
          patientId: patient.id,
          appointmentDate: todayAtTen,
          serialNumber: i + 1,
          status: AppointmentStatus.BOOKED,
          notes: "Initial consultation",
        },
      });
    }
  }

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

  console.log("Seed completed successfully with 6 doctors.");
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
