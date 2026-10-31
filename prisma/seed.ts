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

  // Clear and seed comprehensive catalog
  await prisma.medicine.deleteMany({});
  await prisma.diagnosticTest.deleteMany({});

  await prisma.medicine.createMany({
    data: [
      // Analgesics & Antipyretics
      {
        name: "Napa Extra",
        type: "Tablet",
        dosage: "500mg + 65mg",
        instructions: "1 tablet after meal, 2-3 times daily as needed",
      },
      {
        name: "Ace Plus",
        type: "Tablet",
        dosage: "500mg + 65mg",
        instructions: "1 tablet 3 times daily after meals",
      },
      {
        name: "Torax",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet twice daily after meals (max 5 days)",
      },
      {
        name: "Clofenac SR",
        type: "Tablet",
        dosage: "100mg",
        instructions: "1 tablet once daily after dinner with PPI",
      },
      // PPIs & Antacids
      {
        name: "Maxpro",
        type: "Capsule",
        dosage: "20mg",
        instructions: "1 capsule 30 minutes before breakfast & dinner",
      },
      {
        name: "Seclo",
        type: "Capsule",
        dosage: "20mg",
        instructions: "1 capsule 30 minutes before breakfast",
      },
      {
        name: "Pantonix",
        type: "Tablet",
        dosage: "20mg",
        instructions: "1 tablet twice daily 30 mins before meals",
      },
      {
        name: "Finix",
        type: "Tablet",
        dosage: "20mg",
        instructions: "1 tablet once daily in morning before food",
      },
      {
        name: "Entacyd Plus",
        type: "Suspension",
        dosage: "200ml",
        instructions: "2 teaspoons 1 hour after meals and at bedtime",
      },
      // Antibiotics
      {
        name: "Azithrocin",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet daily 1 hour before meal for 5 days",
      },
      {
        name: "Moxaclav",
        type: "Tablet",
        dosage: "625mg",
        instructions: "1 tablet twice daily after food for 7 days",
      },
      {
        name: "Cef-3",
        type: "Capsule",
        dosage: "200mg",
        instructions: "1 capsule twice daily after meals for 7 days",
      },
      {
        name: "Ciprocin",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet every 12 hours after meals for 7 days",
      },
      {
        name: "Levoking",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet once daily after meals for 7 days",
      },
      // Antihistamines & Respiratory
      {
        name: "Monas",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet at night daily",
      },
      {
        name: "Bilasten",
        type: "Tablet",
        dosage: "20mg",
        instructions: "1 tablet daily on empty stomach",
      },
      {
        name: "Fexo",
        type: "Tablet",
        dosage: "120mg",
        instructions: "1 tablet once daily in evening",
      },
      {
        name: "Tofen",
        type: "Syrup",
        dosage: "100ml",
        instructions: "2 teaspoons twice daily after meals",
      },
      {
        name: "Ventolin Evohaler",
        type: "Inhaler",
        dosage: "100mcg/puff",
        instructions: "2 puffs as needed for shortness of breath or wheezing",
      },
      {
        name: "Seretide Evohaler",
        type: "Inhaler",
        dosage: "25/125mcg",
        instructions: "2 puffs twice daily followed by mouth rinse with water",
      },
      // Cardiovascular & Antihypertensives
      {
        name: "Osartil",
        type: "Tablet",
        dosage: "50mg",
        instructions: "1 tablet once daily in the morning",
      },
      {
        name: "Camlosart",
        type: "Tablet",
        dosage: "5/50mg",
        instructions: "1 tablet once daily in the morning",
      },
      {
        name: "Bislol",
        type: "Tablet",
        dosage: "2.5mg",
        instructions: "1 tablet once daily in the morning",
      },
      {
        name: "Rosu",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet at night after dinner",
      },
      {
        name: "Clopilet",
        type: "Tablet",
        dosage: "75mg",
        instructions: "1 tablet once daily after meals",
      },
      // Antidiabetics
      {
        name: "Comet",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet twice daily with main meals",
      },
      {
        name: "Glucolead",
        type: "Tablet",
        dosage: "2mg",
        instructions: "1 tablet once daily before breakfast",
      },
      {
        name: "Galvus Met",
        type: "Tablet",
        dosage: "50/500mg",
        instructions: "1 tablet twice daily with meals",
      },
      // Supplements
      {
        name: "D-Rise",
        type: "Capsule",
        dosage: "20,000 IU",
        instructions: "1 capsule weekly for 8 weeks after heavy lunch",
      },
      {
        name: "Calbo-D",
        type: "Tablet",
        dosage: "500mg + 200 IU",
        instructions: "1 tablet once daily after meals",
      },
      {
        name: "B-50 Forte",
        type: "Tablet",
        dosage: "High Potency B-Complex",
        instructions: "1 tablet twice daily after meals",
      },
    ],
  });

  await prisma.diagnosticTest.createMany({
    data: [
      {
        name: "CBC with ESR (Complete Blood Count)",
        instructions: "Fasting not required. Clean blood sample.",
      },
      {
        name: "Chest X-Ray P/A View",
        instructions: "Bring previous X-ray plates if available. Metal objects removed.",
      },
      {
        name: "Serum Creatinine",
        instructions: "Morning sample preferred. Avoid strenuous exercise 24h prior.",
      },
      {
        name: "Fasting Blood Sugar (FBS)",
        instructions: "8-10 hours strict overnight fasting required before sample.",
      },
      {
        name: "2-Hour Postprandial Blood Sugar (2HABF)",
        instructions: "Sample taken exactly 2 hours after beginning breakfast.",
      },
      {
        name: "HbA1c (Glycated Hemoglobin)",
        instructions: "Measures 3-month sugar control. Fasting not required.",
      },
      {
        name: "Serum Lipid Profile (Cholesterol, TG, HDL, LDL)",
        instructions: "10-12 hours overnight fasting mandatory. Water allowed.",
      },
      {
        name: "Serum Electrolytes (Na+, K+, Cl-)",
        instructions: "Morning venous blood sample preferred.",
      },
      {
        name: "Serum Uric Acid",
        instructions: "Fasting preferred. Avoid meat/alcohol night before.",
      },
      {
        name: "Liver Function Tests (SGPT, SGOT, Alk Phos, Bilirubin)",
        instructions: "Morning fasting blood sample.",
      },
      {
        name: "Thyroid Function Test (TSH, FT4)",
        instructions: "Morning sample before taking morning thyroid medication.",
      },
      {
        name: "Urine Routine & Microscopic Examination (R/M/E)",
        instructions: "Clean catch mid-stream urine in sterile container.",
      },
      {
        name: "Ultrasonography of Whole Abdomen (USG)",
        instructions: "6 hours overnight fasting and full urinary bladder required.",
      },
      {
        name: "ECG (12-Lead Electrocardiogram)",
        instructions: "Rest comfortably in supine position 10 minutes before test.",
      },
      {
        name: "Echocardiogram (2D & Color Doppler)",
        instructions: "Cardiac imaging. Prior appointment recommended.",
      },
      {
        name: "Serum 25-OH Vitamin D",
        instructions: "Random venous blood sample. Fasting not required.",
      },
    ],
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
