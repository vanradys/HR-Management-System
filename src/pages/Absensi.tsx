import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  MapPin,
  Camera
} from 'lucide-react';
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
  const [currentLocation, setCurrentLocation] = useState('');
const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
function getLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setCurrentLocation(`${lat}, ${lng}`);
    },
    (error) => {
      console.log(error);

      toast({
        title: 'GPS gagal',
        description: 'Lokasi tidak bisa diakses.',
      });
    }
  );
}

const OFFICE_LAT = -6.3387789;
const OFFICE_LNG = 107.0490620;
const MAX_RADIUS_METERS = 150;

function getDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getAddressFromCoordinates(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    const data = await res.json();
    return data.display_name || "Alamat tidak ditemukan";
  } catch {
    return "Alamat tidak ditemukan";
  }
}

  function handleCheckIn() {
  if (!selfiePreview) {
    toast({
      title: "Selfie wajib diisi",
      description: "Silakan upload selfie terlebih dahulu sebelum check-in.",
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const distance = getDistanceInMeters(
        lat,
        lng,
        OFFICE_LAT,
        OFFICE_LNG
      );

      if (distance > MAX_RADIUS_METERS) {
        toast({
          title: "Anda tidak berada di kantor",
          description: `Lokasi Anda terlalu jauh dari PT Adiyasa Abadi. Jarak: ${Math.round(
            distance
          )} meter.`,
        });
        return;
      }

      const address = await getAddressFromCoordinates(lat, lng);
      const locationText = `${address} | Koordinat: ${lat}, ${lng}`;

      setCurrentLocation(locationText);

      const existing = attendance.find(
        (a) => a.employeeId === "EMP001" && a.date === today
      );

      if (existing) {
        setAttendance((prev) =>
          prev.map((a) =>
            a.id === existing.id
              ? {
                  ...a,
                  checkIn: nowTime,
                  status: nowTime > "08:30" ? "Terlambat" : "Hadir",
                  location: locationText,
                }
              : a
          )
        );
      } else {
        const newRec: Attendance = {
          id: generateId(),
          employeeId: "EMP001",
          employeeName: "Administrator",
          date: today,
          checkIn: nowTime,
          checkOut: "",
          status: nowTime > "08:30" ? "Terlambat" : "Hadir",
          location: locationText,
        };

        setAttendance((prev) => [newRec, ...prev]);
      }

      setCheckedIn(true);

      toast({
        title: "Check-in Berhasil",
        description: `Absensi masuk pukul ${nowTime} berhasil dicatat.`,
      });
    },
    () => {
      toast({
        title: "GPS wajib aktif",
        description: "Aktifkan lokasi/GPS terlebih dahulu sebelum check-in.",
      });
    }
  );
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
      cuti: today2.filter(a => a.status === 'Cuti').length,
      izin: today2.filter(a => a.status === 'Izin').length,
      sakit: today2.filter(a => a.status === 'Sakit').length,
      absen: today2.filter(a => a.status === 'Absen').length,
    };
  }, [attendance, today]);

  return (
    <div className="space-y-5">
      {/* Check-in/out card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Absensi Hari Ini — {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</h3>
        
        <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Selfie Absensi
  </label>

  <input
    type="file"
    accept="image/*"
    capture="user"
    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }}
  />

  {selfiePreview && (
    <img
      src={selfiePreview}
      alt="Preview Selfie"
      className="mt-3 w-32 h-32 rounded-xl object-cover border border-gray-200"
    />
  )}
</div>

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
        <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
  <div className="flex items-start gap-3">
    <MapPin className="w-5 h-5 text-green-600 mt-0.5" />

    <div>
      <p className="text-sm font-semibold text-gray-800">
        GPS dan Geofencing
      </p>

      <p className="text-xs text-gray-500 mt-1">
        Sistem otomatis mencatat lokasi absensi secara real-time.
      </p>

      <p className="text-xs text-gray-500 mt-2">
        Lokasi sekarang:
      </p>

      <p className="text-xs font-mono text-gray-700 mt-1">
        {currentLocation || 'Belum terdeteksi'}
      </p>
    </div>
  </div>
</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Hadir', value: todayStats.hadir, color: 'text-green-600' },
            { label: 'Terlambat', value: todayStats.terlambat, color: 'text-amber-600' },
            { label: 'Cuti', value: todayStats.cuti, color: 'text-blue-600' },
            { label: 'Izin', value: todayStats.izin, color: 'text-cyan-600' },
            { label: 'Sakit', value: todayStats.sakit, color: 'text-purple-600' },
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
