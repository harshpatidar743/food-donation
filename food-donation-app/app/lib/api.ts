import { getStoredAuthToken, clearStoredAuthUser } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

type JsonBody = Record<string, unknown>;

const isReadableStreamBody = (value: unknown): value is ReadableStream =>
    typeof ReadableStream !== 'undefined' && value instanceof ReadableStream;

const isJsonPayload = (value: unknown): value is JsonBody =>
    !!value &&
    typeof value === 'object' &&
    !(value instanceof FormData) &&
    !(value instanceof Blob) &&
    !(value instanceof URLSearchParams) &&
    !isReadableStreamBody(value) &&
    !ArrayBuffer.isView(value) &&
    !(value instanceof ArrayBuffer);

export interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: BodyInit | JsonBody | null;
    skipAuth?: boolean;
    skipErrorHandling?: boolean;
}

export const apiFetch = async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = !options.skipAuth ? getStoredAuthToken() : null;
    const normalizedBody = isJsonPayload(options.body)
        ? JSON.stringify(options.body)
        : (options.body ?? undefined);

    const config: RequestInit = {
        ...options,
        body: normalizedBody,
        headers: {
            ...(options.headers || {}),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(isJsonPayload(options.body)
                ? { 'Content-Type': 'application/json' }
                : {}),
        },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 sec timeout

    let response: Response;

    try {
        response = await fetch(url, {
            ...config,
            signal: controller.signal,
        });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }

    // Handle 401 Unauthorized / 403 Forbidden → auto-logout
    if (
        (response.status === 401 || response.status === 403) &&
        !options.skipErrorHandling &&
        typeof window !== 'undefined'
    ) {
        clearStoredAuthUser();

        // Prevent infinite redirect loop
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/donor/login?sessionExpired=true';
        }

        throw new AuthError('Session expired. Please login again.');
    }

    // Handle Rate Limiting (429) - new for backend compatibility
    if (response.status === 429 && !options.skipErrorHandling) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Too many requests. Please try again later.');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong');
    }

    return data;
};

export const publicFetch = <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, skipAuth: true });

export const apiGet = <T = any>(endpoint: string, options: ApiOptions = {}) =>
    apiFetch<T>(endpoint, { method: 'GET', ...options });

export const apiPost = <T = any>(endpoint: string, body?: any, options: ApiOptions = {}) =>
    apiFetch<T>(endpoint, { method: 'POST', body, ...options });

export const apiPatch = <T = any>(endpoint: string, body?: any, options: ApiOptions = {}) =>
    apiFetch<T>(endpoint, { method: 'PATCH', body, ...options });

export const apiDelete = <T = any>(endpoint: string, options: ApiOptions = {}) =>
    apiFetch<T>(endpoint, { method: 'DELETE', ...options });

export default apiFetch;

