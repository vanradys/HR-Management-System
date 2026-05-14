import { useState, useMemo } from 'react';
import { Plus, X, Check, XCircle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import type { OvertimeRequest } from '@/types/types';
import { SEED_OVERTIME } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatDate, generateId, getCurrentDatetime, calculateHours } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { canApproveRequest } from '@/utils/permissions';

export default function Lembur() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { auth } = useAuth();
  const canManageAction = canApproveRequest(auth.role);
  const [overtime, setOvertime] = useLocalStorage<OvertimeRequest[]>('hrptaa_overtime', SEED_OVERTIME);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: '', startTime: '17:00', endTime: '20:00', reason: '' });

  const stats = useMemo(() => ({
    pending: overtime.filter(o => o.status === 'Pending').length,
    disetujui: overtime.filter(o => o.status === 'Disetujui').length,
    totalJam: overtime.filter(o => o.status === 'Disetujui').reduce((s, o) => s + o.totalHours, 0),
  }), [overtime]);

  function handleSubmit() {
    if (!form.date || !form.startTime || !form.endTime || !form.reason) {
      toast({ title: 'Gagal', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }
    const totalHours = calculateHours(form.startTime, form.endTime);
    const newReq: OvertimeRequest = {
      id: generateId(), employeeId: 'EMP001', employeeName: 'Administrator',
      date: form.date, startTime: form.startTime, endTime: form.endTime,
      totalHours, reason: form.reason, status: 'Pending', submittedAt: getCurrentDatetime(),
    };
    setOvertime(prev => [newReq, ...prev]);
    addNotification('overtime_approval', 'Pengajuan Lembur Dikirim', `Pengajuan lembur ${totalHours} jam sedang menunggu persetujuan.`,'/lembur');
    toast({ title: 'Berhasil', description: `Pengajuan lembur ${totalHours} jam berhasil dikirim.` });
    setModalOpen(false);
    setForm({ date: '', startTime: '17:00', endTime: '20:00', reason: '' });
  }

  function handleApprove(id: string) {
    setOvertime(prev => prev.map(o => o.id === id ? { ...o, status: 'Disetujui' } : o));
    addNotification('overtime_approval', 'Lembur Disetujui', 'Pengajuan lembur Anda telah disetujui.','/lembur');
    toast({ title: 'Disetujui', description: 'Pengajuan lembur berhasil disetujui.' });
  }

  function handleReject(id: string) {
    setOvertime(prev => prev.map(o => o.id === id ? { ...o, status: 'Ditolak' } : o));
    toast({ title: 'Ditolak', description: 'Pengajuan lembur ditolak.', variant: 'destructive' });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Lembur</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-ajukan-lembur">
          <Plus className="w-4 h-4" /> Ajukan Lembur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Menunggu Persetujuan', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Disetujui Bulan Ini', value: stats.disetujui, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Total Jam Lembur', value: `${stats.totalJam}j`, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-medium text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Karyawan', 'Tanggal', 'Mulai', 'Selesai', 'Total Jam', 'Alasan', 'Status', ...(canManageAction ? ['Aksi'] : [])].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {overtime.length === 0 ? (
                <tr><td colSpan={canManageAction ? 8 : 7} className="text-center py-10 text-gray-400">Tidak ada data lembur</td></tr>
              ) : overtime.map(ot => (
                <tr key={ot.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-lembur-${ot.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <EmployeeAvatar name={ot.employeeName} size="sm" />
                      <span className="font-medium text-gray-900">{ot.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(ot.date)}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-700">{ot.startTime}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-700">{ot.endTime}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-blue-700">{ot.totalHours}j</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-40 truncate" title={ot.reason}>{ot.reason}</td>
                  <td className="px-4 py-3"><StatusBadge status={ot.status} /></td>
                  {canManageAction && (
                    <td className="px-4 py-3">
                      {ot.status === 'Pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleApprove(ot.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Setujui" data-testid={`button-approve-lembur-${ot.id}`}><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleReject(ot.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Tolak" data-testid={`button-reject-lembur-${ot.id}`}><XCircle className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-900">Ajukan Lembur</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lembur *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-lembur-date" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai *</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-lembur-start" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai *</label>
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-lembur-end" />
                </div>
              </div>
              {form.startTime && form.endTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 font-medium">
                    Estimasi lembur: <strong>{calculateHours(form.startTime, form.endTime)} jam</strong>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Lembur *</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3}
                  placeholder="Jelaskan alasan dan pekerjaan yang akan dilakukan..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
                  data-testid="input-lembur-reason"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-submit-lembur">
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
