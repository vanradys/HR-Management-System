import { useState } from 'react';
import { Plus, X, Megaphone, Calendar, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Announcement } from '@/types/types';
import { SEED_ANNOUNCEMENTS } from '@/data/seedData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, generateId } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';

export default function Pengumuman() {
  const { toast } = useToast();
  const { auth } = useAuth();
  const canPublish = ['Admin', 'Director', 'HR'].includes(auth.role);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('hrptaa_announcements', SEED_ANNOUNCEMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form, setForm] = useState({
    title: '', content: '', priority: 'Normal' as 'Tinggi' | 'Normal' | 'Rendah',
    publishDate: new Date().toISOString().split('T')[0],
  });

  function handleSubmit() {
    if (!form.title || !form.content) {
      toast({ title: 'Gagal', description: 'Harap isi judul dan isi pengumuman.', variant: 'destructive' });
      return;
    }
    const newAnn: Announcement = {
      id: generateId(), title: form.title, content: form.content,
      priority: form.priority, publishDate: form.publishDate, authorName: 'Administrator',
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    toast({ title: 'Berhasil', description: 'Pengumuman berhasil dipublikasikan.' });
    setModalOpen(false);
    setForm({ title: '', content: '', priority: 'Normal', publishDate: new Date().toISOString().split('T')[0] });
  }

  const priorityBg: Record<string, string> = {
    Tinggi: 'border-l-4 border-l-red-500',
    Normal: 'border-l-4 border-l-blue-500',
    Rendah: 'border-l-4 border-l-gray-300',
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const keyword = searchKeyword.toLowerCase();

    return (
      ann.title.toLowerCase().includes(keyword) ||
      ann.content.toLowerCase().includes(keyword) ||
      ann.priority.toLowerCase().includes(keyword) ||
      ann.authorName.toLowerCase().includes(keyword) ||
      formatDate(ann.publishDate).toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pengumuman</h2>
          <p className="text-sm text-gray-500">{announcements.length} pengumuman aktif</p>
        </div>
        {canPublish && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#E30613' }}
            data-testid="button-buat-pengumuman"
          >
            <Plus className="w-4 h-4" /> Buat Pengumuman
          </button>
        )}
      </div>
      {/* Search bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Cari pengumuman berdasarkan judul, isi, prioritas, penulis, atau tanggal..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-[#001E8A] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Menampilkan {filteredAnnouncements.length} dari {announcements.length} pengumuman.
        </p>
      </div>

      {/* Announcement cards */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">Belum ada pengumuman</div>
        ) : filteredAnnouncements.map(ann => (
          <div
            key={ann.id}
            onClick={() => setSelectedAnnouncement(ann)}
            className={`cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${priorityBg[ann.priority] || ''}`}
            data-testid={`card-ann-${ann.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: ann.priority === 'Tinggi' ? '#FEE2E2' : '#EFF6FF' }}
                >
                  <Megaphone className={`w-5 h-5 ${ann.priority === 'Tinggi' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{ann.title}</h3>
                    <StatusBadge status={ann.priority} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Dipublikasikan: {formatDate(ann.publishDate)}</span>
                    </div>
                    <span>·</span>
                    <span>Oleh: {ann.authorName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedAnnouncement.title}</h3>
                <p className="text-xs text-gray-500">Dipublikasikan: {formatDate(selectedAnnouncement.publishDate)} · Oleh: {selectedAnnouncement.authorName}</p>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <span className="text-xs uppercase tracking-[0.2em] text-blue-700">{selectedAnnouncement.priority}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{selectedAnnouncement.content}</p>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-900">Buat Pengumuman Baru</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pengumuman *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Judul pengumuman..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-ann-title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <div className="flex gap-2">
                  {(['Tinggi', 'Normal', 'Rendah'] as const).map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${form.priority === p ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`} data-testid={`priority-${p}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Publikasi</label>
                <input type="date" value={form.publishDate} onChange={e => setForm(f => ({ ...f, publishDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" data-testid="input-ann-date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Pengumuman *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} placeholder="Tulis isi pengumuman secara lengkap..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none" data-testid="input-ann-content" />
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E30613' }} data-testid="button-publish-ann">
                Publikasikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
