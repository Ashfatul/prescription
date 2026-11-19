import { cache } from "react";
import { db } from "@/lib/db";

export interface HospitalSettings {
    hospitalName: string;
    hospitalTagline?: string;
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
    hospitalName: "",
    hospitalTagline: "",
    hospitalBranch: "Operations",
    hospitalAddress: "Platform operations and support",
    opdVisitingHours: "Clinic-managed",
    emergencyHotline: "",
    contactPhone: "",
    supportEmail: "support@ppms.local",
    emergencyStatus: "Platform operational",
    emergencyNotice:
        "For product issues, account support, security reports, or feature requests, contact the platform support team.",
    chamberDays: "Clinic-managed",
    requireEmailVerification: true,
    requireOrgApproval: true,
    requirePatientVerification: true,
};

// In-memory TTL cache to eliminate redundant DB hits across all pages and layouts
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}
const CACHE_TTL_MS = 60_000; // 60 seconds TTL

let cachedHospitalSettings: CacheEntry<HospitalSettings> | null = null;
let cachedEmailVerification: CacheEntry<boolean> | null = null;
let cachedOrgApproval: CacheEntry<boolean> | null = null;
const cachedPatientVerification = new Map<string, CacheEntry<boolean>>();

export function invalidateSettingsCache() {
    cachedHospitalSettings = null;
    cachedEmailVerification = null;
    cachedOrgApproval = null;
    cachedPatientVerification.clear();
}

export async function isEmailVerificationRequired(): Promise<boolean> {
    const now = Date.now();
    if (cachedEmailVerification && now - cachedEmailVerification.timestamp < CACHE_TTL_MS) {
        return cachedEmailVerification.data;
    }

    try {
        const setting = await db.systemSetting.findUnique({
            where: { key: "auth_require_email_verification" },
        });
        const result = setting ? setting.value === "true" : true;
        cachedEmailVerification = { data: result, timestamp: now };
        return result;
    } catch {
        return true;
    }
}

export async function setEmailVerificationRequired(
    required: boolean,
): Promise<void> {
    invalidateSettingsCache();
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
    const now = Date.now();
    if (cachedOrgApproval && now - cachedOrgApproval.timestamp < CACHE_TTL_MS) {
        return cachedOrgApproval.data;
    }

    try {
        const setting = await db.systemSetting.findUnique({
            where: { key: "auth_require_org_approval" },
        });
        const result = setting ? setting.value === "true" : false;
        cachedOrgApproval = { data: result, timestamp: now };
        return result;
    } catch {
        return false;
    }
}

export async function setOrgApprovalRequired(required: boolean): Promise<void> {
    invalidateSettingsCache();
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

export async function isPatientVerificationRequired(
    orgId?: string,
): Promise<boolean> {
    const now = Date.now();
    const cacheKey = orgId || "global";
    const cached = cachedPatientVerification.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        if (orgId) {
            const org = await db.organization.findUnique({
                where: { id: orgId },
                select: { settingsJson: true },
            });
            const orgSettings = org?.settingsJson as Record<
                string,
                unknown
            > | null;
            if (
                orgSettings &&
                typeof orgSettings.requirePatientVerification === "boolean"
            ) {
                cachedPatientVerification.set(cacheKey, { data: orgSettings.requirePatientVerification, timestamp: now });
                return orgSettings.requirePatientVerification;
            }
        }

        const setting = await db.systemSetting.findUnique({
            where: { key: "auth_require_patient_verification" },
        });
        const result = setting ? setting.value === "true" : false;
        cachedPatientVerification.set(cacheKey, { data: result, timestamp: now });
        return result;
    } catch {
        return false;
    }
}

export async function setPatientVerificationRequired(
    required: boolean,
): Promise<void> {
    invalidateSettingsCache();
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

async function fetchHospitalSettingsFromDb(): Promise<HospitalSettings> {
    const now = Date.now();
    if (cachedHospitalSettings && now - cachedHospitalSettings.timestamp < CACHE_TTL_MS) {
        return cachedHospitalSettings.data;
    }

    try {
        const records = await db.systemSetting.findMany({
            where: { category: { in: ["hospital", "auth", "general", "system"] } },
        });

        const settingsMap: Record<string, string> = {};
        for (const record of records) {
            settingsMap[record.key] = record.value;
        }

        const hospitalName =
            settingsMap.hospitalName ||
            settingsMap.hospital_name ||
            settingsMap.systemName ||
            settingsMap.system_name ||
            DEFAULT_HOSPITAL_SETTINGS.hospitalName;

        const hospitalTagline =
            settingsMap.hospitalTagline ||
            settingsMap.hospital_tagline ||
            DEFAULT_HOSPITAL_SETTINGS.hospitalTagline ||
            "";

        const contactPhone =
            settingsMap.contactPhone ||
            settingsMap.contact_phone ||
            DEFAULT_HOSPITAL_SETTINGS.contactPhone;

        const emergencyHotline =
            settingsMap.emergencyHotline ||
            settingsMap.emergency_hotline ||
            DEFAULT_HOSPITAL_SETTINGS.emergencyHotline;

        const supportEmail =
            settingsMap.supportEmail ||
            settingsMap.support_email ||
            DEFAULT_HOSPITAL_SETTINGS.supportEmail;

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

        const result: HospitalSettings = {
            hospitalName,
            hospitalTagline,
            hospitalBranch:
                settingsMap.hospitalBranch ||
                DEFAULT_HOSPITAL_SETTINGS.hospitalBranch,
            hospitalAddress:
                settingsMap.hospitalAddress ||
                DEFAULT_HOSPITAL_SETTINGS.hospitalAddress,
            opdVisitingHours:
                settingsMap.opdVisitingHours ||
                DEFAULT_HOSPITAL_SETTINGS.opdVisitingHours,
            emergencyHotline,
            contactPhone,
            supportEmail,
            emergencyStatus:
                settingsMap.emergencyStatus ||
                DEFAULT_HOSPITAL_SETTINGS.emergencyStatus,
            emergencyNotice:
                settingsMap.emergencyNotice ||
                DEFAULT_HOSPITAL_SETTINGS.emergencyNotice,
            chamberDays:
                settingsMap.chamberDays ||
                DEFAULT_HOSPITAL_SETTINGS.chamberDays,
            requireEmailVerification,
            requireOrgApproval,
            requirePatientVerification,
        };

        cachedHospitalSettings = { data: result, timestamp: now };
        return result;
    } catch (err) {
        console.error("Failed to load hospital settings from database:", err);
        return DEFAULT_HOSPITAL_SETTINGS;
    }
}

export const getHospitalSettings = cache(async (): Promise<HospitalSettings> => {
    return fetchHospitalSettingsFromDb();
});

export async function updateHospitalSettings(
    updates: Partial<HospitalSettings>,
): Promise<HospitalSettings> {
    invalidateSettingsCache();
    const entries = Object.entries(updates) as [
        keyof HospitalSettings,
        string | boolean,
    ][];

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
