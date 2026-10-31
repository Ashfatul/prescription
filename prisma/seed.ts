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
      degrees: "MBBS, FCPS (Medicine), MACP (USA)",
      designation: "Senior Consultant, Department of Medicine",
      hospital: "Metropolitan Specialized Hospital",
      bmdcRegNo: "BMDC-A-41285",
      chamberAddress: "Room 301, 3rd Floor, Diagnostic & Consultation Block",
      contactNumber: "+880 1711-234567",
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
      degrees: "MBBS, MD (Cardiology), FACC (USA)",
      designation: "Associate Professor & Interventional Cardiologist",
      hospital: "National Heart & Vascular Institute",
      bmdcRegNo: "BMDC-A-32918",
      chamberAddress: "Cardio Suite 204, 2nd Floor",
      contactNumber: "+880 1819-345678",
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
      degrees: "MBBS, DCH, FCPS (Pediatrics)",
      designation: "Consultant Pediatrician",
      hospital: "Green Valley Children & Mother Hospital",
      bmdcRegNo: "BMDC-A-54012",
      chamberAddress: "Pediatric Wing 102, Ground Floor",
      contactNumber: "+880 1912-456789",
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
      degrees: "MBBS, DDV, FCPS (Dermatology)",
      designation: "Assistant Professor & Dermatologist",
      hospital: "Skin & Laser Center, Care Hospital",
      bmdcRegNo: "BMDC-A-62874",
      chamberAddress: "Skin Clinic 405, 4th Floor",
      contactNumber: "+880 1613-567890",
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
      degrees: "MBBS, MS (Orthopedics), AO Trauma Fellow",
      designation: "Senior Orthopedic & Joint Surgeon",
      hospital: "Apex Orthopedic & Trauma Hospital",
      bmdcRegNo: "BMDC-A-29401",
      chamberAddress: "Orthopedic Center 512, 5th Floor",
      contactNumber: "+880 1514-678901",
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
      degrees: "MBBS, DGO, FCPS (Obs & Gynae)",
      designation: "Consultant Obstetrician & Gynecologist",
      hospital: "City Women & Children Care Hospital",
      bmdcRegNo: "BMDC-A-48193",
      chamberAddress: "Women's Health 208, 2nd Floor",
      contactNumber: "+880 1715-789012",
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
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
        scheduleJson: item.schedule,
        available: item.available,
      },
      create: {
        userId: user.id,
        specialization: item.specialization,
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
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
          notes: "Consultation appointment",
        },
      });
    }
  }

  await prisma.medicine.createMany({
    data: [
      {
        name: "Napa Extra",
        type: "Tablet",
        dosage: "500mg + 65mg",
        instructions: "1 tablet after meal, 2-3 times daily as needed",
      },
      {
        name: "Monas",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet at night daily",
      },
      {
        name: "Maxpro",
        type: "Capsule",
        dosage: "20mg",
        instructions: "1 capsule 30 minutes before breakfast",
      },
      {
        name: "Azithrocin",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet daily 1 hour before meal for 5 days",
      },
      {
        name: "Tofen",
        type: "Syrup",
        dosage: "100ml",
        instructions: "2 teaspoons twice daily after meals",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.diagnosticTest.createMany({
    data: [
      {
        name: "CBC with ESR",
        instructions: "Fasting not required",
      },
      {
        name: "Chest X-Ray P/A View",
        instructions: "Bring previous X-ray plates if available",
      },
      {
        name: "Serum Creatinine",
        instructions: "Morning sample preferred",
      },
      {
        name: "Echocardiogram (2D & Color Doppler)",
        instructions: "Prior appointment recommended",
      },
      {
        name: "Serum Lipid Profile",
        instructions: "10-12 hours overnight fasting mandatory",
      },
      {
        name: "HbA1c (Glycated Hemoglobin)",
        instructions: "Fasting not required",
      },
      {
        name: "Ultrasonography of Whole Abdomen",
        instructions: "Overnight fasting and full bladder required",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.template.upsert({
    where: { id: "default-template" },
    update: {
      name: "Professional Hospital Template",
      isDefault: true,
      contentJson: {
        hospitalName: "Metropolitan Specialized Hospital",
        hospitalTagline: "Center of Medical Excellence & Compassionate Care",
        hospitalAddress: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
        hospitalPhone: "+880 2-8901234 / Emergency: 10678",
        hospitalEmail: "info@metropolitanhospital.com",
        hospitalWebsite: "www.metropolitanhospital.com",
        themeColor: "#0f766e",
        showVitals: true,
        showClinicalNotes: true,
        disclaimer:
          "This is a legally valid computer-generated medical prescription. Please keep it safe for follow-up visits. For medical emergencies, call our 24/7 hotline 10678 or visit the nearest emergency room immediately.",
      },
    },
    create: {
      id: "default-template",
      name: "Professional Hospital Template",
      isDefault: true,
      createdById: admin.id,
      contentJson: {
        hospitalName: "Metropolitan Specialized Hospital",
        hospitalTagline: "Center of Medical Excellence & Compassionate Care",
        hospitalAddress: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
        hospitalPhone: "+880 2-8901234 / Emergency: 10678",
        hospitalEmail: "info@metropolitanhospital.com",
        hospitalWebsite: "www.metropolitanhospital.com",
        themeColor: "#0f766e",
        showVitals: true,
        showClinicalNotes: true,
        disclaimer:
          "This is a legally valid computer-generated medical prescription. Please keep it safe for follow-up visits. For medical emergencies, call our 24/7 hotline 10678 or visit the nearest emergency room immediately.",
      },
    },
  });

  console.log("Seed completed successfully with 6 doctors and professional template.");
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
