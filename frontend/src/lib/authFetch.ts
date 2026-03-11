/**
 * Authenticated fetch wrapper
 * Automatically includes auth token from localStorage in all requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

export async function authFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuth, ...fetchOptions } = options;

    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    // Build full URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    // Add authorization header if token exists and not skipped
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    if (token && !skipAuth) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401 && !skipAuth) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    return response;
}

// Convenience methods
export const authGet = (endpoint: string, options?: FetchOptions) =>
    authFetch(endpoint, { ...options, method: 'GET' });

export const authPost = (endpoint: string, body?: any, options?: FetchOptions) =>
    authFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });

export const authPut = (endpoint: string, body?: any, options?: FetchOptions) =>
    authFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });

export const authPatch = (endpoint: string, body?: any, options?: FetchOptions) =>
    authFetch(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });

export const authDelete = (endpoint: string, options?: FetchOptions) =>
    authFetch(endpoint, { ...options, method: 'DELETE' });
