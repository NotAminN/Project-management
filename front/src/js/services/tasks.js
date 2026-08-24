import { apiFetch } from '../api/api.js';
import { setState } from '../state/app-state.js';

export const taskService = {
  async list(projectId) {
    try {
      let url = '/tasks/';
      if (projectId) url += `?project=${projectId}`;
      const data = await apiFetch(url);
      const tasks = data.results || data;
      
      // Update state without wiping other projects' tasks
      setState((s) => {
          const others = projectId ? s.tasks.filter(t => t.project != projectId) : [];
          return { tasks: [...others, ...tasks] };
      });
      
      return tasks;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async get(id) {
    try {
      return await apiFetch(`/tasks/${id}/`);
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  async create(data) {
    try {
      const task = await apiFetch('/tasks/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setState((s) => ({ tasks: [task, ...s.tasks] }));
      return task;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async update(id, patch) {
    try {
      const task = await apiFetch(`/tasks/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
      setState((s) => ({
        tasks: s.tasks.map((t) => (t.id == id ? { ...t, ...task } : t))
      }));
      return task;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async move(id, status) {
    return this.update(id, { status });
  },
  async remove(id) {
    try {
      await apiFetch(`/tasks/${id}/`, { method: 'DELETE' });
      setState((s) => ({ tasks: s.tasks.filter((t) => t.id != id) }));
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async addSubtask(id, text) {
    // Requires subtask API/model, for now we will skip or simulate
    console.warn("Subtasks not fully implemented in backend");
  },
  async toggleSubtask(id, subId) {
    console.warn("Subtasks not fully implemented in backend");
  },
  async removeSubtask(id, subId) {
    console.warn("Subtasks not fully implemented in backend");
  },
  async addComment(id, text) {
    try {
      const comment = await apiFetch('/comments/', {
        method: 'POST',
        body: JSON.stringify({ task: id, content: text })
      });
      return comment;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
