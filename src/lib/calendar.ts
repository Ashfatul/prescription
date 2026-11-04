/**
 * Clinical Google Calendar & iCalendar URL Generators
 */

function formatGCalDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

export function createGoogleCalendarAppointmentUrl(params: {
  doctorName: string;
  patientName: string;
  appointmentDate: Date;
  serialNumber?: number;
  chamberAddress?: string;
  notes?: string;
}): string {
  const start = new Date(params.appointmentDate);
  const end = new Date(start.getTime() + 30 * 60 * 1000); // default 30-minute consultation slot

  const title = `Medical Consultation: ${params.doctorName} with ${params.patientName}`;
  const details = [
    `Patient: ${params.patientName}`,
    `Physician: ${params.doctorName}`,
    params.serialNumber ? `Queue Serial Token: #${params.serialNumber}` : "",
    params.chamberAddress ? `Chamber: ${params.chamberAddress}` : "",
    params.notes ? `Clinical Notes: ${params.notes}` : "",
    "Managed via CareFlow OS clinic operations platform",
  ]
    .filter(Boolean)
    .join("\n");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", `${formatGCalDate(start)}/${formatGCalDate(end)}`);
  url.searchParams.set("details", details);
  if (params.chamberAddress) {
    url.searchParams.set("location", params.chamberAddress);
  }

  return url.toString();
}

export function createGoogleCalendarMedicineReminderUrl(params: {
  medicineName: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  instructions?: string;
  startDate?: Date;
}): string {
  const start = params.startDate ? new Date(params.startDate) : new Date();
  start.setHours(9, 0, 0, 0); // 9:00 AM default reminder
  const end = new Date(start.getTime() + 15 * 60 * 1000);

  const title = `💊 Medicine Reminder: ${params.medicineName} (${params.dosage || "Prescribed Dose"})`;
  const details = [
    `Medicine: ${params.medicineName}`,
    params.dosage ? `Dose: ${params.dosage}` : "",
    params.frequency ? `Frequency: ${params.frequency}` : "",
    params.timing ? `Instructions: ${params.timing}` : "",
    params.instructions ? `Doctor Notes: ${params.instructions}` : "",
    "Take with fresh water as directed by your physician.",
  ]
    .filter(Boolean)
    .join("\n");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", `${formatGCalDate(start)}/${formatGCalDate(end)}`);
  url.searchParams.set("details", details);
  url.searchParams.set("recur", "RRULE:FREQ=DAILY;COUNT=14"); // daily for 14 days by default

  return url.toString();
}

export function downloadIcsFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
