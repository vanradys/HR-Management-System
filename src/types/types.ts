export interface Employee {
  id: string;
  name: string;
  nik: string;
  department: string;
  position: string;
  employmentStatus: 'Tetap' | 'Kontrak' | 'Magang';
  phone: string;
  email: string;
  address: string;
  joinDate: string;
  status: 'Aktif' | 'Nonaktif';
  photoUrl?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Hadir' | 'Terlambat' | 'Cuti' | 'Sakit' | 'Absen' | 'Izin';
  location: string;
  isTestData?: boolean;
}

export type ShiftType = 'Pagi' | 'Malam' | 'Libur' | 'Cuti' | 'Izin' | '-';

export interface ShiftSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shift: ShiftType;
  startTime?: string;
  endTime?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Cuti' | 'Izin' | 'Sakit';
  startDate: string;
  endDate: string;
  reason: string;
  documentUrl?: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  submittedAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  reason: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  submittedAt: string;
}

export interface ReimbursementRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  category: 'Transport' | 'Makan' | 'Kesehatan' | 'Peralatan' | 'Lainnya';
  amount: number;
  description: string;
  proof?: string;
  receiptUrl?: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  paymentStatus: 'Belum Dibayar' | 'Sudah Dibayar';
  submittedAt: string;
}

export interface ReportComment {
  id: string;
  commenterName: string;
  comment: string;
  timestamp: string;
}

export interface FieldReport {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  location: string;
  mediaUrls: string[];
  datetime: string;
  comments: ReportComment[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  priority: 'Tinggi' | 'Normal' | 'Rendah';
  authorName: string;
}

export type NotificationType =
  | 'leave_approval'
  | 'overtime_approval'
  | 'attendance_reminder'
  | 'shift_update'
  | 'reimbursement_update'
  | 'report_comment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  basicSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  lateDeduction: number;
  absenceDeduction: number;
  overtimePay: number;
  bonus: number;
  reimbursement: number;
  totalSalary: number;
}

export type UserRole =
  | 'Admin'
  | 'Director'
  | 'Accounting'
  | 'Purchasing'
  | 'GA'
  | 'Supervisor'
  | 'Marketing'
  | 'Engineering'
  | 'Production'
  | 'Logistic'
  | 'Karyawan';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Aktif' | 'Nonaktif';
}

export interface AuthState {
  isLoggedIn: boolean;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}
