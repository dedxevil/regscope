// --- API Service for the Chat Widget ---

const BASE_URL_KEY = 'chatBackendUrl';

// Retrieves the base URL from localStorage.
const getBaseUrlFromStorage = (): string => localStorage.getItem(BASE_URL_KEY) || '';

/**
 * Validates and persists the backend URL to localStorage.
 * @param url The backend URL to save.
 * @returns True if the URL was valid and saved, otherwise false.
 */
export const setBaseUrl = (url: string): boolean => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const cleanedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
        // Persist the cleaned URL in localStorage for future sessions.
        localStorage.setItem(BASE_URL_KEY, cleanedUrl);
        return true;
    }
    return false;
};

/**
 * Gets the persisted backend URL from localStorage.
 * @returns The saved URL, or an empty string if not set.
 */
export const getBaseUrl = (): string => {
    return getBaseUrlFromStorage();
};

export const clearBaseUrl = (): void => {
    localStorage.removeItem(BASE_URL_KEY);
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getBaseUrlFromStorage();
    if (!baseUrl) {
        throw new Error('Backend URL is not configured.');
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const createThread = () => apiRequest('/threads', { method: 'POST' });

export const getMessages = (threadId: string) => apiRequest(`/threads/${threadId}/messages`);

export const sendMessage = (threadId: string, content: string) => {
    return apiRequest(`/threads/${threadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ role: 'user', content }),
    });
};

export const runAgent = (threadId: string) => apiRequest(`/threads/${threadId}/run`, { method: 'POST' });

export const getRunStatus = (threadId: string, runId: string) => apiRequest(`/threads/${threadId}/run/${runId}`);