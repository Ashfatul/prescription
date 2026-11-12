import { db } from "@/lib/db";
import { isDemoModeActive, DEMO_ACCOUNT_EMAILS, SUPER_ADMIN_EMAIL } from "@/features/demo/demo-reset.service";

export interface TopStatItem {
  name: string;
  count: number;
  percentage: number;
}

export async function getDashboardStats(organizationId?: string, includeDemo?: boolean) {
  const isDemo = isDemoModeActive();
  const shouldIncludeDemo = includeDemo !== undefined ? includeDemo : isDemo;

  const demoOrgFilter = shouldIncludeDemo
    ? {}
    : {
        organization: {
          isDemo: false,
          slug: { not: "ppms-clinic" },
        },
      };

  const userWhere = {
    ...(organizationId ? { organizationId } : {}),
    ...(shouldIncludeDemo
      ? {}
      : {
          isDemo: false,
          NOT: [
            { email: { in: DEMO_ACCOUNT_EMAILS.filter((e) => e !== SUPER_ADMIN_EMAIL) } },
            { organization: { isDemo: true } },
            { organization: { slug: "ppms-clinic" } },
          ],
        }),
  };

  const doctorWhere = {
    ...(organizationId ? { OR: [{ organizationId }, { user: { organizationId } }] } : {}),
    ...demoOrgFilter,
  };

  const patientWhere = {
    ...(organizationId ? { OR: [{ organizationId }, { user: { organizationId } }] } : {}),
    ...demoOrgFilter,
  };

  const orgScopedFilter = {
    ...(organizationId ? { organizationId } : {}),
    ...demoOrgFilter,
  };

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

  return {
    users,
    doctors,
    patients,
    appointments,
    prescriptions,
    topMedicines,
    topDiagnoses,
    sampleSize: recentPrescriptions.length,
  };
}
