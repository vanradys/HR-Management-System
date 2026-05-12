import { useState, useEffect } from "react";

type Task = {
    nama: string;
    deadline: string;
    progress: number;
    catatan: string;
    status: "belum" | "selesai";
    source?: "hari_ini" | "rencana_besok" | "manual";
};

type DailyReport = {
    nama: string;
    tanggal: string;
    tasks: Task[];
    catatanTambahan: string;
    rencana: string;
    totalProgress: number;
    status: "draft" | "submitted";
};

export default function LaporanHarian() {
    const [activeTab, setActiveTab] = useState<'form' | 'todo' | 'riwayat'>('form');
    const today = new Date().toISOString().split("T")[0];

    const [nama, setNama] = useState("");
    const [tanggal, setTanggal] = useState(today);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [catatanTambahan, setCatatanTambahan] = useState("");
    const [rencana, setRencana] = useState("");
    const [status, setStatus] = useState<"draft" | "submitted">("draft");
    const [reports, setReports] = useState<DailyReport[]>([]);

    // tambah task
    const addTask = () => {
    setTasks([
        ...tasks,
        {
            nama: "",
            deadline: "",
            progress: 0,
            catatan: "",
            status: "belum",
            source: "hari_ini",
        },
    ]);
};

const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
};

    // update task
    const updateTask = <K extends keyof Task>(
        index: number,
        field: K,
        value: Task[K]
    ) => {
        const newTasks = [...tasks];

        newTasks[index] = {
            ...newTasks[index],
            [field]: value,
        };
        setTasks(newTasks);
    };

    // total progress
    const totalProgress =
        tasks.length > 0
            ? Math.round(
                tasks.reduce((acc, t) => acc + Number(t.progress), 0) /
                tasks.length
            )
            : 0;

    // cek selesai
    const isSelesai =
    tasks.length > 0 && tasks.every((t) => t.status === "selesai");

    // simpan
    const saveReport = (newStatus: "draft" | "submitted") => {
    if (!nama.trim()) {
        alert("Nama wajib diisi.");
        return;
    }

    if (tanggal !== today) {
        alert("Draft hanya bisa diedit sampai hari yang sama.");
        return;
    }

    const data: DailyReport = {
        nama,
        tanggal,
        tasks,
        catatanTambahan,
        rencana,
        totalProgress,
        status: newStatus,
    };

    const updatedReports = [
        ...reports.filter((r) => r.tanggal !== tanggal),
        data,
    ];

    setReports(updatedReports);

    localStorage.setItem(
        "laporan-harian-list",
        JSON.stringify(updatedReports)
    );

    setStatus(newStatus);

    alert(
        newStatus === "draft"
            ? "Draft berhasil disimpan!"
            : "Laporan berhasil disubmit!"
    );
};

    // load data
    useEffect(() => {
        const saved = localStorage.getItem("laporan-harian-list");
        if (saved) {
            const data = JSON.parse(saved);
            if (data.tanggal === today) {
                setNama(data.nama);
                setTasks(data.tasks);
                setCatatanTambahan(data.catatanTambahan);
                setRencana(data.rencana);
                setStatus(data.status === "draft" ? "draft" : "submitted");
            }
        }
    }, []);

    return (
        <div className="p-6 space-y-6 text-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan Harian</h1>
                    <p className="text-sm text-gray-500">
                        Catat pekerjaan harian, progress tugas, catatan tambahan, dan rencana besok.
                    </p>
                </div>

                <button
                    onClick={addTask}
                    className="bg-[#E30613] hover:bg-red-700 text-white px-5 py-2 rounded-xl font-semibold transition-colors"
                    
                >
                    + Tambah Tugas
                </button>
            </div>

            <div className="flex gap-2 mt-4">
  {[
    { key: "form", label: "Form" },
    { key: "todo", label: "To Do" },
    { key: "riwayat", label: "Riwayat" },
  ].map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key as "form" | "todo" | "riwayat")}
      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
        activeTab === tab.key
          ? "bg-[#E30613] text-white"
          : "bg-white border border-gray-200 text-gray-600"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>

            {activeTab === "form" && (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                    <p className="text-sm text-gray-500">Total Tugas</p>
                    <p className="text-3xl font-bold text-[#001E8A]">{tasks.length}</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                    <p className="text-sm text-gray-500">Total Progress</p>
                    <p className="text-3xl font-bold text-green-600">{totalProgress}%</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {isSelesai ? "Selesai" : "Belum Selesai"}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Informasi Laporan</h2>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nama
                            </label>
                            <input
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#001E8A] focus:ring-2 focus:ring-blue-100"
                                placeholder="Masukkan nama karyawan"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#001E8A] focus:ring-2 focus:ring-blue-100"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="font-bold text-gray-900">Tugas Hari Ini</h2>
                                <p className="text-sm text-gray-500">
                                    Tambahkan daftar pekerjaan dan progress masing-masing tugas.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {tasks.map((t, i) => (
                                <div
                                    key={i}
                                    className="border border-gray-100 rounded-2xl p-4 bg-gray-50"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                        <input
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#001E8A]"
                                            placeholder="Nama pekerjaan"
                                            value={t.nama}
                                            onChange={(e) => updateTask(i, "nama", e.target.value)}
                                        />

                                        <input
                                            type="date"
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#001E8A]"
                                            value={t.deadline}
                                            onChange={(e) => updateTask(i, "deadline", e.target.value)}
                                        />

                                        <input
                                            type="number"
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#001E8A]"
                                            placeholder="Progress %"
                                            value={t.progress}
                                            onChange={(e) => updateTask(i, "progress", Number(e.target.value))}
                                        />

                                        <select
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#001E8A]"
                                            value={t.status}
                                            onChange={(e) => updateTask(i, "status", e.target.value as Task["status"])}
                                        >
                                            <option value="belum">Belum selesai</option>
                                            <option value="selesai">Selesai</option>
                                        </select>
                                        <button
    onClick={() => removeTask(i)}
    className="text-red-500 text-sm font-semibold hover:text-red-700"
>
    Hapus
</button>
                                    </div>

                                    <input
                                        className="w-full mt-3 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#001E8A]"
                                        placeholder="Catatan tugas"
                                        value={t.catatan}
                                        onChange={(e) => updateTask(i, "catatan", e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <textarea
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#001E8A] focus:ring-2 focus:ring-blue-100"
                        rows={3}
                        placeholder="Catatan tambahan"
                        value={catatanTambahan}
                        onChange={(e) => setCatatanTambahan(e.target.value)}
                    />

                    <textarea
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#001E8A] focus:ring-2 focus:ring-blue-100"
                        rows={3}
                        placeholder="Rencana besok & target"
                        value={rencana}
                        onChange={(e) => setRencana(e.target.value)}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => saveReport("draft")}
                            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                        >
                            Simpan Draft
                        </button>

                        <button
                            onClick={() => saveReport("submitted")}
                            className="px-5 py-2 rounded-xl bg-[#E30613] text-white font-semibold hover:bg-red-700"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
              </>
)}
{activeTab === "todo" && (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 className="font-bold text-gray-900 mb-4">To Do List</h2>

    {tasks.length === 0 ? (
      <p className="text-sm text-gray-500">Belum ada tugas.</p>
    ) : (
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={index} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <p className="font-semibold text-gray-900">{task.nama || "Tanpa nama tugas"}</p>
            <p className="text-sm text-gray-500">Deadline: {task.deadline || "-"}</p>
            <p className="text-sm text-gray-500">Progress: {task.progress}%</p>
            <p className="text-sm text-gray-500">Status: {task.status === "selesai" ? "Selesai" : "Belum selesai"}</p>
            <p className="text-sm text-gray-500">Catatan: {task.catatan || "-"}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}

{activeTab === "riwayat" && (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 className="font-bold text-gray-900 mb-4">Riwayat Laporan</h2>

    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
      <p className="font-semibold text-gray-900">{nama || "Belum ada nama"}</p>
      <p className="text-sm text-gray-500">Tanggal: {tanggal}</p>
      <p className="text-sm text-gray-500">Total Tugas: {tasks.length}</p>
      <p className="text-sm text-gray-500">Total Progress: {totalProgress}%</p>
      <p className="text-sm text-gray-500">Status: {isSelesai ? "Selesai" : "Belum selesai"}</p>
    </div>
  </div>
)}
        </div>
    );
}