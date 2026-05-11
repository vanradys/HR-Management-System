import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Employee } from '@/types/types';
import { SEED_EMPLOYEES } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatDate, generateId } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';

const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Operasional', 'Marketing', 'Legal'];

const EMPTY_FORM: Omit<Employee, 'id'> = {
  name: '', nik: '', department: 'IT', position: '', employmentStatus: 'Tetap',
  phone: '', email: '', address: '', joinDate: '', status: 'Aktif',
};

export default function Karyawan() {
  const { toast } = useToast();
  const [employees, setEmployees] = useLocalStorage<Employee[]>('hrptaa_employees', SEED_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.nik.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase());
      const matchDept = !filterDept || e.department === filterDept;
      const matchStatus = !filterStatus || e.status === filterStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, filterDept, filterStatus]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditTarget(emp);
    const { id, ...rest } = emp;
    setForm(rest);
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.nik || !form.position || !form.email) {
      toast({ title: 'Gagal', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }
    if (editTarget) {
      setEmployees(prev => prev.map(e => e.id === editTarget.id ? { ...form, id: editTarget.id } : e));
      toast({ title: 'Berhasil', description: `Data karyawan ${form.name} telah diperbarui.` });
    } else {
      const newEmp: Employee = { ...form, id: 'EMP' + Date.now() };
      setEmployees(prev => [...prev, newEmp]);
      toast({ title: 'Berhasil', description: `Karyawan ${form.name} berhasil ditambahkan.` });
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
    toast({ title: 'Berhasil', description: `Karyawan ${deleteTarget.name} telah dihapus.` });
    setDeleteTarget(null);
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Karyawan</h2>
          <p className="text-sm text-gray-500">{employees.filter(e => e.status === 'Aktif').length} karyawan aktif</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E30613' }}
          data-testid="button-tambah-karyawan"
        >
          <Plus className="w-4 h-4" /> Tambah Karyawan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, NIK, atau email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            data-testid="input-search-karyawan"
          />
        </div>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
          data-testid="select-filter-dept"
        >
          <option value="">Semua Departemen</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
          data-testid="select-filter-status"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Karyawan', 'NIK', 'Departemen', 'Jabatan', 'Status Kepegawaian', 'Kontak', 'Bergabung', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Tidak ada data karyawan</td></tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-karyawan-${emp.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <EmployeeAvatar name={emp.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{emp.nik}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.position}</td>
                  <td className="px-4 py-3"><StatusBadge status={emp.employmentStatus} /></td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600 text-xs">{emp.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{formatDate(emp.joinDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(emp)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-testid={`button-edit-${emp.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`button-delete-${emp.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-900">
                {editTarget ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nama Lengkap *', key: 'name', type: 'text' },
                { label: 'NIK *', key: 'nik', type: 'text' },
                { label: 'Jabatan *', key: 'position', type: 'text' },
                { label: 'Email *', key: 'email', type: 'email' },
                { label: 'No. Telepon', key: 'phone', type: 'tel' },
                { label: 'Tanggal Bergabung', key: 'joinDate', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form] as string}
                    onChange={f(key as keyof typeof form)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                    data-testid={`input-${key}`}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                <select value={form.department} onChange={f('department')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepegawaian</label>
                <select value={form.employmentStatus} onChange={f('employmentStatus')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white">
                  {['Tetap', 'Kontrak', 'Magang'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={f('status')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white">
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={form.address}
                  onChange={f('address')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
                  data-testid="input-address"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-simpan-karyawan">
                {editTarget ? 'Simpan Perubahan' : 'Tambah Karyawan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Hapus Karyawan</h3>
            <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700" data-testid="button-konfirmasi-hapus">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
