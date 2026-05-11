import { useState, useMemo } from 'react';
import { Search, Filter, Clock, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Attendance } from '@/types/types';
import { SEED_ATTENDANCE } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { generateId, getCurrentDatetime } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';

const STATUSES = ['Hadir', 'Terlambat', 'Cuti', 'Sakit', 'Absen', 'Izin'];

export default function Absensi() {
  const { toast } = useToast();
  const [attendance, setAttendance] = useLocalStorage<Attendance[]>('hrptaa_attendance', SEED_ATTENDANCE);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [checkedIn, setCheckedIn] = useState(() => {
    const myRecord = attendance.find(a => a.employeeId === 'EMP001' && a.date === today);
    return !!myRecord?.checkIn;
  });

  function handleCheckIn() {
    const existing = attendance.find(a => a.employeeId === 'EMP001' && a.date === today);
    if (existing) {
      setAttendance(prev => prev.map(a => a.id === existing.id ? { ...a, checkIn: nowTime, status: nowTime > '08:30' ? 'Terlambat' : 'Hadir' } : a));
    } else {
      const newRec: Attendance = {
        id: generateId(), employeeId: 'EMP001', employeeName: 'Administrator',
        date: today, checkIn: nowTime, checkOut: '', status: nowTime > '08:30' ? 'Terlambat' : 'Hadir',
        location: 'Kantor Pusat, Jakarta',
      };
      setAttendance(prev => [newRec, ...prev]);
    }
    setCheckedIn(true);
    toast({ title: 'Check-in Berhasil', description: `Absensi masuk pukul ${nowTime} berhasil dicatat.` });
  }

  function handleCheckOut() {
    setAttendance(prev => prev.map(a => a.employeeId === 'EMP001' && a.date === today ? { ...a, checkOut: nowTime } : a));
    toast({ title: 'Check-out Berhasil', description: `Absensi keluar pukul ${nowTime} berhasil dicatat.` });
  }

  const filtered = useMemo(() => {
    return attendance.filter(a => {
      const matchSearch = !search || a.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchDate = !filterDate || a.date === filterDate;
      const matchStatus = !filterStatus || a.status === filterStatus;
      return matchSearch && matchDate && matchStatus;
    });
  }, [attendance, search, filterDate, filterStatus]);

  const todayStats = useMemo(() => {
    const today2 = attendance.filter(a => a.date === today);
    return {
      hadir: today2.filter(a => a.status === 'Hadir').length,
      terlambat: today2.filter(a => a.status === 'Terlambat').length,
      cuti: today2.filter(a => ['Cuti', 'Sakit', 'Izin'].includes(a.status)).length,
      absen: today2.filter(a => a.status === 'Absen').length,
    };
  }, [attendance, today]);

  return (
    <div className="space-y-5">
      {/* Check-in/out card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Absensi Hari Ini — {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCheckIn}
            disabled={checkedIn}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#001E8A' }}
            data-testid="button-check-in"
          >
            <Clock className="w-4 h-4" />
            {checkedIn ? 'Sudah Check-in' : 'Check-in Sekarang'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!checkedIn}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E30613' }}
            data-testid="button-check-out"
          >
            <CheckCircle className="w-4 h-4" />
            Check-out Sekarang
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Hadir', value: todayStats.hadir, color: 'text-green-600' },
            { label: 'Terlambat', value: todayStats.terlambat, color: 'text-amber-600' },
            { label: 'Cuti/Izin', value: todayStats.cuti, color: 'text-blue-600' },
            { label: 'Absen', value: todayStats.absen, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama karyawan..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            data-testid="input-search-absensi"
          />
        </div>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
          data-testid="input-filter-date"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
          data-testid="select-filter-status-absensi"
        >
          <option value="">Semua Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterDate || filterStatus) && (
          <button onClick={() => { setSearch(''); setFilterDate(''); setFilterStatus(''); }} className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} data ditemukan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Karyawan', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Lokasi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Tidak ada data absensi</td></tr>
              ) : filtered.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-absensi-${rec.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <EmployeeAvatar name={rec.employeeName} size="sm" />
                      <span className="font-medium text-gray-900">{rec.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rec.date}</td>
                  <td className="px-4 py-3">
                    {rec.checkIn ? <span className="font-mono text-green-700 font-medium">{rec.checkIn}</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {rec.checkOut ? <span className="font-mono text-blue-700 font-medium">{rec.checkOut}</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-40 truncate">{rec.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
