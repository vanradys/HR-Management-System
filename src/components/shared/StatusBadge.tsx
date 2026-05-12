import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, string> = {
  // Attendance
  Hadir: 'bg-green-100 text-green-800 border-green-200',
  Terlambat: 'bg-amber-100 text-amber-800 border-amber-200',
  Cuti: 'bg-blue-100 text-blue-800 border-blue-200',
  Sakit: 'bg-purple-100 text-purple-800 border-purple-200',
  Absen: 'bg-red-100 text-red-800 border-red-200',
  Izin: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  // General
  Aktif: 'bg-green-100 text-green-800 border-green-200',
  Nonaktif: 'bg-gray-100 text-gray-600 border-gray-200',
  // Request status
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Disetujui: 'bg-green-100 text-green-800 border-green-200',
  Ditolak: 'bg-red-100 text-red-800 border-red-200',
  // Payment
  'Sudah Dibayar': 'bg-green-100 text-green-800 border-green-200',
  'Belum Dibayar': 'bg-orange-100 text-orange-800 border-orange-200',
  // Employment
  Tetap: 'bg-blue-100 text-blue-800 border-blue-200',
  Kontrak: 'bg-orange-100 text-orange-800 border-orange-200',
  Magang: 'bg-purple-100 text-purple-800 border-purple-200',
  // Priority
  Tinggi: 'bg-red-100 text-red-800 border-red-200',
  Normal: 'bg-blue-100 text-blue-800 border-blue-200',
  Rendah: 'bg-gray-100 text-gray-600 border-gray-200',
  // Shift
  Pagi: 'bg-green-100 text-green-800 border-green-200',
  Malam: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Libur: 'bg-gray-100 text-gray-600 border-gray-200',
  // Role
  Admin: 'bg-red-100 text-red-800 border-red-200',
  HR: 'bg-blue-100 text-blue-800 border-blue-200',
  Purchasing: 'bg-green-100 text-green-800 border-green-200',
  Manager: 'bg-purple-100 text-purple-800 border-purple-200',
  Karyawan: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span
      data-testid={`badge-status-${status}`}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
}
