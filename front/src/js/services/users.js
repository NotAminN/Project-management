import { apiFetch } from '../api/api.js';
import { setState } from '../state/app-state.js';

export const userService = {
  async list() {
    try {
      const data = await apiFetch('/users/');
      const users = (data.results || data).map(u => ({
        ...u,
        name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username
      }));
      setState({ users });
      return users;
    } catch (e) {
      console.error('Fetch users failed:', e);
      return [];
    }
  },

  async getProfile() {
    try {
      const profile = await apiFetch('/users/profile/');
      const formatted = {
        ...profile,
        name: profile.name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username
      };
      setState((s) => {
        const existingUsers = s.users.filter(u => u.id !== profile.id);
        return {
          currentUserId: profile.id,
          users: [formatted, ...existingUsers],
          ui: { ...s.ui, role: profile.role || s.ui.role }
        };
      });
      return formatted;
    } catch (e) {
      console.error('Fetch profile failed:', e);
      return null;
    }
  },

  async updateProfile(data) {
    try {
      const updated = await apiFetch('/users/profile/', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      const formatted = {
        ...updated,
        name: updated.name || [updated.first_name, updated.last_name].filter(Boolean).join(' ') || updated.username
      };
      setState((s) => ({
        users: s.users.map(u => u.id === formatted.id ? formatted : u)
      }));
      return formatted;
    } catch (e) {
      console.error('Update profile failed:', e);
      throw e;
    }
  },

  async get(id) {
    const users = await this.list();
    return users.find(u => u.id == id);
  },

  async invite(data) {
    try {
      const json = await apiFetch('/users/register/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      const user = json.user || json;
      const formatted = {
        ...user,
        name: user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
      };
      setState((s) => ({ users: [...s.users, formatted] }));
      return formatted;
    } catch (e) {
      console.error('Invite user failed:', e);
      throw e;
    }
  },

  async setWorkspace(id) {
    setState({ workspaceId: id });
  }
};
