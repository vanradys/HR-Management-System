import { useState } from 'react';
import { useLocation } from 'wouter';

interface LoginProps {
  onLogin: (name: string, email: string, role: import('@/types/types').UserRole) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login gagal.');
        return;
      }

      localStorage.setItem('hrptaa_token', data.token);
      localStorage.setItem('hrptaa_auth_user', JSON.stringify(data.user));

      onLogin(data.user.name, data.user.email, data.user.role);
      navigate('/');
    } catch (error) {
      setError('Tidak dapat terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: '#001E8A' }}
      >
        {/* Red accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: '#E30613' }} />

        {/* Decorative circles */}
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: '#E30613' }} />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: '#ffffff' }} />

        <div className="relative z-10">
          <div id="logo-area">
            <div className="text-white font-black text-3xl tracking-widest leading-none">ADIYASA</div>
            <div className="text-sm font-bold tracking-widest mt-1" style={{ color: '#E30613' }}>HR PTAA</div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-12 h-1 mb-6" style={{ backgroundColor: '#E30613' }} />
          <h2 className="text-2xl font-bold text-white leading-snug mb-3">
            Sistem Manajemen SDM<br />PT Adiyasa Abadi
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Platform digital terintegrasi untuk pengelolaan sumber daya manusia, absensi, payroll, dan operasional perusahaan secara efisien.
          </p>
        </div>

        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-blue-300 text-xs">
            PT Adiyasa Abadi &copy; 2026. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-3xl font-black tracking-widest" style={{ color: '#001E8A' }}>ADIYASA</div>
            <div className="text-sm font-bold tracking-widest" style={{ color: '#E30613' }}>HR PTAA</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="mb-6">
              <div className="w-8 h-1 mb-4" style={{ backgroundColor: '#E30613' }} />
              <h1 className="text-2xl font-bold text-gray-900">Masuk ke Sistem</h1>
              <p className="text-gray-500 text-sm mt-1">Masukkan kredensial akun Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contoh@ptaa.co.id"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': '#001E8A20' } as React.CSSProperties}
                  onFocus={e => { e.target.style.borderColor = '#001E8A'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
                  data-testid="input-email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Kata Sandi
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none transition-all"
                  onFocus={e => { e.target.style.borderColor = '#001E8A'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
                  data-testid="input-password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3.5 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-70 mt-2"
                style={{ backgroundColor: '#E30613' }}
                data-testid="button-login"
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Gunakan email terdaftar. Hubungi HR jika mengalami kendala akses.
              </p>
              <p className="text-xs text-blue-600 text-center mt-2 font-medium">
                Coba: siti@company.com (HR) atau budi@company.com (Finance)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}