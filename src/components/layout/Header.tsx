import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
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
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => navigate('/notifikasi')}
          data-testid="button-header-notif"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#E30613' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

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