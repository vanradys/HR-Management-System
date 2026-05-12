import { useState } from 'react';
import { X, FileText, DollarSign } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PayrollRecord } from '@/types/types';
import { SEED_PAYROLL } from '@/data/seedData';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatCurrency } from '@/utils/helpers';
import { useAuth } from "@/hooks/useAuth";

function getPayrollPeriod(month: number, year: number) {
  const startDate = new Date(year, month - 1, 21);
  const endDate = new Date(year, month, 20);

  return { startDate, endDate };
}

export default function Payroll() {
  const { auth } = useAuth();
  const [payroll] = useLocalStorage<PayrollRecord[]>('hrptaa_payroll', SEED_PAYROLL);
  const [slipTarget, setSlipTarget] = useState<PayrollRecord | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  function getPayrollPeriod(month: number, year: number) {
    const startDate = new Date(year, month - 1, 21);
    const endDate = new Date(year, month, 20);

    return { startDate, endDate };
  }

  const { startDate, endDate } = getPayrollPeriod(
    selectedMonth,
    selectedYear
  );

  const selectedMonthName = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ][selectedMonth - 1];

  const filteredPayroll = payroll.filter((record) => {
    return record.month === `${selectedMonthName} ${selectedYear}`;
  });

  const totalPayroll = filteredPayroll.reduce(
    (sum, p) => sum + p.totalSalary,
    0
  );

  const totalReimbursement = filteredPayroll.reduce(
    (sum, p) => sum + p.reimbursement,
    0
  );

  const totalOvertime = filteredPayroll.reduce(
    (sum, p) => sum + p.overtimePay,
    0
  );

  const totalDeduction = filteredPayroll.reduce(
    (sum, p) => sum + p.lateDeduction + p.absenceDeduction,
    0
  );

  const allowedRoles = ["Admin", "HR"];

  if (!allowedRoles.includes(auth.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          Anda tidak memiliki akses ke halaman periode penggajian.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Penggajian</h2>
          <p className="text-sm text-gray-500">Periode: {payroll[0]?.month || 'Mei 2026'}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
        >
          {[
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember",
          ].map((month, index) => (
            <option key={month} value={index + 1}>{month}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
        >
          {[2025, 2026, 2027, 2028].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Penggajian', value: formatCurrency(totalPayroll), color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Total Reimbursement', value: formatCurrency(totalReimbursement), color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Total Uang Lembur', value: formatCurrency(totalOvertime), color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Total Potongan', value: formatCurrency(totalDeduction), color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-medium text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Karyawan', 'Dept', 'Gaji Pokok', 'Tunjangan', 'Potongan', 'Lembur', 'Bonus', 'Reimbursement', 'Total Gaji', 'Slip'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayroll.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400">Tidak ada data penggajian</td></tr>
              ) : filteredPayroll.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-payroll-${p.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <EmployeeAvatar name={p.employeeName} size="sm" />
                      <span className="font-medium text-gray-900 whitespace-nowrap">{p.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.department}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(p.basicSalary)}</td>
                  <td className="px-4 py-3 text-green-700">{formatCurrency(p.mealAllowance + p.transportAllowance)}</td>
                  <td className="px-4 py-3 text-red-600">
                    {p.lateDeduction + p.absenceDeduction > 0 ? `-${formatCurrency(p.lateDeduction + p.absenceDeduction)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-blue-700">
                    {p.overtimePay > 0 ? formatCurrency(p.overtimePay) : '-'}
                  </td>
                  <td className="px-4 py-3 text-purple-700">
                    {p.bonus > 0 ? formatCurrency(p.bonus) : '-'}
                  </td>
                  <td className="px-4 py-3 text-orange-700">
                    {p.reimbursement > 0 ? formatCurrency(p.reimbursement) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">{formatCurrency(p.totalSalary)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSlipTarget(p)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
                      style={{ borderColor: '#001E8A', color: '#001E8A' }}
                      data-testid={`button-slip-${p.id}`}
                    >
                      <FileText className="w-3 h-3" /> Lihat Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Slip Modal */}
      {slipTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-900">Slip Gaji</h3>
              <button onClick={() => setSlipTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              {/* Slip header */}
              <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: '#001E8A' }}>
                <div className="px-5 py-4 text-white" style={{ backgroundColor: '#001E8A' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-lg tracking-widest">ADIYASA</div>
                      <div className="text-xs opacity-80">PT Adiyasa Abadi</div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80">Slip Gaji</p>
                      <p className="font-bold">{slipTarget.month}</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="pb-3 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-base">{slipTarget.employeeName}</p>
                    <p className="text-sm text-gray-500">{slipTarget.department}</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Gaji Pokok', value: slipTarget.basicSalary, type: 'income' },
                      { label: 'Tunjangan Makan', value: slipTarget.mealAllowance, type: 'income' },
                      { label: 'Tunjangan Transport', value: slipTarget.transportAllowance, type: 'income' },
                      ...(slipTarget.overtimePay > 0 ? [{ label: 'Upah Lembur', value: slipTarget.overtimePay, type: 'income' }] : []),
                      ...(slipTarget.bonus > 0 ? [{ label: 'Bonus', value: slipTarget.bonus, type: 'income' }] : []),
                      ...(slipTarget.reimbursement > 0 ? [{ label: 'Reimbursement', value: slipTarget.reimbursement, type: 'income' }] : []),
                      ...(slipTarget.lateDeduction > 0 ? [{ label: 'Potongan Keterlambatan', value: slipTarget.lateDeduction, type: 'deduction' }] : []),
                      ...(slipTarget.absenceDeduction > 0 ? [{ label: 'Potongan Absen', value: slipTarget.absenceDeduction, type: 'deduction' }] : []),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className={item.type === 'deduction' ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {item.type === 'deduction' ? '-' : ''}{formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total Gaji Bersih</span>
                    <span className="text-xl font-black" style={{ color: '#E30613' }}>{formatCurrency(slipTarget.totalSalary)}</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center">Slip gaji ini diterbitkan secara digital oleh sistem HR PTAA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
