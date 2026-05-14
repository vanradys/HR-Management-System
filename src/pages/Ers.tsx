import { useMemo, useState } from "react";
import { Calendar, CreditCard, FileText, Plus, Search } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

type UserRole =
  | "Admin"
  | "HR"
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

const SEED_REIMBURSEMENTS: Reimbursement[] = [];
const STORAGE_KEY = "hrptaa_reimbursements";
const NOTIFICATION_KEY = "hrptaa_notifications";
const MAX_REIMBURSE_AMOUNT = 100000000;

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

function getTodayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split("T")[0];
}

function isManagementRole(role?: string) {
  return ["Admin", "HR", "Director", "Finance"].includes(
    role || ""
  );
}

    export default function EmployeeReimbursement() {
      const { auth } = useAuth();
      const currentUser = {
        ...auth,
        employeeId: auth.userId,
        department: auth.role || "Karyawan",
      };

    const blockedRoles = [
      "Admin",
      "Director",
      "HR",
      "Finance",
    ];

    if (blockedRoles.includes(currentUser.role)) {
      window.location.href = "/reimbursement";
      return null;
    }
      const today = getTodayISO();

    const [reimbursements, setReimbursements] = useState<Reimbursement[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        return JSON.parse(saved);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REIMBURSEMENTS));
      return SEED_REIMBURSEMENTS;
    });

    const [showForm, setShowForm] = useState(false);
    const [amountWarning, setAmountWarning] = useState(false);

    const [form, setForm] = useState({
      date: today,
      category: "Transport",
      amount: "",
      description: "",
    });
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

    return reimbursements.filter(
      (item) => item.employeeId === currentUser.employeeId
    );
  }, [reimbursements, currentUser.employeeId, currentUser.role]);

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
  return {
    total: filteredData.reduce(
      (sum, item) => sum + item.amount,
      0
    ),

    approved: filteredData
      .filter((item) => item.status === "Disetujui")
      .reduce((sum, item) => sum + item.amount, 0),

    pending: filteredData
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.amount, 0),

    paid: filteredData
      .filter(
        (item) =>
          item.paymentStatus === "Sudah Dibayar"
      )
      .reduce((sum, item) => sum + item.amount, 0),
  };
}, [filteredData]);

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
    return `Periode ${formatDate(
      startDate
    )} - ${formatDate(endDate)}`;
  }

  if (month && year) {
    return `Bulan ${
      monthNames[Number(month) - 1]
    } ${year}`;
  }

  return `Bulan ${
    monthNames[new Date().getMonth()]
  } ${new Date().getFullYear()}`;
}, [month, year, startDate, endDate]);

const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawValue = e.target.value.replace(/\D/g, "");
  const numericValue = Number(rawValue);

  if (numericValue > MAX_REIMBURSE_AMOUNT) {
    setAmountWarning(true);
    setForm((prev) => ({
      ...prev,
      amount: String(MAX_REIMBURSE_AMOUNT),
    }));
    return;
  }

  setAmountWarning(false);
  setForm((prev) => ({
    ...prev,
    amount: rawValue,
  }));
};

const saveNotification = (newReimbursement: Reimbursement) => {
  const saved = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || "[]");

  const newNotification = {
    id: `N-${Date.now()}`,
    type: "reimbursement",
    title: "Pengajuan Reimbursement Baru",
    message: `Pengajuan reimbursement baru dari ${
      newReimbursement.employeeName
    }/${newReimbursement.department} sebesar ${formatRupiah(
      newReimbursement.amount
    )}.`,
    targetRoles: ["Admin", "HR", "Director", "Finance", "Accounting"],
    isRead: false,
    link: "/reimbursement",
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    NOTIFICATION_KEY,
    JSON.stringify([newNotification, ...saved])
  );
};

const handleSubmitReimbursement = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const amount = Number(form.amount);

  if (!form.date || !form.category || !form.amount || !form.description) {
    alert("Harap isi semua field wajib.");
    return;
  }

  if (amount > MAX_REIMBURSE_AMOUNT) {
    setAmountWarning(true);
    return;
  }

  if (form.date > today) {
    alert("Tanggal pengajuan tidak boleh melebihi hari ini.");
    return;
  }

  const newReimbursement: Reimbursement = {
    id: `R-${Date.now()}`,
    employeeId: currentUser.employeeId || `EMP-${Date.now()}`,
    employeeName: currentUser.name || "Karyawan",
    department: currentUser.department || currentUser.role || "Karyawan",
    date: form.date,
    category: form.category,
    amount,
    description: form.description,
    status: "Pending",
    paymentStatus: "Belum Dibayar",
  };

  const updatedData = [newReimbursement, ...reimbursements];

  setReimbursements(updatedData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  saveNotification(newReimbursement);

  setShowForm(false);
  setAmountWarning(false);
  setForm({
    date: today,
    category: "Transport",
    amount: "",
    description: "",
  });
};

  if (isManagementRole(currentUser.role)) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-lg font-bold text-yellow-800">
            Akses diarahkan ke halaman Reimbursement utama
          </h2>
          <p className="text-sm text-yellow-700 mt-1">
            Role Admin, HR, dan Director tetap menggunakan halaman reimbursement
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
  <div className="flex items-center justify-between gap-3 mb-4">
    <div>
      <h2 className="text-lg font-bold text-gray-900">
        Ajukan Reimburse
      </h2>
      <p className="text-sm text-gray-500">
        Buat pengajuan reimbursement baru.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setShowForm((prev) => !prev)}
      className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
    >
      {showForm ? (
        "Tutup"
      ) : (
        <span className="inline-flex items-center gap-2">
          <Plus size={16} />
          Ajukan
        </span>
      )}
    </button>
  </div>

  {showForm && (
    <form
      onSubmit={handleSubmitReimbursement}
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <div>
        <label className="text-sm font-medium text-gray-700">
          Tanggal
        </label>
        <input
          type="date"
          max={today}
          value={form.date}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              date: e.target.value,
            }))
          }
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-500"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Kategori
        </label>
        <select
          value={form.category}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              category: e.target.value,
            }))
          }
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-500"
          required
        >
          <option value="Transport">Transport</option>
          <option value="Makan">Makan</option>
          <option value="Peralatan">Peralatan</option>
          <option value="Perjalanan Dinas">Perjalanan Dinas</option>
          <option value="Kesehatan">Kesehatan</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Jumlah
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={form.amount}
          onChange={handleAmountChange}
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-500"
          required
        />

        {amountWarning && (
          <p className="mt-1 text-xs font-medium text-red-600">
            Anda telah mencapai batas nominal
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Keterangan
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-500"
          required
        />
      </div>

      <div className="md:col-span-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Batal
        </button>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
        >
          Simpan Pengajuan
        </button>
      </div>
    </form>
  )}
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
          filterLabel={filterLabel}
          color="red"
        />
        <SummaryCard
          title="Total Disetujui"
          value={formatRupiah(summary.approved)}
          icon={<CheckIcon />}
          filterLabel={filterLabel}
          color="green"
        />
        <SummaryCard
          title="Total Pending"
          value={formatRupiah(summary.pending)}
          icon={<Calendar size={20} />}
          filterLabel={filterLabel}
          color="yellow"
        />
        <SummaryCard
          title="Total Sudah Dibayar"
          value={formatRupiah(summary.paid)}
          icon={<CreditCard size={20} />}
          filterLabel={filterLabel}
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
    red: "bg-white border-gray-200 text-gray-900",
    green: "bg-white border-gray-200 text-gray-900",
    yellow: "bg-white border-gray-200 text-gray-900",
    blue: "bg-white border-gray-200 text-gray-900",
  };

  return (
    <div className={`rounded-2xl border p-5 ${styles[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold opacity-80">{title}</p>
        <div
  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
    color === "red"
      ? "bg-red-100 text-red-600"
      : color === "green"
      ? "bg-green-100 text-green-600"
      : color === "yellow"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-blue-100 text-blue-600"
  }`}
>
  {icon}
</div>
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