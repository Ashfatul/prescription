import { db } from "@/lib/db";

export interface HospitalSettings {
  hospitalName: string;
  hospitalBranch: string;
  hospitalAddress: string;
  opdVisitingHours: string;
  emergencyHotline: string;
  contactPhone: string;
  supportEmail: string;
  emergencyStatus: string;
  emergencyNotice: string;
  chamberDays: string;
  requireEmailVerification: boolean;
}

export const DEFAULT_HOSPITAL_SETTINGS: HospitalSettings = {
  hospitalName: "Metropolitan Specialized Hospital",
  hospitalBranch: "Diagnostic & Consultation Block C",
  hospitalAddress: "Diagnostic Block C, 3rd Floor, Metropolitan Hospital, Dhaka",
  opdVisitingHours: "08:00 AM - 10:00 PM (Daily)",
  emergencyHotline: "10678",
  contactPhone: "+880 1711-234567",
  supportEmail: "clinical-support@metropolitan-hospital.org",
  emergencyStatus: "OPD & Chamber 24/7 Active",
  emergencyNotice: "PPMS is a clinical management and prescription issuing tool. In life-threatening emergencies, call 10678 or immediately proceed to the nearest hospital emergency room.",
  chamberDays: "Saturday - Thursday",
  requireEmailVerification: true,
};

export async function isEmailVerificationRequired(): Promise<boolean> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "auth_require_email_verification" },
    });
    if (!setting) return true;
    return setting.value === "true";
  } catch {
    return true;
  }
}

export async function setEmailVerificationRequired(required: boolean): Promise<void> {
  await db.systemSetting.upsert({
    where: { key: "auth_require_email_verification" },
    create: {
      key: "auth_require_email_verification",
      value: required ? "true" : "false",
      category: "auth",
    },
    update: {
      value: required ? "true" : "false",
      category: "auth",
    },
  });
}

export async function getHospitalSettings(): Promise<HospitalSettings> {
  try {
    const records = await db.systemSetting.findMany({
      where: { category: { in: ["hospital", "auth"] } },
    });

    const settingsMap: Record<string, string> = {};
    for (const record of records) {
      settingsMap[record.key] = record.value;
    }

    const requireEmailVerification =
      settingsMap["auth_require_email_verification"] !== undefined
        ? settingsMap["auth_require_email_verification"] === "true"
        : DEFAULT_HOSPITAL_SETTINGS.requireEmailVerification;

    return {
      hospitalName: settingsMap.hospitalName || DEFAULT_HOSPITAL_SETTINGS.hospitalName,
      hospitalBranch: settingsMap.hospitalBranch || DEFAULT_HOSPITAL_SETTINGS.hospitalBranch,
      hospitalAddress: settingsMap.hospitalAddress || DEFAULT_HOSPITAL_SETTINGS.hospitalAddress,
      opdVisitingHours: settingsMap.opdVisitingHours || DEFAULT_HOSPITAL_SETTINGS.opdVisitingHours,
      emergencyHotline: settingsMap.emergencyHotline || DEFAULT_HOSPITAL_SETTINGS.emergencyHotline,
      contactPhone: settingsMap.contactPhone || DEFAULT_HOSPITAL_SETTINGS.contactPhone,
      supportEmail: settingsMap.supportEmail || DEFAULT_HOSPITAL_SETTINGS.supportEmail,
      emergencyStatus: settingsMap.emergencyStatus || DEFAULT_HOSPITAL_SETTINGS.emergencyStatus,
      emergencyNotice: settingsMap.emergencyNotice || DEFAULT_HOSPITAL_SETTINGS.emergencyNotice,
      chamberDays: settingsMap.chamberDays || DEFAULT_HOSPITAL_SETTINGS.chamberDays,
      requireEmailVerification,
    };
  } catch (err) {
    console.error("Failed to load hospital settings from database:", err);
    return DEFAULT_HOSPITAL_SETTINGS;
  }
}

export async function updateHospitalSettings(
  updates: Partial<HospitalSettings>
): Promise<HospitalSettings> {
  const entries = Object.entries(updates) as [keyof HospitalSettings, string | boolean][];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null) {
      if (key === "requireEmailVerification") {
        await setEmailVerificationRequired(Boolean(value));
      } else {
        await db.systemSetting.upsert({
          where: { key },
          create: {
            key,
            value: String(value),
            category: "hospital",
          },
          update: {
            value: String(value),
            category: "hospital",
          },
        });
      }
    }
  }

  return getHospitalSettings();
}
