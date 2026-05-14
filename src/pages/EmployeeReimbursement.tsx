import { useMemo, useState } from "react";
import { Calendar, CreditCard, FileText, Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

type UserRole =
  | "Admin"
  | "HRD"
  | "Director"
  | "Purchasing"
  | "Engineering"
  | "Marketing"
  | "Accounting"
  | "Production"
  | "Warehouse"
  | "GA";

type CurrentUser = {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  department: string;
};

type ReimbursementStatus = "Disetujui" | "Pending" | "Ditolak";
type PaymentStatus = "Sudah Dibayar" | "Belum Dibayar";

type Reimbursement = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  status: ReimbursementStatus;
  paymentStatus: PaymentStatus;
};

const currentUser: CurrentUser = {
  id: "u-002",
  employeeId: "EMP002",
  name: "Hendra Gunawan",
  role: "Purchasing",
  department: "Purchasing",
};

const SEED_REIMBURSEMENTS: Reimbursement[] = [
  {
    id: "R001",
    employeeId: "EMP002",
    employeeName: "Hendra Gunawan",
    department: "Purchasing",
    date: "2026-05-09",
    category: "Makan",
    amount: 175000,
    description: "Makan siang rapat client",
    status: "Disetujui",
    paymentStatus: "Belum Dibayar",
  },
  {
    id: "R002",
    employeeId: "EMP002",
    employeeName: "Hendra Gunawan",
    department: "Purchasing",
    date: "2026-05-11",
    category: "Transport",
    amount: 250000,
    description: "Transport meeting vendor",
    status: "Pending",
    paymentStatus: "Belum Dibayar",
  },
  {
    id: "R003",
    employeeId: "EMP011",
    employeeName: "Dika Saputra",
    department: "Purchasing",
    date: "2026-05-13",
    category: "Peralatan",
    amount: 450000,
    description: "Pembelian perlengkapan kerja purchasing",
    status: "Disetujui",
    paymentStatus: "Sudah Dibayar",
  },
  {
    id: "R004",
    employeeId: "EMP021",
    employeeName: "Andi Kusuma",
    department: "Engineering",
    date: "2026-05-07",
    category: "Peralatan",
    amount: 850000,
    description: "Pembelian keyboard mekanikal engineering",
    status: "Pending",
    paymentStatus: "Belum Dibayar",
  },
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isManagementRole(role: string) {
  return ["Admin", "HRD", "Director"].includes(role);
}

export default function EmployeeReimbursement() {
  const currentDate = new Date();

  const [month, setMonth] = useState(
  String(currentDate.getMonth() + 1)
  );

  const [year, setYear] = useState(
    String(currentDate.getFullYear())
  );  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const allowedData = useMemo(() => {
    if (isManagementRole(currentUser.role)) return [];

    return SEED_REIMBURSEMENTS.filter(
      (item) =>
        item.employeeId === currentUser.employeeId ||
        item.department === currentUser.department
    );
  }, []);

  const filteredData = useMemo(() => {
    return allowedData.filter((item) => {
      const itemDate = new Date(item.date);
      const itemMonth = String(itemDate.getMonth() + 1);
      const itemYear = String(itemDate.getFullYear());

      const matchMonth = !month || itemMonth === month;
      const matchYear = !year || itemYear === year;
      const matchStart = !startDate || item.date >= startDate;
      const matchEnd = !endDate || item.date <= endDate;

      return matchMonth && matchYear && matchStart && matchEnd;
    });
  }, [allowedData, month, year, startDate, endDate]);

  const summary = useMemo(() => {
    const filterLabel = useMemo(() => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    if (startDate && endDate) {
      return `Periode ${formatDate(startDate)} - ${formatDate(endDate)}`;
    }

    if (month && year) {
      return `Bulan ${monthNames[Number(month) - 1]} ${year}`;
    }

    return `Bulan ${
      monthNames[new Date().getMonth()]
    } ${new Date().getFullYear()}`;
  }, [month, year, startDate, endDate]);
    return {
      total: filteredData.reduce((sum, item) => sum + item.amount, 0),
      approved: filteredData
        .filter((item) => item.status === "Disetujui")
        .reduce((sum, item) => sum + item.amount, 0),
      pending: filteredData
        .filter((item) => item.status === "Pending")
        .reduce((sum, item) => sum + item.amount, 0),      paid: filteredData
        .filter((item) => item.paymentStatus === "Sudah Dibayar")
        .reduce((sum, item) => sum + item.amount, 0),
    };
  }, [filteredData]);

  if (isManagementRole(currentUser.role)) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-lg font-bold text-yellow-800">
            Akses diarahkan ke halaman Reimbursement utama
          </h2>
          <p className="text-sm text-yellow-700 mt-1">
            Role Admin, HRD, dan Director tetap menggunakan halaman reimbursement
            full akses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Employee Reimbursement
        </h1>
        <p className="text-sm text-gray-500">
          Lihat pengajuan reimbursement milik anda atau divisi anda.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Rekap Reimbursement</h2>
            <p className="text-sm text-gray-500">
              Filter berdasarkan bulan, tahun, atau rentang tanggal.
            </p>
          </div>

          <button
            type="button"
              onClick={() => {
                const now = new Date();

                setMonth(String(now.getMonth() + 1));
                setYear(String(now.getFullYear()));
                setStartDate("");
                setEndDate("");
              }}  
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 outline-none"
          >
            <option value="">Semua Bulan</option>
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>

          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Tahun, contoh: 2026"
            className="px-4 py-2 rounded-xl border border-gray-200 outline-none"
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 outline-none"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 outline-none"
          />
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Menampilkan <b>{filteredData.length}</b> data dengan total{" "}
          <b className="text-red-600">{formatRupiah(summary.total)}</b>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Reimbursement"
          value={formatRupiah(summary.total)}
          icon={<FileText size={20} />}
          filterLabel="{filterLabel}"
          color="red"
        />
        <SummaryCard
          title="Total Disetujui"
          value={formatRupiah(summary.approved)}
          icon={<CheckIcon />}
          filterLabel="{filterLabel}"
          color="green"
        />
        <SummaryCard
          title="Total Pending"
          value={String(summary.pending)}
          icon={<Calendar size={20} />}
          filterLabel="{filterLabel}"
          color="yellow"
        />
        <SummaryCard
          title="Total Sudah Dibayar"
          value={formatRupiah(summary.paid)}
          icon={<CreditCard size={20} />}
          filterLabel="{filterLabel}"
          color="blue"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <div>
            <h2 className="font-bold text-gray-900">Data Reimbursement</h2>
            <p className="text-sm text-gray-500">
              Data sudah dibatasi sesuai role/login.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-4 text-left">Tanggal</th>
                <th className="px-5 py-4 text-left">Kategori</th>
                <th className="px-5 py-4 text-left">Jumlah</th>
                <th className="px-5 py-4 text-left">Keterangan</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-left">Status Pembayaran</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                    Tidak ada data reimbursement.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-700">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-5 py-4">
                      <ReimbursementBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PaymentBadge status={item.paymentStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  filterLabel,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "red" | "green" | "yellow" | "blue";
  filterLabel: string;
}) {

  const styles = {
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className={`rounded-2xl border p-5 ${styles[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold opacity-80">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>

      <p className="text-xs text-gray-400 mt-2">
        {filterLabel}
      </p>
    </div>
  );
}

function ReimbursementBadge({ status }: { status: ReimbursementStatus }) {
  const style =
    status === "Disetujui"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const style =
    status === "Sudah Dibayar"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-orange-100 text-orange-700 border-orange-200";

  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

function CheckIcon() {
  return <span className="text-lg font-bold">✓</span>;
}