import { api } from './api';

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  category: string;
  isPublic: boolean;
  userId?: string;
  canvasData?: object;
  createdAt: string;
}

export async function getTemplates(params?: { category?: string; scope?: 'my' | 'public' | 'all' }): Promise<Template[]> {
  // Для встроенных шаблонов возвращаем пустой массив, так как они теперь локальные
  if (params?.scope === 'public') {
    return [];
  }
  
  const res = await api.get('/templates', { params });
  return res.data;
}

export async function getTemplateById(id: string): Promise<Template> {
  const res = await api.get(`/templates/${id}`);
  return res.data;
}

export async function createTemplate(data: {
  name: string;
  description?: string;
  canvasData: object;
  thumbnailUrl?: string;
  category?: string;
  isPublic?: boolean;
}): Promise<Template> {
  const res = await api.post('/templates', data);
  return res.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}
