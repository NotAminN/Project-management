import { apiFetch, setTokens, clearTokens, BASE_URL } from '../api/api.js';
import { setState } from '../state/app-state.js';

export const authService = {
  async login(username, password) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    } catch (networkErr) {
      throw { network: true, message: 'Unable to connect to server. Please check your network or server status.' };
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { detail: 'Server error occurred' };
    }

    if (!res.ok) {
      throw { status: res.status, data };
    }

    setTokens(data.access, data.refresh);
    
    // Fetch profile
    try {
      const profile = await this.getProfile();
      setState({ currentUserId: profile.id, ui: { role: profile.role } });
    } catch (e) {
      console.warn('Profile fetch after login failed:', e);
    }
    
    return data;
  },

  async register(data) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (networkErr) {
      throw { network: true, message: 'Unable to connect to server.' };
    }

    let json;
    try {
      json = await res.json();
    } catch (e) {
      json = { detail: 'Server error occurred' };
    }

    if (!res.ok) {
      throw { status: res.status, data: json };
    }

    setTokens(json.access, json.refresh);
    setState({ currentUserId: json.user?.id, ui: { role: json.user?.role } });
    return json;
  },

  logout() {
    clearTokens();
    window.location.hash = '#/';
  },

  async getProfile() {
    return await apiFetch('/users/profile/');
  }
};
