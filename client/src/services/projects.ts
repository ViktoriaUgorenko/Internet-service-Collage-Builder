import { api } from './api';

export interface Project {
  id: string;
  title: string;
  canvasData: any;
  thumbnailUrl?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data: { title?: string; width?: number; height?: number }): Promise<Project> => {
  const response = await api.post('/projects', data);
  return response.data;
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};
