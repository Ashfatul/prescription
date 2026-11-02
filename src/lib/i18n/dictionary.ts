export const dictionary = {
  en: {
    appTitle: "Patient Prescription Management System",
    doctors: "Doctors",
    clinics: "Clinics",
    staff: "Staff",
    schedule: "Schedule",
    availability: "Availability",
    currentSerial: "Current Serial",
    bookNow: "Book Appointment",
    login: "Login",
    dashboard: "Dashboard",
    logout: "Logout",
  },
  bn: {
    appTitle: "রোগী প্রেসক্রিপশন ম্যানেজমেন্ট সিস্টেম",
    doctors: "ডাক্তার",
    clinics: "ক্লিনিক",
    staff: "কর্মী",
    schedule: "সময়সূচী",
    availability: "উপলভ্যতা",
    currentSerial: "চলমান সিরিয়াল",
    bookNow: "অ্যাপয়েন্টমেন্ট নিন",
    login: "লগইন",
    dashboard: "ড্যাশবোর্ড",
    logout: "লগআউট",
  },
} as const;

export type Language = keyof typeof dictionary;
