import { useState, useEffect } from "react";

type Task = {
    nama: string;
    deadline: string;
    progress: number;
    catatan: string;
    status: "belum" | "selesai";
};

export default function LaporanHarian() {
    const today = new Date().toISOString().split("T")[0];

    const [nama, setNama] = useState("");
    const [tanggal, setTanggal] = useState(today);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [catatanTambahan, setCatatanTambahan] = useState("");
    const [rencana, setRencana] = useState("");
    const [status, setStatus] = useState<"draft" | "submitted">("draft");

    // tambah task
    const addTask = () => {
        setTasks([
            ...tasks,
            { nama: "", deadline: "", progress: 0, catatan: "", status: "belum" },
        ]);
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
    const isSelesai = tasks.every((t) => t.status === "selesai");

    // simpan
    const handleSubmit = () => {
        setStatus("submitted");

        const data = {
            nama,
            tanggal,
            tasks,
            catatanTambahan,
            rencana,
            totalProgress,
            status: isSelesai ? "selesai" : "belum selesai",
        };

        localStorage.setItem("laporan-harian", JSON.stringify(data));
        alert("Laporan disimpan!");
    };

    // load data
    useEffect(() => {
        const saved = localStorage.getItem("laporan-harian");
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
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">Laporan Harian</h1>

            {/* Nama */}
            <input
                className="w-full mb-2 p-2 text-black"
                placeholder="Nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
            />

            {/* Tanggal */}
            <input
                type="date"
                className="w-full mb-4 p-2 text-black"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
            />

            {/* TASK */}
            <div className="mb-4">
                <h2 className="font-bold mb-2">Tugas Hari Ini</h2>

                {tasks.map((t, i) => (
                    <div key={i} className="border p-3 mb-2 rounded">
                        <input
                            placeholder="Nama pekerjaan"
                            className="w-full mb-1 p-1 text-black"
                            value={t.nama}
                            onChange={(e) =>
                                updateTask(i, "nama", e.target.value)
                            }
                        />
                        <input
                            type="date"
                            className="w-full mb-1 p-1 text-black"
                            value={t.deadline}
                            onChange={(e) =>
                                updateTask(i, "deadline", e.target.value)
                            }
                        />
                        <input
                            type="number"
                            placeholder="Progress %"
                            className="w-full mb-1 p-1 text-black"
                            value={t.progress}
                            onChange={(e) =>
                                updateTask(i, "progress", Number(e.target.value))
                            }
                        />
                        <input
                            placeholder="Catatan"
                            className="w-full mb-1 p-1 text-black"
                            value={t.catatan}
                            onChange={(e) =>
                                updateTask(i, "catatan", e.target.value)
                            }
                        />

                        <select
                            className="w-full p-1 text-black"
                            value={t.status}
                            onChange={(e) =>
                                updateTask(i, "status", e.target.value as Task["status"])
                            }
                        >
                            <option value="belum">Belum selesai</option>
                            <option value="selesai">Selesai</option>
                        </select>
                    </div>
                ))}

                <button
                    onClick={addTask}
                    className="bg-blue-500 px-3 py-1 rounded"
                >
                    + Tambah Tugas
                </button>
            </div>

            {/* TOTAL */}
            <p className="mb-4">Total Progress: {totalProgress}%</p>

            {/* CATATAN */}
            <textarea
                className="w-full mb-2 p-2 text-black"
                placeholder="Catatan tambahan"
                value={catatanTambahan}
                onChange={(e) => setCatatanTambahan(e.target.value)}
            />

            {/* RENCANA */}
            <textarea
                className="w-full mb-4 p-2 text-black"
                placeholder="Rencana besok & target"
                value={rencana}
                onChange={(e) => setRencana(e.target.value)}
            />

            {/* BUTTON */}
            <div className="flex gap-2">
                <button
                    onClick={() => setStatus("draft")}
                    className="bg-gray-500 px-4 py-2 rounded"
                >
                    Simpan Draft
                </button>

                <button
                    onClick={handleSubmit}
                    className="bg-green-600 px-4 py-2 rounded"
                >
                    Submit
                </button>
            </div>

            {/* STATUS */}
            <p className="mt-4">
                Status: {isSelesai ? "Selesai" : "Belum Selesai"}
            </p>
        </div>
    );
}