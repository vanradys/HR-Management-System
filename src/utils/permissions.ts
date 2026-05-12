// Daftar role resmi yang dipakai sistem.
export type Role =
  | "Admin"
  | "Director"
  | "HRD"
  | "Finance"
  | "GA"
  | "Marketing"
  | "Engineering"
  | "Production"
  | "Logistic"
  | "Karyawan";

// Cek apakah role adalah Admin atau Director.
export const isAdminOrDirector = (role: string) =>
  role === "Admin" || role === "Director";

// Cek apakah role boleh edit jadwal shift.
export const canManageShift = (role: string) =>
  ["Admin", "Director", "HRD"].includes(role);

// Cek apakah role boleh approve cuti/lembur.
export const canApproveRequest = (role: string) =>
  ["Admin", "Director"].includes(role);

// Cek apakah role boleh melihat semua reimbursement.
export const canViewAllReimbursements = (role: string) =>
  ["Admin", "Director", "Finance"].includes(role);

// Cek apakah role boleh mengelola pengumuman.
export const canManageAnnouncement = (role: string) =>
  ["Admin", "HRD"].includes(role);

// Cek apakah role boleh melihat rekap payroll semua karyawan.
export const canViewPayrollSummary = (role: string) =>
  ["Admin", "Director", "Finance"].includes(role);

// Cek apakah role boleh akses pengaturan.
export const canAccessSettings = (role: string) =>
  role === "Admin";