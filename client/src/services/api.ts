import axios from 'axios';

// Настройка базового URL для Nginx (/api)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен из localStorage к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Глобальная обработка 401 ошибки (Опционально можно добавить logout, 
// если токен протух, но здесь пока просто перехватываем ошибку)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        // Очищаем токен принудительно, если сервер вернул 401
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
