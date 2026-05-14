import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Karyawan from "@/pages/Karyawan";
import Absensi from "@/pages/Absensi";
import Shift from "@/pages/Shift";
import CutiIzin from "@/pages/CutiIzin";
import Lembur from "@/pages/Lembur";
import Reimbursement from "@/pages/Reimbursement";
import EmployeeReimbursement from "@/pages/Ers";
import Laporan from "@/pages/Laporan";
import Pengumuman from "@/pages/Pengumuman";
import Notifikasi from "@/pages/Notifikasi";
import Payroll from "@/pages/Payroll";
import Pengaturan from "@/pages/Pengaturan";
import LaporanHarian from "@/pages/LaporanHarian";
import Chat from "@/pages/Chat";

import {
  SEED_EMPLOYEES, SEED_ATTENDANCE, SEED_SHIFTS, SEED_LEAVES,
  SEED_OVERTIME, SEED_REIMBURSEMENTS, SEED_REPORTS, SEED_ANNOUNCEMENTS,
  SEED_NOTIFICATIONS, SEED_PAYROLL, SEED_USERS,
} from "@/data/seedData";
import { getFromStorage, setToStorage } from "@/hooks/useLocalStorage";

// Initialize localStorage with seed data on first load
const SEEDS: Array<[string, unknown]> = [
  ["hrptaa_employees", SEED_EMPLOYEES],
  ["hrptaa_attendance", SEED_ATTENDANCE],
  ["hrptaa_shifts", SEED_SHIFTS],
  ["hrptaa_leaves", SEED_LEAVES],
  ["hrptaa_overtime", SEED_OVERTIME],
  ["hrptaa_reimbursements", SEED_REIMBURSEMENTS],
  ["hrptaa_reports", SEED_REPORTS],
  ["hrptaa_announcements", SEED_ANNOUNCEMENTS],
  ["hrptaa_notifications", SEED_NOTIFICATIONS],
  ["hrptaa_payroll", SEED_PAYROLL],
  ["hrptaa_users", SEED_USERS],
];

SEEDS.forEach(([key, data]) => {
  if (!getFromStorage(key, null)) {
    setToStorage(key, data);
  }
});

const queryClient = new QueryClient();

function AppRouter() {
  const { auth, login, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!auth.isLoggedIn) {
    return (
      <>
        <Login onLogin={login} />
        <Toaster />
      </>
    );
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <Layout auth={auth} onLogout={handleLogout}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/karyawan" component={Karyawan} />
        <Route path="/absensi" component={Absensi} />
        <Route path="/shift" component={Shift} />
        <Route path="/cuti-izin" component={CutiIzin} />
        <Route path="/lembur" component={Lembur} />
        <Route path="/reimbursement" component={Reimbursement} />
        <Route path="/employee-reimbursement" component={EmployeeReimbursement} />
        <Route path="/laporan" component={Laporan} />
        <Route path="/pengumuman" component={Pengumuman} />
        <Route path="/notifikasi" component={Notifikasi} />
        <Route path="/payroll" component={Payroll} />
        <Route path="/pengaturan" component={Pengaturan} />
        <Route path="/laporan-harian" component={LaporanHarian} />
        <Route path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
