import { apiFetch } from '../api/api.js';
import { setState } from '../state/app-state.js';

export const projectService = {
  async list() {
    try {
      const data = await apiFetch('/projects/');
      const projects = data.results || data;
      setState({ projects });
      return projects;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async get(id) {
    try {
      return await apiFetch(`/projects/${id}/`);
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  async create(data) {
    try {
      const project = await apiFetch('/projects/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setState((s) => ({ projects: [project, ...s.projects] }));
      return project;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async update(id, patch) {
    try {
      const project = await apiFetch(`/projects/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
      setState((s) => ({
        projects: s.projects.map((p) => (p.id == id ? { ...p, ...project } : p))
      }));
      return project;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async remove(id) {
    try {
      await apiFetch(`/projects/${id}/`, { method: 'DELETE' });
      setState((s) => ({ projects: s.projects.filter((p) => p.id != id) }));
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
