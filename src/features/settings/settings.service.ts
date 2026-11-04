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
  requireOrgApproval: boolean;
  requirePatientVerification: boolean;
}

export const DEFAULT_HOSPITAL_SETTINGS: HospitalSettings = {
  hospitalName: "CareFlow OS",
  hospitalBranch: "SaaS Operations",
  hospitalAddress: "Platform operations and support",
  opdVisitingHours: "Clinic-managed",
  emergencyHotline: "",
  contactPhone: "",
  supportEmail: "support@ppms.local",
  emergencyStatus: "Platform operational",
  emergencyNotice: "For product issues, account support, security reports, or feature requests, contact the CareFlow OS platform support team.",
  chamberDays: "Clinic-managed",
  requireEmailVerification: true,
  requireOrgApproval: true,
  requirePatientVerification: true,
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

export async function isOrgApprovalRequired(): Promise<boolean> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "auth_require_org_approval" },
    });
    if (!setting) return true;
    return setting.value === "true";
  } catch {
    return false;
  }
}

export async function setOrgApprovalRequired(required: boolean): Promise<void> {
  await db.systemSetting.upsert({
    where: { key: "auth_require_org_approval" },
    create: {
      key: "auth_require_org_approval",
      value: required ? "true" : "false",
      category: "auth",
    },
    update: {
      value: required ? "true" : "false",
      category: "auth",
    },
  });
}

export async function isPatientVerificationRequired(orgId?: string): Promise<boolean> {
  try {
    if (orgId) {
      const org = await db.organization.findUnique({
        where: { id: orgId },
        select: { settingsJson: true },
      });
      const orgSettings = org?.settingsJson as Record<string, unknown> | null;
      if (orgSettings && typeof orgSettings.requirePatientVerification === "boolean") {
        return orgSettings.requirePatientVerification;
      }
    }

    const setting = await db.systemSetting.findUnique({
      where: { key: "auth_require_patient_verification" },
    });
    if (!setting) return true;
    return setting.value === "true";
  } catch {
    return false;
  }
}

export async function setPatientVerificationRequired(required: boolean): Promise<void> {
  await db.systemSetting.upsert({
    where: { key: "auth_require_patient_verification" },
    create: {
      key: "auth_require_patient_verification",
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

    const requireOrgApproval =
      settingsMap["auth_require_org_approval"] !== undefined
        ? settingsMap["auth_require_org_approval"] === "true"
        : DEFAULT_HOSPITAL_SETTINGS.requireOrgApproval;

    const requirePatientVerification =
      settingsMap["auth_require_patient_verification"] !== undefined
        ? settingsMap["auth_require_patient_verification"] === "true"
        : DEFAULT_HOSPITAL_SETTINGS.requirePatientVerification;

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
      requireOrgApproval,
      requirePatientVerification,
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
      } else if (key === "requireOrgApproval") {
        await setOrgApprovalRequired(Boolean(value));
      } else if (key === "requirePatientVerification") {
        await setPatientVerificationRequired(Boolean(value));
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
