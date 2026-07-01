import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LogIn, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Tüm alanları doldurun.');
      return;
    }

    if (password.trim().length < 4) {
      setError('Şifre en az 4 karakter olmalı.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const ok = await login(username.trim(), password.trim());
        if (!ok) setError('Kullanıcı adı veya şifre hatalı.');
      } else {
        if (!displayName.trim()) {
          setError('Görünen ad gerekli.');
          setLoading(false);
          return;
        }
        const ok = await register(username.trim(), password.trim(), displayName.trim());
        if (!ok) setError('Bu kullanıcı adı zaten alınmış.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img
            src="/icon-192x192.png"
            alt="DostOS"
            style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover' }}
            onError={(e) => {
              // Fallback if image fails
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-center text-2xl font-extrabold mb-1 tracking-tight">
          Dost<span style={{ color: 'var(--accent)' }}>OS</span>
        </h1>
        <p className="text-center text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
          {mode === 'login' ? 'Hesabına gir, grupla kal.' : 'Yeni hesap oluştur, gruba katıl.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                GÖRÜNEN AD
              </label>
              <input
                className="glass-input"
                placeholder="Ahmet"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              KULLANICI ADI
            </label>
            <input
              className="glass-input"
              placeholder="ahmet123"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              ŞİFRE
            </label>
            <div className="relative">
              <input
                className="glass-input pr-10"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg, var(--accent), #f59e0b)',
              boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Lütfen bekleyin...</>
            ) : mode === 'login' ? (
              <><LogIn size={16} /> Giriş Yap</>
            ) : (
              <><UserPlus size={16} /> Hesap Oluştur</>
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>Hesabın yok mu? <button onClick={() => { setMode('register'); setError(''); }} className="font-bold" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Kayıt Ol</button></>
          ) : (
            <>Zaten hesabın var? <button onClick={() => { setMode('login'); setError(''); }} className="font-bold" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Giriş Yap</button></>
          )}
        </p>
      </div>
    </div>
  );
}
