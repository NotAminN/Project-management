import { apiFetch } from '../api/api.js';
import { setState } from '../state/app-state.js';

export const notificationService = {
  async list() {
    try {
      const data = await apiFetch('/notifications/');
      const notifications = data.results || data;
      setState({ notifications });
      return notifications;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async markRead(id) {
    try {
      await apiFetch(`/notifications/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: true })
      });
      setState((s) => ({
        notifications: s.notifications.map((n) => (n.id == id ? { ...n, is_read: true } : n))
      }));
    } catch (e) {
      console.error(e);
    }
  },
  async markAllRead() {
    setState((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true }))
    }));
  },
  async remove(id) {
    try {
      await apiFetch(`/notifications/${id}/`, { method: 'DELETE' });
      setState((s) => ({
        notifications: s.notifications.filter((n) => n.id != id)
      }));
    } catch (e) {
      console.error(e);
    }
  },
  push(ntf) {
    setState((s) => ({
      notifications: [
        { id: 'nt_' + Date.now(), is_read: false, created_at: new Date(), ...ntf },
        ...s.notifications
      ]
    }));
  }
}
