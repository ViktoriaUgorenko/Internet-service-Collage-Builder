import React from 'react';
import { Project } from '../services/projects';

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const updated = new Date(project.updatedAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden border transition-all cursor-pointer"
      style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent-light)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(160,120,90,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => onEdit(project.id)}>

      {/* Превью */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: 'var(--bg-2)' }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg className="w-8 h-8" style={{ color: 'var(--border)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
            </svg>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>Превью не создано</span>
            <span className="text-xs" style={{ color: 'var(--text-3)', fontSize: 10 }}>Сохраните проект для создания превью</span>
          </div>
        )}
        {/* Оверлей при наведении */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(44,31,20,0.35)' }}>
          <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
            Открыть
          </span>
        </div>
      </div>

      {/* Инфо */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold truncate mb-1" style={{ color: 'var(--text)' }}
          title={project.title}>{project.title}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Изменён {updated}</p>

        <div className="mt-auto flex gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(project.id)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent-dark)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
            Редактировать
          </button>
          <button onClick={() => onDelete(project.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-3)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.borderColor = '#f5c6c6'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
