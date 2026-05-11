import { useState } from 'react';
import { useLocation } from 'wouter';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AuthState } from '@/types/types';
import { useNotifications } from '@/hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
  auth: AuthState;
  onLogout: () => void;
}

export function Layout({ children, auth, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        role={auth.role}
        unreadCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          auth={auth}
          unreadCount={unreadCount}
          onLogout={onLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
