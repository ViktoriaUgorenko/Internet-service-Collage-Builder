import { useState, useContext, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const FEATURES = [
  { title: 'Редактор коллажей', desc: 'Текст, фигуры, стикеры и рамки' },
  { title: 'Библиотека Unsplash', desc: 'Тысячи фото для вашего проекта' },
  { title: 'Фильтры и обрезка', desc: 'Профессиональная обработка фото' },
  { title: 'Экспорт PNG / JPEG', desc: 'В исходном разрешении холста' },
];

function LogoMark({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl shadow-lg ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.35)',
      }}>
      <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
      </svg>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'var(--bg)' }}>

      {/* Промо-панель */}
      <div
        className="relative hidden lg:flex flex-col justify-between w-[min(44vw,520px)] flex-shrink-0 p-10 xl:p-14 overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #1a0f0a 0%, #3d2418 38%, #6b3d26 72%, #8b5a40 100%)',
        }}>
        {/* Декоративные пятна */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
            style={{ background: '#f4c4a0' }}
          />
          <div
            className="absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full opacity-20 blur-3xl translate-x-1/4 translate-y-1/4"
            style={{ background: '#8b5cf6' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90%,480px)] aspect-square rounded-[40px] opacity-[0.07] border-2 border-white rotate-6"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <LogoMark className="w-12 h-12" />
            <div>
              <span className="text-white font-semibold tracking-tight text-lg block">Collage Maker</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Создавайте визуалы без сложных программ</span>
            </div>
          </div>

          <h2 className="text-[2.35rem] xl:text-5xl font-bold text-white leading-[1.08] tracking-tight mb-5">
            Коллажи,<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #fff 0%, #f0d4bc 55%, #e8b896 100%)' }}>
              которые хочется показать
            </span>
          </h2>
          <p className="text-sm max-w-sm mb-12 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Редактор в браузере: слои, фото, типографика и экспорт в один клик — где бы вы ни были.
          </p>

          <ul className="space-y-3 max-w-md">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex items-start gap-4 rounded-2xl px-4 py-3.5 transition-colors duration-300 hover:bg-white/[0.06]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                }}>
                <span
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fcd9c0' }}
                  aria-hidden>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
                <div>
                  <p className="text-white text-sm font-semibold tracking-tight">{f.title}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
          © 2026 Collage Maker
        </p>
      </div>

      {/* Форма */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-[100dvh] lg:min-h-0">
        {/* Фоновый орнамент (форма) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:block" aria-hidden>
          <div
            className="absolute top-[12%] right-[8%] w-72 h-72 rounded-full opacity-[0.12] blur-3xl"
            style={{ background: 'var(--accent)' }}
          />
          <div
            className="absolute bottom-[18%] left-[5%] w-56 h-56 rounded-full opacity-[0.08] blur-3xl"
            style={{ background: '#5c4d42' }}
          />
        </div>

        <div className="relative w-full max-w-[420px]">
          {/* Мобильная шапка */}
          <div
            className="flex items-center gap-3 mb-10 lg:hidden p-4 rounded-2xl -mx-2"
            style={{
              background: 'linear-gradient(135deg, #2a1810 0%, #5c3622 100%)',
              boxShadow: '0 12px 40px rgba(15, 13, 11, 0.2)',
            }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/15 border border-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
              </svg>
            </div>
            <div>
              <span className="text-white font-semibold">Collage Maker</span>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Вход в аккаунт</p>
            </div>
          </div>

          <div
            className="rounded-3xl p-8 sm:p-10"
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 4px 6px -1px rgba(15, 13, 11, 0.06), 0 24px 48px -12px rgba(15, 13, 11, 0.12)',
            }}>
            <div className="hidden lg:block mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                Добро пожаловать
              </p>
            </div>
            <h1 className="text-2xl sm:text-[1.65rem] font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>
              Вход в аккаунт
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>
              Нет аккаунта?{' '}
              <Link
                to="/register"
                className="font-semibold hover:underline underline-offset-2 transition-colors"
                style={{ color: 'var(--accent)' }}>
                Зарегистрироваться
              </Link>
            </p>

            {error && (
              <div
                role="alert"
                className="text-sm rounded-2xl px-4 py-3.5 mb-6 border flex items-start gap-3"
                style={{
                  background: 'var(--danger-bg)',
                  borderColor: '#fecaca',
                  color: 'var(--danger)',
                }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)', opacity: 0.5 }} aria-hidden>
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl border outline-none transition-all duration-200"
                    style={{
                      background: 'var(--bg-2)',
                      borderColor: 'var(--border-light)',
                      color: 'var(--text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.background = 'var(--white)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(107, 61, 38, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.background = 'var(--bg-2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>
                  Пароль
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)', opacity: 0.5 }} aria-hidden>
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl border outline-none transition-all duration-200"
                    style={{
                      background: 'var(--bg-2)',
                      borderColor: 'var(--border-light)',
                      color: 'var(--text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.background = 'var(--white)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(107, 61, 38, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.background = 'var(--bg-2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 mt-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:shadow-none disabled:translate-y-0 disabled:opacity-80"
                style={{
                  background: loading ? 'var(--accent-light)' : 'var(--accent)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--accent-dark)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--accent)';
                }}>
                {loading ? 'Вход…' : 'Войти'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-3)' }}>
            Нажимая «Войти», вы используете безопасное соединение с сервером.
          </p>
        </div>
      </div>
    </div>
  );
}
