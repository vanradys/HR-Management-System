import { useMemo } from 'react';
import { Users, Clock, AlertTriangle, FileText, Timer, CheckSquare, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Attendance, Employee, LeaveRequest, OvertimeRequest } from '@/types/types';
import { SEED_EMPLOYEES, SEED_ATTENDANCE, SEED_LEAVES, SEED_OVERTIME } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatDateTime, formatCurrency } from '@/utils/helpers';

const chartData = [
  { hari: 'Sen', hadir: 8, terlambat: 1, absen: 1 },
  { hari: 'Sel', hadir: 9, terlambat: 0, absen: 1 },
  { hari: 'Rab', hadir: 7, terlambat: 2, absen: 1 },
  { hari: 'Kam', hadir: 8, terlambat: 1, absen: 1 },
  { hari: 'Jum', hadir: 9, terlambat: 1, absen: 0 },
  { hari: 'Sab', hadir: 4, terlambat: 0, absen: 0 },
  { hari: 'Min', hadir: 0, terlambat: 0, absen: 0 },
];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon: Icon, color, bg, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [employees] = useLocalStorage<Employee[]>('hrptaa_employees', SEED_EMPLOYEES);
  const [attendance] = useLocalStorage<Attendance[]>('hrptaa_attendance', SEED_ATTENDANCE);
  const [leaves] = useLocalStorage<LeaveRequest[]>('hrptaa_leaves', SEED_LEAVES);
  const [overtime] = useLocalStorage<OvertimeRequest[]>('hrptaa_overtime', SEED_OVERTIME);

  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const todayAttendance = attendance.filter(a => a.date === today);
    const hadir = todayAttendance.filter(a => a.status === 'Hadir').length;
    const terlambat = todayAttendance.filter(a => a.status === 'Terlambat').length;
    const cuti = todayAttendance.filter(a => ['Cuti', 'Izin', 'Sakit'].includes(a.status)).length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const pendingOvertime = overtime.filter(o => o.status === 'Pending').length;
    const totalPending = pendingLeaves + pendingOvertime;

    return {
      totalKaryawan: employees.filter(e => e.status === 'Aktif').length,
      hadir: hadir + terlambat,
      terlambat,
      cutiIzin: cuti + leaves.filter(l => l.status === 'Disetujui' && l.startDate === today).length,
      lembur: overtime.filter(o => o.date === today).length,
      pendingApproval: totalPending,
    };
  }, [employees, attendance, leaves, overtime, today]);

  const recentAttendance = attendance.slice(0, 6);
  const pendingItems = [
    ...leaves.filter(l => l.status === 'Pending').slice(0, 3).map(l => ({ ...l, kind: 'Cuti/Izin' })),
    ...overtime.filter(o => o.status === 'Pending').slice(0, 3).map(o => ({ ...o, kind: 'Lembur' })),
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-xl px-6 py-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #001E8A 0%, #0029c8 100%)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ backgroundColor: '#E30613' }} />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm">Selamat datang kembali,</p>
          <h2 className="text-xl font-bold text-white mt-0.5">HR PTAA — PT Adiyasa Abadi</h2>
          <p className="text-blue-200 text-sm mt-1">
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Karyawan" value={stats.totalKaryawan} icon={Users} color="text-blue-600" bg="bg-blue-50" trend="+2 bulan ini" trendUp />
        <StatCard title="Hadir Hari Ini" value={stats.hadir} icon={CheckSquare} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Terlambat" value={stats.terlambat} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Cuti / Izin" value={stats.cutiIzin} icon={FileText} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Lembur Hari Ini" value={stats.lembur} icon={Timer} color="text-orange-600" bg="bg-orange-50" />
        <StatCard title="Menunggu Persetujuan" value={stats.pendingApproval} icon={Clock} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Charts + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Rekap Absensi Minggu Ini</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="hadir" name="Hadir" fill="#001E8A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="terlambat" name="Terlambat" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="absen" name="Absen" fill="#E30613" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Menunggu Persetujuan</h3>
          {pendingItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Tidak ada item menunggu</div>
          ) : (
            <div className="space-y-2.5">
              {pendingItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <EmployeeAvatar name={item.employeeName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.employeeName}</p>
                    <p className="text-xs text-gray-500">{item.kind}</p>
                  </div>
                  <StatusBadge status="Pending" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent attendance */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Absensi Terkini</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Karyawan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jam Masuk</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jam Keluar</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <EmployeeAvatar name={rec.employeeName} size="sm" />
                      <span className="font-medium text-gray-900">{rec.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{rec.date}</td>
                  <td className="px-5 py-3 text-gray-600">{rec.checkIn || '-'}</td>
                  <td className="px-5 py-3 text-gray-600">{rec.checkOut || '-'}</td>
                  <td className="px-5 py-3"><StatusBadge status={rec.status} /></td>
                  <td className="px-5 py-3 text-gray-500 text-xs max-w-32 truncate">{rec.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
