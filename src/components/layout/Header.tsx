import { Bell, ChevronDown, LogOut, Settings, } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MobileMenuButton } from './Sidebar';
import { useLocation } from 'wouter';
import type { AuthState } from '@/types/types';
import { canAccessSettings } from '@/utils/permissions';
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

              <button
                onClick={() => navigate("/pengaturan")}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
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
                      }}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition ${!notif.isRead ? "bg-blue-50/60" : "bg-white"
                        }`}
                    >
                      <div className="flex items-start gap-3">
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
              onClick={() => {
                if (canAccessSettings(auth.role)) {
                  navigate('/pengaturan');
                } else {
                  alert('Pengaturan hanya bisa diakses oleh Admin.');
                }
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
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
      </div>
    </header>
  );
}