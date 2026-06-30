import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

export default function Profile() {
  const { user, login, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      const res = await api.put('/users/profile', { name });
      if (token) login(token, { ...user!, name: res.data.name });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally { setSaving(false); }
  };

  const fieldStyle = {
    background: 'var(--white)', borderColor: 'var(--border)', color: 'var(--text)',
  };
  const disabledStyle = {
    background: 'var(--bg-2)', borderColor: 'var(--border-light)', color: 'var(--text-3)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">

        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs mb-8 transition-all"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Назад к проектам
        </button>

        <div className="rounded-2xl border p-8" style={{ background: 'var(--white)', borderColor: 'var(--border)' }}>

          {/* Аватар */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--accent-bg)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Профиль</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{user?.email}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Имя</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-all"
                style={fieldStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Email</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full px-4 py-2.5 text-sm rounded-xl border cursor-not-allowed"
                style={disabledStyle}/>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Роль</label>
              <input type="text" value={user?.role || ''} disabled
                className="w-full px-4 py-2.5 text-sm rounded-xl border cursor-not-allowed"
                style={disabledStyle}/>
            </div>

            {error && (
              <div className="text-xs rounded-xl px-4 py-3 border"
                style={{ background: 'var(--danger-bg)', borderColor: '#f5c6c6', color: 'var(--danger)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="text-xs rounded-xl px-4 py-3 border"
                style={{ background: 'var(--success-bg)', borderColor: '#b8dfc4', color: 'var(--success)' }}>
                Изменения сохранены
              </div>
            )}

            <button type="submit" disabled={saving}
              className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all"
              style={{ background: saving ? 'var(--accent-light)' : 'var(--accent)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
