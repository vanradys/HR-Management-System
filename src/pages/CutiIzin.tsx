import { useState, useMemo } from 'react';
import { Plus, X, Check, XCircle, FileText } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import type { LeaveRequest } from '@/types/types';
import { SEED_LEAVES } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatDate, generateId, getCurrentDatetime } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { canApproveRequest } from '@/utils/permissions';

type FilterType = 'Semua' | 'Pending' | 'Disetujui' | 'Ditolak';

export default function CutiIzin() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { auth } = useAuth();
  const canManageAction = canApproveRequest(auth.role);
  const [leaves, setLeaves] = useLocalStorage<LeaveRequest[]>('hrptaa_leaves', SEED_LEAVES);
  const [filter, setFilter] = useState<FilterType>('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'Cuti' as 'Cuti' | 'Izin' | 'Sakit', startDate: '', endDate: '', reason: '' });

  const counts = useMemo(() => ({
    Pending: leaves.filter(l => l.status === 'Pending').length,
    Disetujui: leaves.filter(l => l.status === 'Disetujui').length,
    Ditolak: leaves.filter(l => l.status === 'Ditolak').length,
  }), [leaves]);

  const filtered = useMemo(() => {
    if (filter === 'Semua') return leaves;
    return leaves.filter(l => l.status === filter);
  }, [leaves, filter]);

  function handleSubmit() {
    if (!form.startDate || !form.endDate || !form.reason) {
      toast({ title: 'Gagal', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }
    const newReq: LeaveRequest = {
      id: generateId(), employeeId: 'EMP001', employeeName: 'Administrator',
      type: form.type, startDate: form.startDate, endDate: form.endDate,
      reason: form.reason, status: 'Pending', submittedAt: getCurrentDatetime(),
    };
    setLeaves(prev => [newReq, ...prev]);
    addNotification('leave_approval', 'Pengajuan Diterima', `Pengajuan ${form.type} Anda sedang menunggu persetujuan.`,'/cuti-izin');
    toast({ title: 'Berhasil', description: `Pengajuan ${form.type} berhasil dikirim.` });
    setModalOpen(false);
    setForm({ type: 'Cuti', startDate: '', endDate: '', reason: '' });
  }

  function handleApprove(id: string) {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Disetujui' } : l));
    addNotification('leave_approval', 'Cuti/Izin Disetujui', 'Pengajuan cuti/izin Anda telah disetujui oleh atasan.','/cuti-izin');
    toast({ title: 'Disetujui', description: 'Pengajuan berhasil disetujui.' });
  }

  function handleReject(id: string) {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Ditolak' } : l));
    toast({ title: 'Ditolak', description: 'Pengajuan telah ditolak.', variant: 'destructive' });
  }

  const FILTER_TABS: FilterType[] = ['Semua', 'Pending', 'Disetujui', 'Ditolak'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Cuti & Izin</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#E30613' }}
          data-testid="button-ajukan"
        >
          <Plus className="w-4 h-4" /> Ajukan
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: counts.Pending, bg: 'bg-amber-50', border: 'border-amber-200', num: 'text-amber-700', icon: '⏳' },
          { label: 'Disetujui', count: counts.Disetujui, bg: 'bg-green-50', border: 'border-green-200', num: 'text-green-700', icon: '✓' },
          { label: 'Ditolak', count: counts.Ditolak, bg: 'bg-red-50', border: 'border-red-200', num: 'text-red-700', icon: '✗' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-5 text-center`} data-testid={`card-${card.label.toLowerCase()}`}>
            <p className={`text-4xl font-black ${card.num}`}>{card.count}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === f
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            style={filter === f ? { backgroundColor: '#001E8A' } : {}}
            data-testid={`filter-${f}`}
          >
            {f}
            {f !== 'Semua' && <span className="ml-1.5 text-xs opacity-70">({counts[f as keyof typeof counts] ?? 0})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Karyawan', 'Jenis', 'Mulai', 'Selesai', 'Keterangan', 'Diajukan', 'Status', ...(canManageAction ? ['Aksi'] : [])].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={canManageAction ? 8 : 7} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-leave-${req.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <EmployeeAvatar name={req.employeeName} size="sm" />
                      <span className="font-medium text-gray-900">{req.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={req.type} /></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(req.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(req.endDate)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-40 truncate" title={req.reason}>{req.reason}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(req.submittedAt.split('T')[0])}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  {canManageAction && (
                    <td className="px-4 py-3">
                      {req.status === 'Pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Setujui"
                            data-testid={`button-approve-${req.id}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Tolak"
                            data-testid={`button-reject-${req.id}`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-900">Ajukan Cuti / Izin</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pengajuan</label>
                <div className="flex gap-2">
                  {(['Cuti', 'Izin', 'Sakit'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${form.type === t ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      data-testid={`type-${t}`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-start-date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-end-date" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Alasan *</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3}
                  placeholder="Jelaskan alasan pengajuan..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
                  data-testid="input-reason"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700">Upload dokumen pendukung (opsional) akan segera tersedia.</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-submit-cuti">
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
