import { useEffect, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import type { AppUser, UserRole } from '@/types/types';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { useToast } from '@/hooks/use-toast';

type MenuItem =
  | 'Dashboard'
  | 'Karyawan'
  | 'Absensi'
  | 'Shift'
  | 'Cuti & Izin'
  | 'Lembur'
  | 'Reimbursement'
  | 'Laporan'
  | 'Pengumuman'
  | 'Payroll'
  | 'Pengaturan';

const MENU_ITEMS: MenuItem[] = [
  'Dashboard',
  'Karyawan',
  'Absensi',
  'Shift',
  'Cuti & Izin',
  'Lembur',
  'Reimbursement',
  'Laporan',
  'Pengumuman',
  'Payroll',
  'Pengaturan',
];

const ROLES = [
  'Admin',
  'Director',
  'HR',
  'Finance',
  'GA',
  'Marketing',
  'Engineering',
  'Production',
  'Logistic',
  'Purchasing',
] as const;

type PermissionRow = {
  id: number;
  menu: MenuItem;
  role: UserRole;
  canAccess: boolean;
};

const roleColor: Record<UserRole, string> = {
  Admin: 'bg-red-100 text-red-700',
  Director: 'bg-red-100 text-red-700',
  HR: 'bg-blue-100 text-blue-700',
  Finance: 'bg-green-100 text-green-700',
  GA: 'bg-yellow-100 text-yellow-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Engineering: 'bg-purple-100 text-purple-700',
  Production: 'bg-orange-100 text-orange-700',
  Logistic: 'bg-cyan-100 text-cyan-700',
  Purchasing: 'bg-emerald-100 text-emerald-700',
};

export default function Pengaturan() {
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const [users, setUsers] = useState<AppUser[]>([]);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('hrptaa_token');

    if (!token) {
      toast({
        title: 'Gagal',
        description: 'Token tidak ditemukan. Silakan login ulang.',
      });
      return;
    }

    async function fetchData() {
      try {
        const [permRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/permissions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!permRes.ok || !userRes.ok) {
          throw new Error('Fetch settings failed');
        }

        const [permissions, usersData] = await Promise.all([
          permRes.json(),
          userRes.json(),
        ]);

        setPermissionRows(permissions);
        setUsers(usersData.map((user: any) => ({
          ...user,
          id: String(user.id),
        })));
      } catch (err) {
        console.error(err);
        toast({
          title: 'Gagal',
          description: 'Gagal mengambil data dari server.',
        });
      }
    }

    fetchData();
  }, [API_URL, toast]);

  async function handleRoleChange(id: string, role: UserRole) {
    const token = localStorage.getItem('hrptaa_token');

    if (!token) {
      toast({
        title: 'Gagal',
        description: 'Token tidak ditemukan. Silakan login ulang.',
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui role pengguna');
      }

      const updatedUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

      toast({
        title: 'Berhasil',
        description: 'Role pengguna berhasil diperbarui.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Gagal',
        description: 'Role pengguna gagal diperbarui.',
      });
    }
  }

  async function handleStatusChange(id: string) {
    const token = localStorage.getItem('hrptaa_token');
    const user = users.find((u) => u.id === id);

    if (!token || !user) {
      toast({
        title: 'Gagal',
        description: 'Token atau pengguna tidak tersedia.',
      });
      return;
    }

    const nextStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui status pengguna');
      }

      const updatedUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

      toast({
        title: 'Berhasil',
        description: 'Status pengguna berhasil diperbarui.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Gagal',
        description: 'Status pengguna gagal diperbarui.',
      });
    }
  }


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Hak Akses per Role</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Tampilan hak akses menu berdasarkan role pengguna
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-44">
                  Menu
                </th>
                {ROLES.map((role) => (
                  <th
                    key={role}
                    className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                  >
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${roleColor[role]}`}
                    >
                      {role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MENU_ITEMS.map((menu) => (
                <tr key={menu} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{menu}</td>
                  {ROLES.map((role) => {
                    const hasAccess =
                      role === 'Admin' ||
                      role === 'Director' ||
                      permissionRows.some(
                        (p) => p.menu === menu && p.role === role && p.canAccess
                      );

                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        <div className="mx-auto flex justify-center">
                          {hasAccess ? (
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <Minus className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Daftar Pengguna</h3>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Pengguna', 'Email', 'Role', 'Status', 'Aksi'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                  data-testid={`row-user-${user.id}`}
                >
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
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
                      data-testid={`select-role-${user.id}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        roleColor[user.role] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleStatusChange(user.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        user.status === 'Aktif'
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
    </div>
  );
}