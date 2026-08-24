export const BASE_URL = 'http://localhost:8001/api';

export function getTokens() {
    return {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token'),
    };
}

export function setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export async function apiFetch(endpoint, options = {}) {
    let { access } = getTokens();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (access) {
        headers['Authorization'] = `Bearer ${access}`;
    }

    let response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401 && getTokens().refresh) {
        const refreshed = await refreshToken();
        if (refreshed) {
            headers['Authorization'] = `Bearer ${getTokens().access}`;
            response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
        } else {
            clearTokens();
            window.location.hash = '#/';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) {
        let errorData = null;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { detail: response.statusText };
        }
        throw { status: response.status, data: errorData };
    }
    
    if (response.status === 204) return null;
    return response.json();
}

async function refreshToken() {
    const { refresh } = getTokens();
    try {
        const res = await fetch(`${BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });
        if (res.ok) {
            const data = await res.json();
            setTokens(data.access, refresh); // simplejwt returns new access token
            return true;
        }
    } catch (e) {
        console.error('Refresh token error:', e);
    }
    return false;
}
