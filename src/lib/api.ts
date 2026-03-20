import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

// API Clients
export const authApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5085/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const voiceApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
};

// Inject Bearer token into voice API requests (JWT from NextAuth session)
const voiceAuthInterceptor = async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.set('Authorization', `Bearer ${session.accessToken}`);
  }
  return config;
};

// Response error handler
const responseErrorHandler = (error: AxiosError) => {
  if (error.response) {
    const status = error.response.status;

    if (status === 401) {
      if (typeof window !== 'undefined') {
        // Let NextAuth handle the redirect to the OIDC login page
        import('next-auth/react').then(({ signIn }) => signIn('voice-cloner'));
      }
    }

    if (status === 403) {
      console.warn('[API] Forbidden - Check credits or permissions');
    }
  }

  return Promise.reject(error);
};

// Apply interceptors
authApi.interceptors.request.use(requestInterceptor);
authApi.interceptors.response.use((res) => res, responseErrorHandler);

voiceApi.interceptors.request.use(requestInterceptor);
voiceApi.interceptors.request.use(voiceAuthInterceptor);
voiceApi.interceptors.response.use((res) => res, responseErrorHandler);

export default voiceApi;
