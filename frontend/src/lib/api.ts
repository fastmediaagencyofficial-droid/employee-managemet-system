import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = '/api';

interface TokenRefreshQueue {
    resolve: (value: string) => void;
    reject: (error: any) => void;
}

let isRefreshing = false;
let refreshQueue: TokenRefreshQueue[] = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any = null, token: string | null = null) => {
    refreshQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token!);
        }
    });
    refreshQueue = [];
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        return accessToken;
    } catch (error) {
        // Clear tokens if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login
        window.location.href = '/login';

        throw error;
    }
};

/**
 * Create axios instance with interceptors
 */
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor - attach token
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem('accessToken');

            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - handle token expiry
    client.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            // Check if error is due to expired token
            if (
                error.response?.status === 401 &&
                originalRequest &&
                !originalRequest._retry
            ) {
                const errorData = error.response.data as any;

                // Check if it's specifically a token expiry
                if (errorData?.code === 'TOKEN_EXPIRED' || errorData?.message?.includes('expired')) {
                    originalRequest._retry = true;

                    if (isRefreshing) {
                        // Wait for the token to be refreshed
                        return new Promise((resolve, reject) => {
                            refreshQueue.push({ resolve, reject });
                        })
                            .then((token) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                }
                                return client(originalRequest);
                            })
                            .catch((err) => {
                                return Promise.reject(err);
                            });
                    }

                    isRefreshing = true;

                    try {
                        const newAccessToken = await refreshAccessToken();
                        processQueue(null, newAccessToken);

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        }

                        return client(originalRequest);
                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }

                // Token is invalid (not just expired) - logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );

    return client;
};

/**
 * API client instance
 */
export const api = createApiClient();

/**
 * Setup logout sync across tabs
 */
export const setupLogoutSync = () => {
    window.addEventListener('storage', (event) => {
        // Check if accessToken was removed (logout in another tab)
        if (event.key === 'accessToken' && event.newValue === null) {
            // Force logout in this tab too
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    });
};

/**
 * Setup session timeout (30 minutes of inactivity)
 */
export const setupSessionTimeout = () => {
    const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            // Auto-logout after inactivity
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login?reason=session_timeout';
        }, TIMEOUT_DURATION);
    };

    // Reset timer on user activity
    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activities.forEach((activity) => {
        document.addEventListener(activity, resetTimer, true);
    });

    // Initialize timer
    resetTimer();

    return () => {
        // Cleanup
        activities.forEach((activity) => {
            document.removeEventListener(activity, resetTimer, true);
        });
        clearTimeout(timeoutId);
    };
};

export default api;
