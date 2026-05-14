import { useState } from 'react';
import { Plus, X, MapPin, MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import type { FieldReport, ReportComment } from '@/types/types';
import { SEED_REPORTS } from '@/data/seedData';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatDateTime, generateId, getCurrentDatetime } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SEED_EMPLOYEES } from '@/data/seedData';

export default function Laporan() {
  const { auth } = useAuth();
  const currentUser = {
    employeeId: auth.userId || 'EMP001',
    employeeName: auth.name || 'Administrator',
  };
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [reports, setReports] = useLocalStorage<FieldReport[]>('hrptaa_reports', SEED_REPORTS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<FieldReport | null>(null);
  const [commentText, setCommentText] = useState('');
  const [form, setForm] = useState({ title: '', description: '', location: '' });

  function handleTagEmployee(employeeName: string) {
    const mention = `@${employeeName}`;

    if (form.description.includes(mention)) return;

    setForm((prev) => ({
      ...prev,
      description: prev.description
        ? `${prev.description} ${mention}`
        : mention,
    }));
  }

  function handleSubmitReport() {
    if (!form.title || !form.description || !form.location) {
      toast({ title: 'Gagal', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }
    const newReport: FieldReport = {
      id: generateId(),
      employeeId: currentUser.employeeId,
      employeeName: currentUser.employeeName,
      title: form.title,
      description: form.description,
      location: form.location,
      mediaUrls: [],
      datetime: getCurrentDatetime(),
      comments: [],
    };

    const taggedEmployees = SEED_EMPLOYEES.filter((employee) =>
      form.description
        .toLowerCase()
        .includes(`@${employee.name.toLowerCase()}`)
    );

    const mentionNotifications = taggedEmployees.map((employee) => ({
      id: generateId(),
      type: 'report',
      title: 'Anda ditandai dalam laporan',
      message: `${employee.name} ditandai dalam laporan "${form.title}"`,
      targetUser: employee.name,
      timestamp: getCurrentDatetime(),
      read: false,
    }));

    mentionNotifications.forEach((notif) => {
      addNotification(
        'report_comment',
        notif.title,
        notif.message
      );
    });

    setReports(prev => [newReport, ...prev]);
    toast({ title: 'Berhasil', description: 'Laporan lapangan berhasil dikirim.' });
    setModalOpen(false);
    setForm({ title: '', description: '', location: '' });
  }

  function handleAddComment() {
    if (!commentText.trim() || !detailReport) return;
    const newComment: ReportComment = {
      id: generateId(),
      commenterName: currentUser.employeeName,
      comment: commentText.trim(),
      timestamp: getCurrentDatetime(),
    };
    setReports(prev => prev.map(r =>
      r.id === detailReport.id ? { ...r, comments: [...r.comments, newComment] } : r
    ));
    setDetailReport(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev);
    addNotification('report_comment', 'Komentar Ditambahkan', `Komentar Anda pada laporan "${detailReport.title}" berhasil dikirim.`,'/laporan');
    toast({ title: 'Komentar Dikirim', description: 'Komentar berhasil ditambahkan.' });
    setCommentText('');
  }

  const filteredReports = reports.filter((report) => {
    const keyword = searchKeyword.toLowerCase();

    return (
      report.title.toLowerCase().includes(keyword) ||
      report.description.toLowerCase().includes(keyword) ||
      report.location.toLowerCase().includes(keyword) ||
      report.employeeName.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Laporan Lapangan</h2>
          <p className="text-sm text-gray-500">{reports.length} laporan tersedia</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#E30613' }}
          data-testid="button-buat-laporan"
        >
          <Plus className="w-4 h-4" /> Buat Laporan
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Cari laporan berdasarkan judul, lokasi, deskripsi, atau nama karyawan..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#001E8A]"
        />
      </div>

      {/* Report cards */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">Belum ada laporan lapangan</div>
        ) : filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" data-testid={`card-report-${report.id}`}>
            <div className="flex items-start gap-3">
              <EmployeeAvatar name={report.employeeName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{report.employeeName}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(report.datetime)}</p>
                </div>
                <h3 className="font-bold text-gray-900 mt-1">{report.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>{report.location}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>{report.comments.length} komentar</span>
                  </div>
                  <button
                    onClick={() => { setDetailReport(report); setCommentText(''); }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
                    style={{ borderColor: '#001E8A', color: '#001E8A' }}
                    data-testid={`button-detail-${report.id}`}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detailReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-900">Detail Laporan</h3>
              <button onClick={() => setDetailReport(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <EmployeeAvatar name={detailReport.employeeName} size="md" />
                <div>
                  <p className="font-semibold text-gray-900">{detailReport.employeeName}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(detailReport.datetime)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{detailReport.title}</h4>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{detailReport.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{detailReport.location}</span>
              </div>
              {detailReport.mediaUrls.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400 border border-dashed border-gray-200">
                  Tidak ada media terlampir
                </div>
              )}

              {/* Comments */}
              <div>
                <h5 className="text-sm font-semibold text-gray-800 mb-3">Komentar ({detailReport.comments.length})</h5>
                {detailReport.comments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Belum ada komentar</p>
                ) : (
                  <div className="space-y-3">
                    {detailReport.comments.map(c => (
                      <div key={c.id} className="flex gap-2.5">
                        <EmployeeAvatar name={c.commenterName} size="sm" />
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-800">{c.commenterName}</p>
                            <p className="text-xs text-gray-400">{formatDateTime(c.timestamp)}</p>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{c.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment input */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <EmployeeAvatar name={currentUser.employeeName} size="sm" />
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Tulis komentar..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                    data-testid="input-comment"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-3 py-2 text-white rounded-xl hover:opacity-90 flex items-center gap-1"
                    style={{ backgroundColor: '#001E8A' }}
                    data-testid="button-kirim-komentar"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New report modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-900">Buat Laporan Lapangan</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Judul laporan pekerjaan..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-laporan-title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lokasi pekerjaan..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-laporan-location" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Pekerjaan *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Jelaskan detail pekerjaan yang dilakukan..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none" data-testid="input-laporan-desc" />
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Tag karyawan di deskripsi pekerjaan:
                </p>

                <div className="flex flex-wrap gap-2">
                  {SEED_EMPLOYEES.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => handleTagEmployee(employee.name)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full border border-blue-100 text-[#001E8A] bg-blue-50 hover:bg-blue-100"
                    >
                      @{employee.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Upload foto/video (segera tersedia)</p>
                <p className="text-xs text-gray-400 mt-1">Tanggal & waktu otomatis dicatat saat submit</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmitReport} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-submit-laporan">
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
