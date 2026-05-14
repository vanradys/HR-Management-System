import { useState, type ChangeEvent } from 'react';
import { Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MobileMenuButton } from './Sidebar';
import { useLocation } from 'wouter';
import type { AuthState } from '@/types/types';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ScrollArea } from "@/components/ui/scroll-area";

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/karyawan': 'Manajemen Karyawan',
  '/absensi': 'Absensi',
  '/shift': 'Jadwal Shift',
  '/cuti-izin': 'Cuti & Izin',
  '/lembur': 'Lembur',
  '/reimbursement': 'Reimbursement',
  '/laporan': 'Laporan Lapangan',
  '/pengumuman': 'Pengumuman',
  '/notifikasi': 'Notifikasi',
  '/payroll': 'Penggajian',
  '/pengaturan': 'Pengaturan',
};

interface HeaderProps {
  auth: AuthState;
  unreadCount: number;
  onLogout: () => void;
  onOpenSidebar: () => void;
}

export function Header({ auth, unreadCount, onLogout, onOpenSidebar }: HeaderProps) {
  const [location, navigate] = useLocation();

  const {
    notifications,
    markRead,
  } = useNotifications();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [departmentEmail, setDepartmentEmail] = useState(auth.email);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [joinDate] = useState('01-01-2024');

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePhoto(URL.createObjectURL(file));
  };

  const title = Object.entries(PAGE_TITLES).find(([path]) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  })?.[1] || 'HR PTAA';

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <MobileMenuButton onClick={onOpenSidebar} />
        <div>
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <Bell className="w-5 h-5 text-gray-700" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-[380px] p-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
              <h3 className="font-bold text-gray-900">
                Notifications
              </h3>
            </div>

            {/* BODY */}
            <ScrollArea className="h-[420px]">
              <div className="divide-y">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    Tidak ada notifikasi.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        markRead(notif.id);

                        if (notif.link) {
                          navigate(notif.link);
                        }
                      }}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition ${!notif.isRead
                        ? "bg-blue-50/60"
                        : "bg-white"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* DOT */}
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        )}

                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">
                            {notif.title}
                          </p>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            {notif.timestamp}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              data-testid="button-user-menu"
            >
              <EmployeeAvatar name={auth.name || 'Admin'} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{auth.name || 'Administrator'}</p>
                <p className="text-xs text-gray-500 leading-tight">{auth.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">{auth.name}</p>
              <div className="mt-1">
                <StatusBadge status={auth.role} />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowEditProfile(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Perbarui profil Anda, termasuk foto profil dan email departemen.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  value={auth.name}
                  disabled
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Foto Profile</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <EmployeeAvatar name={auth.name || 'Admin'} size="md" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-sm text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={auth.role}
                  disabled
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Departemen</label>
                <input
                  type="email"
                  value={departmentEmail}
                  onChange={(e) => setDepartmentEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Karyawan sejak</label>
                <p className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {joinDate}
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="rounded-xl bg-[#001E8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#00166b]"
              >
                Simpan
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}