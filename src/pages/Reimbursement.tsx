import { useState } from 'react';
import { Plus, X, Check, XCircle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import type { ReimbursementRequest } from '@/types/types';
import { SEED_REIMBURSEMENTS } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatDate, formatCurrency, generateId, getCurrentDatetime } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Transport', 'Makan', 'Kesehatan', 'Peralatan', 'Lainnya'] as const;

export default function Reimbursement() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [reimbursements, setReimbursements] = useLocalStorage<ReimbursementRequest[]>('hrptaa_reimbursements', SEED_REIMBURSEMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    date: '', category: 'Transport' as typeof CATEGORIES[number], amount: '', description: '',
  });

  const totalApproved = reimbursements.filter(r => r.status === 'Disetujui').reduce((s, r) => s + r.amount, 0);
  const totalPaid = reimbursements.filter(r => r.paymentStatus === 'Sudah Dibayar').reduce((s, r) => s + r.amount, 0);

  function handleSubmit() {
    if (!form.date || !form.amount || !form.description) {
      toast({ title: 'Gagal', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }
    const newReq: ReimbursementRequest = {
      id: generateId(), employeeId: 'EMP001', employeeName: 'Administrator',
      date: form.date, category: form.category,
      amount: parseInt(form.amount.replace(/\D/g, ''), 10) || 0,
      description: form.description, status: 'Pending',
      paymentStatus: 'Belum Dibayar', submittedAt: getCurrentDatetime(),
    };
    setReimbursements(prev => [newReq, ...prev]);
    addNotification('reimbursement_update', 'Reimbursement Dikirim', `Pengajuan reimbursement ${formatCurrency(newReq.amount)} sedang diproses.`);
    toast({ title: 'Berhasil', description: 'Pengajuan reimbursement berhasil dikirim.' });
    setModalOpen(false);
    setForm({ date: '', category: 'Transport', amount: '', description: '' });
  }

  function handleApprove(id: string) {
    setReimbursements(prev => prev.map(r => r.id === id ? { ...r, status: 'Disetujui' } : r));
    addNotification('reimbursement_update', 'Reimbursement Disetujui', 'Pengajuan reimbursement Anda telah disetujui dan akan segera dibayarkan.');
    toast({ title: 'Disetujui', description: 'Reimbursement berhasil disetujui.' });
  }

  function handleMarkPaid(id: string) {
    setReimbursements(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: 'Sudah Dibayar' } : r));
    toast({ title: 'Dibayar', description: 'Status pembayaran diperbarui.' });
  }

  function handleReject(id: string) {
    setReimbursements(prev => prev.map(r => r.id === id ? { ...r, status: 'Ditolak' } : r));
    toast({ title: 'Ditolak', description: 'Pengajuan reimbursement ditolak.', variant: 'destructive' });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Reimbursement</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-ajukan-reimb">
          <Plus className="w-4 h-4" /> Ajukan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Disetujui', value: formatCurrency(totalApproved), color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Sudah Dibayar', value: formatCurrency(totalPaid), color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Menunggu Persetujuan', value: reimbursements.filter(r => r.status === 'Pending').length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
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
                {['Karyawan', 'Tanggal', 'Kategori', 'Jumlah', 'Keterangan', 'Status', 'Pembayaran', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reimbursements.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Tidak ada data reimbursement</td></tr>
              ) : reimbursements.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-reimb-${r.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <EmployeeAvatar name={r.employeeName} size="sm" />
                      <span className="font-medium text-gray-900">{r.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(r.date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.category} /></td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(r.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-40 truncate" title={r.description}>{r.description}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(r.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Setujui" data-testid={`button-approve-reimb-${r.id}`}><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleReject(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Tolak" data-testid={`button-reject-reimb-${r.id}`}><XCircle className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                      {r.status === 'Disetujui' && r.paymentStatus === 'Belum Dibayar' && (
                        <button onClick={() => handleMarkPaid(r.id)} className="px-2 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200" data-testid={`button-bayar-${r.id}`}>Bayar</button>
                      )}
                    </div>
                  </td>
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
              <h3 className="text-base font-semibold text-gray-900">Ajukan Reimbursement</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pengeluaran *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-reimb-date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, category: c }))}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${form.category === c ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      data-testid={`cat-${c}`}
                    >{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  data-testid="input-reimb-amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Jelaskan keperluan pengeluaran..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none" data-testid="input-reimb-desc" />
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-submit-reimb">
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
