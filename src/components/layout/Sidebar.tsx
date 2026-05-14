import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Users, Clock, Calendar, FileText, Timer,
  Receipt, MapPin, Megaphone, DollarSign, Settings, X, Menu,
  ChevronRight, MessageCircle,
} from 'lucide-react';
import type { UserRole } from '@/types/types';
import { cn } from '@/lib/utils';

const logoSrc = new URL('../../assets/adiyasa-logo.png', import.meta.url).href;

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
}

const ALL_ROLES: UserRole[] = [
  'Admin',
  'Director',
  'Finance',
  'Purchasing',
  'GA',
  'Finance',
  'HR',
  'Marketing',
  'Engineering',
  'Production',
  'Logistic',
];

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, allowedRoles: ALL_ROLES },
  { label: 'Karyawan', path: '/karyawan', icon: Users, allowedRoles: ['Admin', 'Director', 'Finance'] },
  { label: 'Pengumuman', path: '/pengumuman', icon: Megaphone, allowedRoles: ALL_ROLES },
  { label: 'Absensi', path: '/absensi', icon: Clock, allowedRoles: ALL_ROLES },
  { label: 'Jadwal Shift', path: '/shift', icon: Calendar, allowedRoles: ALL_ROLES },
  { label: 'Cuti & Izin', path: '/cuti-izin', icon: FileText, allowedRoles: ALL_ROLES },
  { label: 'Lembur', path: '/lembur', icon: Timer, allowedRoles: ALL_ROLES },
  { label: 'Reimbursement', path: '/reimbursement', icon: Receipt, allowedRoles: ['Admin', 'Director', 'HR', 'Finance'] },
  { label: 'Reimbursement Saya', path: '/employee-reimbursement', icon: Receipt, allowedRoles: ['Purchasing', 'Engineering', 'Marketing', 'Production', 'GA', 'Logistic' ] },
  { label: 'Laporan Lapangan', path: '/laporan', icon: MapPin, allowedRoles: ALL_ROLES },
  { label: 'Laporan Harian', path: '/laporan-harian', icon: FileText, allowedRoles: ALL_ROLES },
  { label: 'Chat', path: '/chat', icon: MessageCircle, allowedRoles: ALL_ROLES },
  { label: 'Penggajian', path: '/payroll', icon: DollarSign, allowedRoles: ALL_ROLES },
  { label: 'Pengaturan', path: '/pengaturan', icon: Settings, allowedRoles: ['Admin'] },
];

interface SidebarProps {
  role: UserRole;
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, unreadCount, isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const visibleItems = NAV_ITEMS.filter(item => item.allowedRoles.includes(role));

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: '#001E8A' }}
      >
        {/* Top red accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: '#E30613' }} />

        {/* Logo */}
        <div id="logo-area" className="flex items-center justify-between px-5 py-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="Adiyasa logo" className="w-14 h-14 object-contain" />
            <div>
              <div className="text-white font-black text-xl tracking-widest leading-none">ADIYASA</div>
              <div className="text-xs font-semibold tracking-wider mt-0.5" style={{ color: '#E30613' }}>HR PTAA</div>
            </div>
          </div>
          <button
            className="lg:hidden text-white/70 hover:text-white p-1"
            onClick={onClose}
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path} onClick={onClose}>
                <div
                  data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                  className={cn(
                    'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 group',
                    active
                      ? 'text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                  style={active ? { backgroundColor: '#E30613' } : undefined}
                >
                  <item.icon className={cn('w-4.5 h-4.5 flex-shrink-0', active ? 'text-white' : 'text-white/70 group-hover:text-white')} />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/60 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom version */}
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-white/40 text-xs">PT Adiyasa Abadi v1.0</p>
        </div>
      </aside>
    </>
  );
}

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
      onClick={onClick}
      data-testid="button-open-sidebar"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}