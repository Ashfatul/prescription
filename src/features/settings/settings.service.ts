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
};

export async function getHospitalSettings(): Promise<HospitalSettings> {
  try {
    const records = await db.systemSetting.findMany({
      where: { category: "hospital" },
    });

    const settingsMap: Record<string, string> = {};
    for (const record of records) {
      settingsMap[record.key] = record.value;
    }

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
    };
  } catch (err) {
    console.error("Failed to load hospital settings from database:", err);
    return DEFAULT_HOSPITAL_SETTINGS;
  }
}

export async function updateHospitalSettings(
  updates: Partial<HospitalSettings>
): Promise<HospitalSettings> {
  const entries = Object.entries(updates) as [keyof HospitalSettings, string][];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null) {
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

  return getHospitalSettings();
}
