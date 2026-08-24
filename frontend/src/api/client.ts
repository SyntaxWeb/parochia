import axios from 'axios';

export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

function readCookie(name: string): string | null {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

  return value ? decodeURIComponent(value) : null;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = readCookie('XSRF-TOKEN');

  if (token) {
    config.headers.set('X-XSRF-TOKEN', token);
  }

  return config;
});

export async function csrf(): Promise<void> {
  await axios.get(`${backendUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: { Accept: 'application/json' },
  });
}
