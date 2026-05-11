import type { Employee, Attendance, ShiftSchedule, LeaveRequest, OvertimeRequest, ReimbursementRequest, FieldReport, Announcement, AppNotification, PayrollRecord, AppUser } from '../types/types';
import { generateId, toDateString, getWeekDates } from '../utils/helpers';

export const SEED_EMPLOYEES: Employee[] = [
  { id: 'EMP001', name: 'Andi Kusuma', nik: 'NIK001', department: 'IT', position: 'Web Developer', employmentStatus: 'Tetap', phone: '081234567890', email: 'andi@ptaa.co.id', address: 'Jl. Sudirman No. 1, Jakarta', joinDate: '2021-03-15', status: 'Aktif' },
  { id: 'EMP002', name: 'Siti Rahayu', nik: 'NIK002', department: 'HR', position: 'HR Manager', employmentStatus: 'Tetap', phone: '082345678901', email: 'siti@ptaa.co.id', address: 'Jl. Gatot Subroto No. 5, Jakarta', joinDate: '2019-07-01', status: 'Aktif' },
  { id: 'EMP003', name: 'Budi Santoso', nik: 'NIK003', department: 'Finance', position: 'Finance Staff', employmentStatus: 'Tetap', phone: '083456789012', email: 'budi@ptaa.co.id', address: 'Jl. Thamrin No. 12, Jakarta', joinDate: '2020-01-10', status: 'Aktif' },
  { id: 'EMP004', name: 'Dewi Lestari', nik: 'NIK004', department: 'Operasional', position: 'Supervisor', employmentStatus: 'Tetap', phone: '084567890123', email: 'dewi@ptaa.co.id', address: 'Jl. Rasuna Said No. 8, Jakarta', joinDate: '2018-11-20', status: 'Aktif' },
  { id: 'EMP005', name: 'Rizki Fauzan', nik: 'NIK005', department: 'IT', position: 'Backend Developer', employmentStatus: 'Kontrak', phone: '085678901234', email: 'rizki@ptaa.co.id', address: 'Jl. Kebon Jeruk No. 3, Jakarta', joinDate: '2022-06-01', status: 'Aktif' },
  { id: 'EMP006', name: 'Nurul Hidayah', nik: 'NIK006', department: 'HR', position: 'HR Staff', employmentStatus: 'Kontrak', phone: '086789012345', email: 'nurul@ptaa.co.id', address: 'Jl. Cempaka Putih No. 7, Jakarta', joinDate: '2022-09-01', status: 'Nonaktif' },
  { id: 'EMP007', name: 'Agus Wirawan', nik: 'NIK007', department: 'Operasional', position: 'Staff Lapangan', employmentStatus: 'Tetap', phone: '087890123456', email: 'agus@ptaa.co.id', address: 'Jl. Mangga Dua No. 2, Jakarta', joinDate: '2020-05-12', status: 'Aktif' },
  { id: 'EMP008', name: 'Putri Amaliya', nik: 'NIK008', department: 'Finance', position: 'Finance Manager', employmentStatus: 'Tetap', phone: '088901234567', email: 'putri@ptaa.co.id', address: 'Jl. Kuningan No. 14, Jakarta', joinDate: '2017-08-25', status: 'Aktif' },
  { id: 'EMP009', name: 'Hendra Gunawan', nik: 'NIK009', department: 'Operasional', position: 'Project Manager', employmentStatus: 'Tetap', phone: '089012345678', email: 'hendra@ptaa.co.id', address: 'Jl. Senayan No. 9, Jakarta', joinDate: '2016-04-03', status: 'Aktif' },
  { id: 'EMP010', name: 'Maya Sari', nik: 'NIK010', department: 'IT', position: 'UI Designer', employmentStatus: 'Kontrak', phone: '081122334455', email: 'maya@ptaa.co.id', address: 'Jl. Kemang No. 6, Jaksel', joinDate: '2023-02-01', status: 'Aktif' },
];

export const SEED_ATTENDANCE: Attendance[] = [
  { id: generateId(), employeeId: 'EMP001', employeeName: 'Andi Kusuma', date: '2026-05-11', checkIn: '08:02', checkOut: '17:05', status: 'Hadir', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP002', employeeName: 'Siti Rahayu', date: '2026-05-11', checkIn: '07:55', checkOut: '17:10', status: 'Hadir', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP003', employeeName: 'Budi Santoso', date: '2026-05-11', checkIn: '08:35', checkOut: '17:30', status: 'Terlambat', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP004', employeeName: 'Dewi Lestari', date: '2026-05-11', checkIn: '', checkOut: '', status: 'Cuti', location: '-' },
  { id: generateId(), employeeId: 'EMP005', employeeName: 'Rizki Fauzan', date: '2026-05-11', checkIn: '08:01', checkOut: '17:00', status: 'Hadir', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP007', employeeName: 'Agus Wirawan', date: '2026-05-11', checkIn: '07:30', checkOut: '16:30', status: 'Hadir', location: 'Proyek Bandung' },
  { id: generateId(), employeeId: 'EMP008', employeeName: 'Putri Amaliya', date: '2026-05-11', checkIn: '08:10', checkOut: '17:15', status: 'Hadir', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP009', employeeName: 'Hendra Gunawan', date: '2026-05-11', checkIn: '', checkOut: '', status: 'Izin', location: '-' },
  { id: generateId(), employeeId: 'EMP010', employeeName: 'Maya Sari', date: '2026-05-11', checkIn: '09:05', checkOut: '18:00', status: 'Terlambat', location: 'WFH' },
  { id: generateId(), employeeId: 'EMP001', employeeName: 'Andi Kusuma', date: '2026-05-10', checkIn: '08:00', checkOut: '17:00', status: 'Hadir', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP002', employeeName: 'Siti Rahayu', date: '2026-05-10', checkIn: '07:58', checkOut: '17:05', status: 'Hadir', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP003', employeeName: 'Budi Santoso', date: '2026-05-10', checkIn: '08:02', checkOut: '17:00', status: 'Hadir', location: 'Kantor Pusat, Jakarta' },
  { id: generateId(), employeeId: 'EMP005', employeeName: 'Rizki Fauzan', date: '2026-05-09', checkIn: '', checkOut: '', status: 'Sakit', location: '-' },
  { id: generateId(), employeeId: 'EMP007', employeeName: 'Agus Wirawan', date: '2026-05-09', checkIn: '07:45', checkOut: '16:45', status: 'Hadir', location: 'Proyek Bandung' },
  { id: generateId(), employeeId: 'EMP009', employeeName: 'Hendra Gunawan', date: '2026-05-09', checkIn: '', checkOut: '', status: 'Absen', location: '-' },
];

function buildShiftSeeds(): ShiftSchedule[] {
  const weekDates = getWeekDates(0);
  const employees = SEED_EMPLOYEES.filter(e => e.status === 'Aktif').slice(0, 7);
  const shifts: ShiftSchedule[] = [];
  const shiftPatterns = [
    { shift: 'Pagi' as const, startTime: '07:00', endTime: '15:00' },
    { shift: 'Malam' as const, startTime: '23:00', endTime: '07:00' },
    { shift: 'Libur' as const },
    { shift: 'Pagi' as const, startTime: '07:00', endTime: '15:00' },
    { shift: 'Pagi' as const, startTime: '07:00', endTime: '15:00' },
    { shift: 'Libur' as const },
    { shift: 'Libur' as const },
  ];

  employees.forEach((emp, empIdx) => {
    weekDates.forEach((date, dayIdx) => {
      const patternIdx = (empIdx + dayIdx) % shiftPatterns.length;
      const pattern = shiftPatterns[patternIdx];
      shifts.push({
        id: generateId(),
        employeeId: emp.id,
        employeeName: emp.name,
        date: toDateString(date),
        shift: pattern.shift,
        startTime: pattern.startTime,
        endTime: pattern.endTime,
      });
    });
  });
  return shifts;
}

export const SEED_SHIFTS = buildShiftSeeds();

export const SEED_LEAVES: LeaveRequest[] = [
  { id: generateId(), employeeId: 'EMP004', employeeName: 'Dewi Lestari', type: 'Cuti', startDate: '2026-05-11', endDate: '2026-05-12', reason: 'Keperluan keluarga', status: 'Disetujui', submittedAt: '2026-05-08T09:00:00Z' },
  { id: generateId(), employeeId: 'EMP009', employeeName: 'Hendra Gunawan', type: 'Izin', startDate: '2026-05-11', endDate: '2026-05-11', reason: 'Urusan pribadi mendesak', status: 'Disetujui', submittedAt: '2026-05-10T14:00:00Z' },
  { id: generateId(), employeeId: 'EMP005', employeeName: 'Rizki Fauzan', type: 'Sakit', startDate: '2026-05-09', endDate: '2026-05-09', reason: 'Demam tinggi', status: 'Disetujui', submittedAt: '2026-05-09T07:30:00Z' },
  { id: generateId(), employeeId: 'EMP010', employeeName: 'Maya Sari', type: 'Cuti', startDate: '2026-05-20', endDate: '2026-05-22', reason: 'Liburan tahunan', status: 'Pending', submittedAt: '2026-05-10T10:00:00Z' },
  { id: generateId(), employeeId: 'EMP007', employeeName: 'Agus Wirawan', type: 'Izin', startDate: '2026-05-14', endDate: '2026-05-14', reason: 'Acara keluarga', status: 'Pending', submittedAt: '2026-05-11T08:00:00Z' },
  { id: generateId(), employeeId: 'EMP001', employeeName: 'Andi Kusuma', type: 'Cuti', startDate: '2026-04-28', endDate: '2026-04-30', reason: 'Liburan Hari Raya', status: 'Disetujui', submittedAt: '2026-04-20T09:00:00Z' },
  { id: generateId(), employeeId: 'EMP003', employeeName: 'Budi Santoso', type: 'Izin', startDate: '2026-05-05', endDate: '2026-05-05', reason: 'Keperluan bank', status: 'Ditolak', submittedAt: '2026-05-04T11:00:00Z' },
  { id: generateId(), employeeId: 'EMP008', employeeName: 'Putri Amaliya', type: 'Sakit', startDate: '2026-05-07', endDate: '2026-05-08', reason: 'Flu berat', status: 'Ditolak', submittedAt: '2026-05-07T06:00:00Z' },
];

export const SEED_OVERTIME: OvertimeRequest[] = [
  { id: generateId(), employeeId: 'EMP001', employeeName: 'Andi Kusuma', date: '2026-05-09', startTime: '17:00', endTime: '20:00', totalHours: 3, reason: 'Penyelesaian fitur login aplikasi', status: 'Disetujui', submittedAt: '2026-05-09T16:00:00Z' },
  { id: generateId(), employeeId: 'EMP005', employeeName: 'Rizki Fauzan', date: '2026-05-08', startTime: '17:00', endTime: '19:30', totalHours: 2.5, reason: 'Deploy server produksi', status: 'Disetujui', submittedAt: '2026-05-08T15:00:00Z' },
  { id: generateId(), employeeId: 'EMP009', employeeName: 'Hendra Gunawan', date: '2026-05-10', startTime: '17:00', endTime: '21:00', totalHours: 4, reason: 'Rapat proyek dengan klien', status: 'Pending', submittedAt: '2026-05-10T16:00:00Z' },
  { id: generateId(), employeeId: 'EMP003', employeeName: 'Budi Santoso', date: '2026-05-07', startTime: '17:00', endTime: '18:30', totalHours: 1.5, reason: 'Closing laporan keuangan bulanan', status: 'Disetujui', submittedAt: '2026-05-07T16:30:00Z' },
  { id: generateId(), employeeId: 'EMP004', employeeName: 'Dewi Lestari', date: '2026-05-06', startTime: '17:00', endTime: '20:00', totalHours: 3, reason: 'Evaluasi kinerja tim', status: 'Ditolak', submittedAt: '2026-05-06T16:00:00Z' },
];

export const SEED_REIMBURSEMENTS: ReimbursementRequest[] = [
  { id: generateId(), employeeId: 'EMP007', employeeName: 'Agus Wirawan', date: '2026-05-08', category: 'Transport', amount: 250000, description: 'Biaya perjalanan ke proyek Bandung (PP)', status: 'Disetujui', paymentStatus: 'Sudah Dibayar', submittedAt: '2026-05-08T18:00:00Z' },
  { id: generateId(), employeeId: 'EMP009', employeeName: 'Hendra Gunawan', date: '2026-05-09', category: 'Makan', amount: 175000, description: 'Makan siang rapat klien', status: 'Disetujui', paymentStatus: 'Belum Dibayar', submittedAt: '2026-05-09T19:00:00Z' },
  { id: generateId(), employeeId: 'EMP001', employeeName: 'Andi Kusuma', date: '2026-05-07', category: 'Peralatan', amount: 850000, description: 'Pembelian keyboard mekanikal untuk WFH', status: 'Pending', paymentStatus: 'Belum Dibayar', submittedAt: '2026-05-07T10:00:00Z' },
  { id: generateId(), employeeId: 'EMP010', employeeName: 'Maya Sari', date: '2026-05-06', category: 'Peralatan', amount: 1200000, description: 'Langganan software desain Figma Pro', status: 'Pending', paymentStatus: 'Belum Dibayar', submittedAt: '2026-05-06T11:00:00Z' },
  { id: generateId(), employeeId: 'EMP005', employeeName: 'Rizki Fauzan', date: '2026-05-05', category: 'Transport', amount: 120000, description: 'Taksi saat lembur malam', status: 'Disetujui', paymentStatus: 'Sudah Dibayar', submittedAt: '2026-05-05T22:00:00Z' },
  { id: generateId(), employeeId: 'EMP003', employeeName: 'Budi Santoso', date: '2026-05-04', category: 'Lainnya', amount: 50000, description: 'Pembelian ATK kantor', status: 'Ditolak', paymentStatus: 'Belum Dibayar', submittedAt: '2026-05-04T14:00:00Z' },
];

export const SEED_REPORTS: FieldReport[] = [
  {
    id: generateId(), employeeId: 'EMP007', employeeName: 'Agus Wirawan',
    title: 'Progres Pembangunan Fondasi Proyek Bandung',
    description: 'Pekerjaan fondasi bangunan utama telah selesai 80%. Tim telah menyelesaikan pengecoran kolom lantai 1 dan 2. Cuaca mendukung sehingga pekerjaan berjalan lancar. Estimasi penyelesaian fondasi total pada akhir minggu ini.',
    location: 'Proyek Bandung, Jl. Soekarno-Hatta Km 5',
    mediaUrls: [], datetime: '2026-05-11T10:30:00Z',
    comments: [
      { id: generateId(), commenterName: 'Dewi Lestari', comment: 'Bagus! Pastikan kualitas beton dicek ulang sebelum pengecoran berikutnya.', timestamp: '2026-05-11T11:00:00Z' },
      { id: generateId(), commenterName: 'Hendra Gunawan', comment: 'Mantap, pertahankan ritme kerjanya. Kirim foto dokumentasi lengkap ya.', timestamp: '2026-05-11T11:30:00Z' },
    ],
  },
  {
    id: generateId(), employeeId: 'EMP009', employeeName: 'Hendra Gunawan',
    title: 'Rapat Koordinasi Proyek dengan PT Maju Jaya',
    description: 'Rapat koordinasi berjalan lancar. Pihak klien menyetujui revisi jadwal pengiriman material dari minggu ke-3 menjadi minggu ke-4 Mei. Beberapa poin teknis terkait spesifikasi besi beton sudah dikonfirmasi dan akan segera diproses.',
    location: 'Kantor PT Maju Jaya, Jl. Asia Afrika No. 12, Bandung',
    mediaUrls: [], datetime: '2026-05-10T14:00:00Z',
    comments: [
      { id: generateId(), commenterName: 'Siti Rahayu', comment: 'Terima kasih infonya. Tolong kirim MOM-nya ke email HR ya.', timestamp: '2026-05-10T15:00:00Z' },
    ],
  },
  {
    id: generateId(), employeeId: 'EMP007', employeeName: 'Agus Wirawan',
    title: 'Inspeksi Material Bangunan Gudang',
    description: 'Inspeksi rutin material di gudang penyimpanan. Ditemukan beberapa semen yang mendekati tanggal kedaluwarsa. Rekomendasi: segera gunakan stok lama sebelum yang baru. Kondisi gudang secara umum baik, ventilasi memadai.',
    location: 'Gudang Material, Jl. Industri No. 7, Bekasi',
    mediaUrls: [], datetime: '2026-05-09T09:15:00Z',
    comments: [],
  },
  {
    id: generateId(), employeeId: 'EMP004', employeeName: 'Dewi Lestari',
    title: 'Evaluasi Kinerja Tim Operasional Q1 2026',
    description: 'Evaluasi kinerja tim operasional kuartal pertama 2026 telah selesai dilakukan. Dari 12 KPI yang ditetapkan, 9 KPI berhasil tercapai (75%). Tiga KPI yang belum tercapai terkait efisiensi penggunaan material dan ketepatan waktu pengiriman.',
    location: 'Ruang Rapat Lantai 3, Kantor Pusat Jakarta',
    mediaUrls: [], datetime: '2026-05-08T16:00:00Z',
    comments: [
      { id: generateId(), commenterName: 'Siti Rahayu', comment: 'Laporan sudah diterima. Akan dibahas dalam rapat manajemen minggu depan.', timestamp: '2026-05-08T16:45:00Z' },
    ],
  },
  {
    id: generateId(), employeeId: 'EMP001', employeeName: 'Andi Kusuma',
    title: 'Update Sistem Absensi Digital',
    description: 'Pengembangan modul absensi digital telah selesai. Fitur GPS tracking, upload foto, dan sinkronisasi realtime sudah berfungsi normal. Telah dilakukan UAT dengan 5 user dan hasilnya memuaskan. Siap untuk deployment ke server produksi.',
    location: 'WFH — Jakarta Selatan',
    mediaUrls: [], datetime: '2026-05-07T17:30:00Z',
    comments: [
      { id: generateId(), commenterName: 'Hendra Gunawan', comment: 'Oke, koordinasi dengan tim IT untuk jadwal deploy.', timestamp: '2026-05-07T18:00:00Z' },
      { id: generateId(), commenterName: 'Dewi Lestari', comment: 'Bagus! Pastikan ada backup data sebelum deploy.', timestamp: '2026-05-07T18:15:00Z' },
    ],
  },
];

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: generateId(), title: 'Libur Nasional Hari Kebangkitan Nasional', content: 'Diberitahukan kepada seluruh karyawan PT Adiyasa Abadi bahwa pada tanggal 20 Mei 2026 merupakan Hari Kebangkitan Nasional. Seluruh karyawan diliburkan. Bagi karyawan yang bertugas pada hari tersebut akan mendapatkan kompensasi lembur sesuai peraturan perusahaan.', publishDate: '2026-05-11', priority: 'Tinggi', authorName: 'Siti Rahayu (HR)' },
  { id: generateId(), title: 'Pengumuman Jadwal Medical Check-Up Karyawan', content: 'Dalam rangka menjaga kesehatan seluruh karyawan, perusahaan akan mengadakan Medical Check-Up (MCU) gratis pada tanggal 25-26 Mei 2026 di Klinik Utama Sehat, Jl. Sudirman No. 10, Jakarta. Pendaftaran dilakukan melalui aplikasi HR PTAA mulai 15 Mei 2026.', publishDate: '2026-05-10', priority: 'Normal', authorName: 'Siti Rahayu (HR)' },
  { id: generateId(), title: 'Kebijakan Baru: Peraturan Kehadiran dan Keterlambatan', content: 'Efektif 1 Juni 2026, perusahaan memberlakukan kebijakan baru terkait kehadiran. Toleransi keterlambatan maksimal 15 menit. Setiap keterlambatan melebihi batas akan dikenakan potongan gaji sesuai SK Direksi No. 2026/05/001. Mohon seluruh karyawan memperhatikan dan mematuhi kebijakan ini.', publishDate: '2026-05-08', priority: 'Tinggi', authorName: 'Manajemen PT Adiyasa Abadi' },
  { id: generateId(), title: 'Pelatihan K3 (Keselamatan dan Kesehatan Kerja)', content: 'Pelatihan K3 wajib akan diselenggarakan pada tanggal 18 Mei 2026 pukul 08.00-17.00 WIB di Aula Lantai 5. Peserta wajib hadir adalah seluruh karyawan departemen Operasional dan lapangan. Absensi pelatihan akan dicatat dan menjadi bagian dari penilaian kinerja.', publishDate: '2026-05-06', priority: 'Normal', authorName: 'Departemen HSE' },
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: generateId(), type: 'leave_approval', title: 'Pengajuan Cuti Disetujui', message: 'Pengajuan cuti Anda pada 11-12 Mei 2026 telah disetujui oleh HR Manager.', timestamp: '2026-05-08T10:00:00Z', isRead: false },
  { id: generateId(), type: 'attendance_reminder', title: 'Pengingat Absensi', message: 'Jangan lupa untuk melakukan check-in sebelum pukul 08.30 hari ini.', timestamp: '2026-05-11T07:00:00Z', isRead: false },
  { id: generateId(), type: 'overtime_approval', title: 'Lembur Disetujui', message: 'Pengajuan lembur Anda pada 9 Mei 2026 (3 jam) telah disetujui.', timestamp: '2026-05-09T17:30:00Z', isRead: false },
  { id: generateId(), type: 'shift_update', title: 'Update Jadwal Shift', message: 'Jadwal shift Anda untuk minggu depan telah diperbarui. Silakan cek di halaman Jadwal Shift.', timestamp: '2026-05-10T15:00:00Z', isRead: true },
  { id: generateId(), type: 'reimbursement_update', title: 'Reimbursement Diproses', message: 'Pengajuan reimbursement Anda sebesar Rp250.000 telah disetujui dan akan dibayarkan.', timestamp: '2026-05-08T14:00:00Z', isRead: true },
  { id: generateId(), type: 'report_comment', title: 'Komentar Baru pada Laporan', message: 'Dewi Lestari menambahkan komentar pada laporan lapangan Anda.', timestamp: '2026-05-11T11:00:00Z', isRead: false },
  { id: generateId(), type: 'leave_approval', title: 'Pengajuan Izin Disetujui', message: 'Izin Anda pada 11 Mei 2026 telah disetujui.', timestamp: '2026-05-10T14:30:00Z', isRead: true },
  { id: generateId(), type: 'attendance_reminder', title: 'Absen Terdeteksi', message: 'Sistem mendeteksi Anda belum melakukan check-out kemarin. Mohon konfirmasi ke HR.', timestamp: '2026-05-10T18:00:00Z', isRead: true },
];

export const SEED_PAYROLL: PayrollRecord[] = SEED_EMPLOYEES.filter(e => e.status === 'Aktif').map((emp) => {
  const baseSalaryMap: Record<string, number> = {
    'EMP001': 8500000, 'EMP002': 12000000, 'EMP003': 7500000,
    'EMP004': 11000000, 'EMP005': 9000000, 'EMP007': 6500000,
    'EMP008': 14000000, 'EMP009': 15000000, 'EMP010': 8000000,
  };
  const basic = baseSalaryMap[emp.id] || 6000000;
  const meal = 750000;
  const transport = 500000;
  const late = emp.id === 'EMP003' || emp.id === 'EMP010' ? 50000 : 0;
  const absence = 0;
  const overtime = emp.id === 'EMP001' ? 127500 : emp.id === 'EMP005' ? 106250 : emp.id === 'EMP003' ? 56250 : 0;
  const bonus = emp.id === 'EMP009' ? 1000000 : emp.id === 'EMP002' ? 500000 : 0;
  const reimb = emp.id === 'EMP007' ? 250000 : emp.id === 'EMP009' ? 175000 : emp.id === 'EMP005' ? 120000 : 0;
  const total = basic + meal + transport - late - absence + overtime + bonus + reimb;
  return {
    id: generateId(), employeeId: emp.id, employeeName: emp.name,
    department: emp.department, month: 'Mei 2026',
    basicSalary: basic, mealAllowance: meal, transportAllowance: transport,
    lateDeduction: late, absenceDeduction: absence, overtimePay: overtime,
    bonus, reimbursement: reimb, totalSalary: total,
  };
});

export const SEED_USERS: AppUser[] = [
  { id: 'EMP001', name: 'Andi Kusuma', email: 'andi@company.com', role: 'Karyawan', status: 'Aktif' },
  { id: 'EMP002', name: 'Siti Rahayu', email: 'siti@company.com', role: 'HR', status: 'Aktif' },
  { id: 'EMP003', name: 'Budi Santoso', email: 'budi@company.com', role: 'Finance', status: 'Aktif' },
  { id: 'EMP004', name: 'Dewi Lestari', email: 'dewi@company.com', role: 'Manager', status: 'Aktif' },
  { id: 'EMP005', name: 'Rizki Fauzan', email: 'rizki@company.com', role: 'Karyawan', status: 'Aktif' },
  { id: 'EMP006', name: 'Nurul Hidayah', email: 'nurul@company.com', role: 'Karyawan', status: 'Nonaktif' },
  { id: 'EMP007', name: 'Agus Wirawan', email: 'agus@company.com', role: 'Karyawan', status: 'Aktif' },
  { id: 'EMP008', name: 'Putri Amaliya', email: 'putri@company.com', role: 'Karyawan', status: 'Aktif' },
];
