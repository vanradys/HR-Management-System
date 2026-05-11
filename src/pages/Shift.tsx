import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ShiftSchedule, ShiftType } from '@/types/types';
import { SEED_SHIFTS, SEED_EMPLOYEES } from '@/data/seedData';
import { generateId, getWeekDates, toDateString } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SHIFT_TYPES: ShiftType[] = ['Pagi', 'Malam', 'Libur', 'Cuti', 'Izin'];

const SHIFT_COLORS: Record<ShiftType, string> = {
  Pagi: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  Malam: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
  Libur: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
  Cuti: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  Izin: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  '-': 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100',
};

const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface ModalState {
  open: boolean;
  employeeId: string;
  employeeName: string;
  date: string;
  shift: ShiftType;
  startTime: string;
  endTime: string;
  existingId?: string;
}

const EMPTY_MODAL: ModalState = {
  open: false, employeeId: '', employeeName: '', date: '',
  shift: 'Pagi', startTime: '07:00', endTime: '15:00',
};

export default function Shift() {
  const { toast } = useToast();
  const [shifts, setShifts] = useLocalStorage<ShiftSchedule[]>('hrptaa_shifts', SEED_SHIFTS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState<ModalState>(EMPTY_MODAL);

  const weekDates = getWeekDates(weekOffset);
  const employees = SEED_EMPLOYEES.filter(e => e.status === 'Aktif').slice(0, 8);

  function getShift(employeeId: string, date: string): ShiftSchedule | undefined {
    return shifts.find(s => s.employeeId === employeeId && s.date === date);
  }

  function openModal(emp: typeof employees[0], date: Date) {
    const dateStr = toDateString(date);
    const existing = getShift(emp.id, dateStr);
    setModal({
      open: true,
      employeeId: emp.id,
      employeeName: emp.name,
      date: dateStr,
      shift: existing?.shift || '-',
      startTime: existing?.startTime || '07:00',
      endTime: existing?.endTime || '15:00',
      existingId: existing?.id,
    });
  }

  function openNewModal() {
    setModal({ ...EMPTY_MODAL, open: true, date: toDateString(weekDates[0]) });
  }

  function handleSave() {
    const noTime = ['Libur', 'Cuti', 'Izin', '-'].includes(modal.shift);
    if (modal.existingId) {
      setShifts(prev => prev.map(s => s.id === modal.existingId
        ? { ...s, shift: modal.shift, startTime: noTime ? undefined : modal.startTime, endTime: noTime ? undefined : modal.endTime }
        : s
      ));
    } else {
      const newShift: ShiftSchedule = {
        id: generateId(), employeeId: modal.employeeId, employeeName: modal.employeeName,
        date: modal.date, shift: modal.shift,
        startTime: noTime ? undefined : modal.startTime,
        endTime: noTime ? undefined : modal.endTime,
      };
      setShifts(prev => [...prev, newShift]);
    }
    setModal(EMPTY_MODAL);
    toast({ title: 'Jadwal Disimpan', description: `Shift ${modal.employeeName} pada ${modal.date} berhasil diperbarui.` });
  }

  const noTime = ['Libur', 'Cuti', 'Izin', '-'].includes(modal.shift);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Jadwal Shift</h2>
          <p className="text-sm text-gray-500">Klik sel shift untuk mengatur jadwal</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#E30613' }}
          data-testid="button-atur-jadwal"
        >
          <Plus className="w-4 h-4" /> Atur Jadwal
        </button>
      </div>

      {/* Week navigator */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            data-testid="button-prev-week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">
              {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(weekDates[0])} –{' '}
              {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(weekDates[6])}
            </p>
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            data-testid="button-next-week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(SHIFT_COLORS) as ShiftType[]).filter(k => k !== '-').map(s => (
            <span key={s} className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', SHIFT_COLORS[s].split('hover:')[0])}>
              {s}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-36">Karyawan</th>
                {weekDates.map((date, i) => (
                  <th key={i} className="text-center px-2 py-2 text-xs font-semibold min-w-20">
                    <div className={cn('text-gray-500', toDateString(date) === toDateString(new Date()) && 'text-blue-700')}>
                      {DAY_NAMES[i]}
                    </div>
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold',
                      toDateString(date) === toDateString(new Date())
                        ? 'text-white'
                        : 'text-gray-700'
                    )}
                      style={toDateString(date) === toDateString(new Date()) ? { backgroundColor: '#E30613' } : {}}
                    >
                      {date.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-800 truncate max-w-20">{emp.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  {weekDates.map((date, di) => {
                    const sched = getShift(emp.id, toDateString(date));
                    const shiftVal: ShiftType = sched?.shift || '-';
                    return (
                      <td key={di} className="px-1 py-1.5 text-center">
                        <button
                          onClick={() => openModal(emp, date)}
                          className={cn(
                            'w-full px-1.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer',
                            SHIFT_COLORS[shiftVal]
                          )}
                          data-testid={`cell-shift-${emp.id}-${di}`}
                          title={`${emp.name} — ${toDateString(date)}`}
                        >
                          {shiftVal}
                          {sched?.startTime && !['Libur', 'Cuti', 'Izin', '-'].includes(shiftVal) && (
                            <div className="text-[10px] opacity-70 mt-0.5">{sched.startTime}</div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-900">Atur Jadwal Shift</h3>
              <button onClick={() => setModal(EMPTY_MODAL)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Karyawan</label>
                <select
                  value={modal.employeeId}
                  onChange={e => {
                    const emp = SEED_EMPLOYEES.find(em => em.id === e.target.value);
                    setModal(m => ({ ...m, employeeId: e.target.value, employeeName: emp?.name || '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                  data-testid="select-shift-employee"
                >
                  {SEED_EMPLOYEES.filter(e => e.status === 'Aktif').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={modal.date}
                  onChange={e => setModal(m => ({ ...m, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  data-testid="input-shift-date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Shift</label>
                <div className="grid grid-cols-3 gap-2">
                  {SHIFT_TYPES.map(s => (
                    <button
                      key={s}
                      onClick={() => setModal(m => ({ ...m, shift: s }))}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                        modal.shift === s ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      )}
                      data-testid={`button-shift-${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={modal.startTime}
                    onChange={e => setModal(m => ({ ...m, startTime: e.target.value }))}
                    disabled={noTime}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                    data-testid="input-start-time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={modal.endTime}
                    onChange={e => setModal(m => ({ ...m, endTime: e.target.value }))}
                    disabled={noTime}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                    data-testid="input-end-time"
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModal(EMPTY_MODAL)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-simpan-jadwal">
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
