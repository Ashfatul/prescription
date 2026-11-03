import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  PrintablePrescriptionView,
  MedicineItem,
  TestItem,
  Vitals,
  ClinicalInfo,
  TemplateContent,
} from "@/components/prescriptions/printable-prescription-view";

type Params = { id: string };

type DoctorOverride = {
  doctorName?: string;
  specialization?: string;
  degrees?: string;
  designation?: string;
  hospital?: string;
  bmdcRegNo?: string;
  chamberAddress?: string;
  contactNumber?: string;
  signatureUrl?: string;
};

export default async function PrintablePrescriptionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<{ version?: string }>;
}) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const requestedVersion = sParams.version ? parseInt(sParams.version, 10) : undefined;

  const prescription = await db.prescription.findUnique({
    where: { id },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              imageUrl: true,
              signatureUrl: true,
            },
          },
        },
      },
      patient: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              imageUrl: true,
            },
          },
        },
      },
      template: true,
      appointment: true,
      attachments: { include: { file: true } },
      versions: {
        orderBy: { versionNumber: "asc" },
      },
    },
  });

  if (!prescription) {
    notFound();
  }

  const activeVersion = prescription.version || 1;
  const targetVersionRecord = requestedVersion
    ? prescription.versions.find((v) => v.versionNumber === requestedVersion)
    : null;

  const currentVersion = targetVersionRecord ? targetVersionRecord.versionNumber : activeVersion;
  const isHistorical = targetVersionRecord ? targetVersionRecord.versionNumber !== activeVersion : false;
  const changeReason = targetVersionRecord
    ? targetVersionRecord.changeReason
    : prescription.versions.find((v) => v.versionNumber === activeVersion)?.changeReason || null;

  // Clinical & Medicines Data (From version snapshot if target selected, else active prescription)
  const medicines = (
    (targetVersionRecord ? targetVersionRecord.medicinesJson : prescription.medicinesJson) as MedicineItem[]
  ) || [];
  const tests = (
    (targetVersionRecord ? targetVersionRecord.testsJson : prescription.testsJson) as TestItem[]
  ) || [];
  const vitals = (
    (targetVersionRecord ? targetVersionRecord.vitalsJson : prescription.vitalsJson) as Vitals
  ) || {};
  const clinicalInfo = (
    (targetVersionRecord ? targetVersionRecord.clinicalInfoJson : prescription.clinicalInfoJson) as ClinicalInfo
  ) || {};
  const override = (
    (targetVersionRecord && targetVersionRecord.doctorOverrideJson
      ? targetVersionRecord.doctorOverrideJson
      : prescription.doctorOverrideJson) as DoctorOverride
  ) || {};

  const displayDate = targetVersionRecord ? targetVersionRecord.createdAt : prescription.createdAt;

  // Doctor Info (Priority: doctorOverrideJson -> doctor profile -> user record)
  const docProfile = prescription.doctor;

  const doctorName = override.doctorName || docProfile.user.name;
  const specialization = override.specialization || docProfile.specialization;
  const degrees = override.degrees || docProfile.degrees;
  const designation = override.designation || docProfile.designation;
  const hospitalAffiliation = override.hospital || docProfile.hospital;
  const bmdcRegNo = override.bmdcRegNo || docProfile.bmdcRegNo;
  const chamber = override.chamberAddress || docProfile.chamberAddress;
  const contactPhone = override.contactNumber || docProfile.contactNumber || docProfile.user.phone;
  const signatureUrl = override.signatureUrl || docProfile.signatureUrl || docProfile.user.signatureUrl;

  const tplContent = (prescription.template?.contentJson as TemplateContent) || {};

  return (
    <PrintablePrescriptionView
      id={id}
      currentVersion={currentVersion}
      activeVersion={activeVersion}
      isHistorical={isHistorical}
      changeReason={changeReason}
      displayDate={displayDate}
      versions={prescription.versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
      }))}
      doctor={{
        name: doctorName,
        specialization,
        degrees,
        designation,
        hospitalAffiliation,
        bmdcRegNo,
        chamber,
        contactPhone,
        signatureUrl,
      }}
      patient={{
        name: prescription.patient.user.name,
        gender: prescription.patient.gender,
        dateOfBirth: prescription.patient.dateOfBirth,
      }}
      appointment={prescription.appointment ? { serialNumber: prescription.appointment.serialNumber } : null}
      notes={prescription.notes}
      medicines={medicines}
      tests={tests}
      vitals={vitals}
      clinicalInfo={clinicalInfo}
      tplContent={tplContent}
      attachments={prescription.attachments.map((att) => ({
        id: att.id,
        file: {
          url: att.file.url,
          originalName: att.file.originalName,
        },
      }))}
    />
  );
}
