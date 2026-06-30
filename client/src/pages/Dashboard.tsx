import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Project, getProjects, createProject, deleteProject } from '../services/projects';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectModal } from '../components/ProjectModal';

type SortKey = 'updatedAt' | 'createdAt' | 'title';
type SortDir = 'desc' | 'asc';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try { 
      setError(null);
      setProjects(await getProjects()); 
    }
    catch (err: any) { 
      console.error('Failed to fetch projects:', err);
      setError('Не удалось загрузить проекты. Пожалуйста, проверьте соединение с сервером.');
    }
    finally { setLoading(false); }
  };

  const handleCreate = async (title: string, w: number, h: number) => {
    try { navigate(`/editor/${(await createProject({ title, width: w, height: h })).id}`); }
    catch { alert('Не удалось создать проект'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить проект?')) return;
    try { await deleteProject(id); setProjects(p => p.filter(x => x.id !== id)); }
    catch { alert('Не удалось удалить'); }
  };

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(k);
      setSortDir('desc');
    }
    // Сортировка изменится, useEffect автоматически вызовет fetchProjects
  };

  const filtered = projects
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'title') {
        // Используем localeCompare для правильной сортировки русских букв
        const comparison = a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
        return sortDir === 'asc' ? comparison : -comparison;
      } else {
        // Для дат используем числовое сравнение
        const dateA = new Date(a[sortKey]).getTime();
        const dateB = new Date(b[sortKey]).getTime();
        return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
      style={{
        background: sortKey === k ? 'var(--accent-bg)' : 'var(--white)',
        borderColor: sortKey === k ? 'var(--accent-light)' : 'var(--border)',
        color: sortKey === k ? 'var(--accent-dark)' : 'var(--text-3)',
      }}>
      {label}
      {sortKey === k && <span className="ml-0.5">{sortDir === 'desc' ? '↓' : '↑'}</span>}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b shadow-sm"
        style={{ background: 'var(--white)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Collage Maker</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs mr-2 hidden sm:block" style={{ color: 'var(--text-3)' }}>
              {user?.name || user?.email}
            </span>
            <button onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{ color: 'var(--text-2)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Профиль
            </button>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-6 py-8 w-full">

        {/* Заголовок + кнопка */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Мои проекты</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
              {projects.length} {projects.length === 1 ? 'проект' : projects.length < 5 ? 'проекта' : 'проектов'}
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
            style={{ background: 'var(--accent)', color: 'white' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Новый коллаж
          </button>
        </div>

        {/* Фильтрация */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
            Фильтрация
          </p>
          <div className="flex gap-2 items-center">
            <div className="relative max-w-xs flex-grow">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" placeholder="По названию проекта..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-all"
                style={{ background: 'var(--white)', borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
            </div>
            {search && (
              <button onClick={() => setSearch('')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all"
                style={{ background: 'var(--white)', borderColor: 'var(--border)', color: 'var(--text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--white)')}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Сбросить
              </button>
            )}
          </div>
        </div>

        {/* Сортировка */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
            Сортировка
          </p>
          <div className="flex gap-2 flex-wrap">
            <SortBtn k="updatedAt" label="По дате изменения"/>
            <SortBtn k="createdAt" label="По дате создания"/>
            <SortBtn k="title" label="По названию"/>
          </div>
        </div>

        {/* Сетка проектов */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}/>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl border bg-red-50"
            style={{ borderColor: '#f8d7da' }}>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button onClick={fetchProjects} className="mt-4 text-xs font-semibold px-4 py-2 bg-white border border-red-200 rounded-lg text-red-800 hover:bg-red-100 transition-all">
              Попробовать снова
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p}
                onEdit={id => navigate(`/editor/${id}`)}
                onDelete={handleDelete}/>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-3)' }}>
              <svg className="w-7 h-7" style={{ color: 'var(--text-3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
              {search ? 'Ничего не найдено' : 'Проектов пока нет'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              {search ? 'Попробуйте другой запрос' : 'Создайте свой первый коллаж'}
            </p>
          </div>
        )}
      </main>

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate}/>
    </div>
  );
}
