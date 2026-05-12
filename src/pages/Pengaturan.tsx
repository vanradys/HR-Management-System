import { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AppUser, UserRole } from '@/types/types';
import { SEED_USERS } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { useToast } from '@/hooks/use-toast';

type MenuItem = 'Dashboard' | 'Karyawan' | 'Absensi' | 'Shift' | 'Cuti & Izin' | 'Lembur' | 'Reimbursement' | 'Laporan' | 'Pengumuman' | 'Notifikasi' | 'Payroll' | 'Pengaturan';

const MENU_ITEMS: MenuItem[] = ['Dashboard', 'Absensi', 'Shift', 'Cuti & Izin', 'Lembur', 'Reimbursement', 'Laporan', 'Pengumuman', 'Notifikasi', 'Payroll', 'Pengaturan'];
const ROLES = [
  'Director',
  'Admin',
  'Accounting',
  'Supervisor',
  'Purchasing',
  'GA',
  'Marketing',
  'Engineering',
  'Production',
  'Logistic',
] as const;

type PermissionRole = typeof ROLES[number];

const DEFAULT_PERMISSIONS: Record<MenuItem, PermissionRole[]> = {
  Dashboard: ['Director', 'Admin', 'Accounting', 'Purchasing', 'GA', 'Marketing', 'Engineering', 'Production', 'Logistic'],
  Karyawan: ['Director', 'Admin', 'Accounting'],
  Absensi: ['Director', 'Admin', 'Accounting', 'GA'],
  Shift: ['Director', 'Admin', 'Accounting', 'Production', 'Logistic'],
  'Cuti & Izin': ['Director', 'Admin', 'Accounting', 'GA'],
  Lembur: ['Director', 'Admin', 'Accounting', 'Purchasing', 'Engineering', 'Production', 'Logistic'],
  Reimbursement: ['Director', 'Admin', 'Supervisor', 'Purchasing', 'GA', 'Marketing', 'Engineering', 'Production', 'Logistic'],
  Laporan: ['Director', 'Admin', 'Accounting', 'GA', 'Purchasing', 'Marketing', 'Engineering', 'Production', 'Logistic'],
  Pengumuman: ['Director', 'Admin', 'Accounting', 'GA', 'Purchasing', 'Marketing', 'Engineering', 'Production', 'Logistic'],
  Notifikasi: ['Director', 'Admin', 'Accounting', 'Purchasing', 'GA', 'Marketing', 'Engineering', 'Production', 'Logistic'],
  Payroll: ['Director', 'Admin', 'Accounting', 'Purchasing'],
  Pengaturan: ['Director', 'Admin', 'Accounting'],
};

export default function Pengaturan() {
  const { toast } = useToast();
  const [users, setUsers] = useLocalStorage<AppUser[]>('hrptaa_users', SEED_USERS);
  const [permissions, setPermissions] = useLocalStorage<Record<MenuItem, PermissionRole[]>>(
    'hrptaa_permissions',
    DEFAULT_PERMISSIONS
  );

  function handleRoleChange(id: string, role: UserRole) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    toast({ title: 'Berhasil', description: 'Role pengguna berhasil diperbarui.' });
  }

  function handleStatusChange(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : u));
    toast({ title: 'Berhasil', description: 'Status pengguna berhasil diperbarui.' });
  }

  function handlePermissionToggle(menu: MenuItem, role: PermissionRole) {
    if (role === 'Admin' || role === 'Director') {
      toast({
        title: 'Tidak bisa diubah',
        description: 'Admin dan Director wajib memiliki akses ke semua fitur.',
      });
      return;
    }

    setPermissions(prev => {
      const currentRoles = prev[menu] || [];
      const hasAccess = currentRoles.includes(role);

      return {
        ...prev,
        [menu]: hasAccess
          ? currentRoles.filter(r => r !== role)
          : [...currentRoles, role],
      };
    });

    toast({
      title: 'Berhasil',
      description: 'Hak akses role berhasil diperbarui.',
    });
  }

  const roleColor: Record<string, string> = {
    Director: "bg-red-100 text-red-700",
    Accounting: "bg-blue-100 text-blue-700",
    Purchasing: "bg-green-100 text-green-700",
    GA: "bg-yellow-100 text-yellow-700",
    Marketing: "bg-pink-100 text-pink-700",
    Engineering: "bg-purple-100 text-purple-700",
    Production: "bg-orange-100 text-orange-700",
    Logistic: "bg-cyan-100 text-cyan-700",
    Karyawan: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      {/* Permission matrix */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Hak Akses per Role</h3>
          <p className="text-sm text-gray-500 mt-0.5">Matriks hak akses menu berdasarkan role pengguna</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Menu</th>
                {ROLES.map(role => (
                  <th key={role} className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${roleColor[role]}`}>
                      {role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MENU_ITEMS.map(menu => (
                <tr key={menu} className="hover:bg-gray-50 transition-colors" data-testid={`row-perm-${menu}`}>
                  <td className="px-5 py-3 font-medium text-gray-800">{menu}</td>
                  {ROLES.map(role => {
                    const hasAccess = permissions[menu]?.includes(role);
                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handlePermissionToggle(menu, role)}
                          disabled={role === 'Admin' || role === 'Director'}
                          className="mx-auto flex justify-center disabled:cursor-not-allowed disabled:opacity-80"
                        >
                          {hasAccess ? (
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <Minus className="w-3.5 h-3.5 text-gray-400" />
                            </div>
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

      {/* User list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Daftar Pengguna</h3>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Pengguna', 'Email', 'Role', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-user-${user.id}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <EmployeeAvatar name={user.name} size="sm" />
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-sm">{user.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
                      data-testid={`select-role-${user.id}`}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${roleColor[user.role]}`}>
                    {user.role}
                  </span></td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleStatusChange(user.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${user.status === 'Aktif'
                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                      data-testid={`button-toggle-status-${user.id}`}
                    >
                      {user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}
