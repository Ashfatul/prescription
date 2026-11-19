import { db } from "@/lib/db";

export interface TopStatItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  users: number;
  doctors: number;
  patients: number;
  appointments: number;
  prescriptions: number;
  topMedicines: TopStatItem[];
  topDiagnoses: TopStatItem[];
  sampleSize: number;
}

// In-memory 30s cache to avoid recalculating stats on every quick page navigation
const statsCache = new Map<string, { data: DashboardStats; timestamp: number }>();
const STATS_CACHE_TTL_MS = 30_000;

export function invalidateStatsCache(organizationId?: string) {
  if (organizationId) {
    statsCache.delete(organizationId);
  } else {
    statsCache.clear();
  }
}

export async function getDashboardStats(organizationId?: string): Promise<DashboardStats> {
  const cacheKey = organizationId || "global";
  const now = Date.now();
  const cached = statsCache.get(cacheKey);
  if (cached && now - cached.timestamp < STATS_CACHE_TTL_MS) {
    return cached.data;
  }

  const userWhere = organizationId ? { organizationId } : {};
  const doctorWhere = organizationId ? { OR: [{ organizationId }, { user: { organizationId } }] } : {};
  const patientWhere = organizationId ? { OR: [{ organizationId }, { user: { organizationId } }] } : {};
  const orgScopedFilter = organizationId ? { organizationId } : {};

  const [users, doctors, patients, appointments, prescriptions, recentPrescriptions] =
    await Promise.all([
      db.user.count({ where: userWhere }),
      db.doctor.count({ where: doctorWhere }),
      db.patient.count({ where: patientWhere }),
      db.appointment.count({ where: orgScopedFilter }),
      db.prescription.count({ where: orgScopedFilter }),
      db.prescription.findMany({
        where: orgScopedFilter,
        select: {
          medicinesJson: true,
          clinicalInfoJson: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 150,
      }),
    ]);

  // Aggregate Top Prescribed Medicines
  const medCounts: Record<string, number> = {};
  let totalMedicinesPrescribed = 0;

  // Aggregate Top Diagnoses
  const diagCounts: Record<string, number> = {};
  let totalDiagnosesRecorded = 0;

  for (const rx of recentPrescriptions) {
    // 1. Medicines
    if (Array.isArray(rx.medicinesJson)) {
      for (const item of rx.medicinesJson as Array<{ name?: string }>) {
        if (item && item.name) {
          const rawName = item.name.trim();
          const cleanName = rawName.replace(/^(Tab\.|Cap\.|Syr\.|Inj\.)\s*/i, "").trim();
          if (cleanName) {
            medCounts[cleanName] = (medCounts[cleanName] || 0) + 1;
            totalMedicinesPrescribed++;
          }
        }
      }
    }

    // 2. Diagnoses
    if (rx.clinicalInfoJson && typeof rx.clinicalInfoJson === "object") {
      const info = rx.clinicalInfoJson as { diagnosis?: string };
      if (info.diagnosis && typeof info.diagnosis === "string" && info.diagnosis.trim()) {
        const dx = info.diagnosis.trim();
        diagCounts[dx] = (diagCounts[dx] || 0) + 1;
        totalDiagnosesRecorded++;
      }
    }
  }

  const topMedicines: TopStatItem[] = Object.entries(medCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalMedicinesPrescribed > 0 ? Math.round((count / totalMedicinesPrescribed) * 100) : 0,
    }));

  const topDiagnoses: TopStatItem[] = Object.entries(diagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalDiagnosesRecorded > 0 ? Math.round((count / totalDiagnosesRecorded) * 100) : 0,
    }));

  const result: DashboardStats = {
    users,
    doctors,
    patients,
    appointments,
    prescriptions,
    topMedicines,
    topDiagnoses,
    sampleSize: recentPrescriptions.length,
  };

  statsCache.set(cacheKey, { data: result, timestamp: now });
  return result;
}
