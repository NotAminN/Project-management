// state/app-state.js — central, modular application state.
// No mock data. Starts empty and gets filled by services/api.
const STORAGE_KEY = 'northwind.state.v2'

const listeners = new Set()
let state

const DEFAULT_WORKSPACE = {
  id: 'ws_default',
  name: 'Main Workspace',
  kind: 'Workspace',
  role: 'Member',
  color: '#b99a5b'
}

const DEFAULT_USER = {
  id: 'default_user',
  name: 'User',
  username: 'User',
  email: '',
  role: 'Member'
}

function defaultState() {
  return {
    ui: {
      sidebarCollapsed: false,
      role: 'Member',
      onboardingDone: false
    },
    workspaceId: 'ws_default',
    currentUserId: null,
    projects: [],
    tasks: [],
    users: [],
    workspaces: [],
    notifications: [],
    activities: [],
    filters: {
      status: 'all',
      priority: 'all',
      assignee: 'all',
      project: 'all',
      label: 'all',
      search: ''
    },
    sort: 'recent'
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const saved = JSON.parse(raw)
    const base = defaultState()
    return {
      ...base,
      ui: { ...base.ui, ...(saved.ui || {}) },
      workspaceId: saved.workspaceId || base.workspaceId,
      currentUserId: saved.currentUserId || base.currentUserId,
      filters: { ...base.filters, ...(saved.filters || {}) },
      sort: saved.sort || base.sort
    }
  } catch {
    return defaultState()
  }
}

function persist() {
  try {
    const { ui, workspaceId, currentUserId, filters, sort } = state
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ui, workspaceId, currentUserId, filters, sort })
    )
  } catch {
    // ignore
  }
}

state = load()

export function getState() { return state }
export function getUI() { return state.ui }

export function getWorkspace() {
  return state.workspaces.find((w) => w.id === state.workspaceId) || state.workspaces[0] || DEFAULT_WORKSPACE
}

export function getProjects() { return state.projects }
export function getProject(id) { return state.projects.find((p) => p.id == id) }
export function getTasks() { return state.tasks }
export function getTask(id) { return state.tasks.find((t) => t.id == id) }
export function getUsers() { return state.users }

export function getUser(id) {
  const found = state.users.find((u) => u.id == id)
  if (found) {
    return { ...found, name: found.name || found.first_name || found.username || 'User' }
  }
  return { id: id || 'me', name: 'User' }
}

export function getCurrentUser() {
  const found = state.users.find((u) => u.id == state.currentUserId) || state.users[0]
  if (found) {
    return { ...found, name: found.name || found.first_name || found.username || 'User' }
  }
  return DEFAULT_USER
}

export function getNotifications() { return state.notifications }
export function getActivities() { return state.activities }

function emit() {
  listeners.forEach((fn) => fn(state))
}

export function setState(patch, opts = {}) {
  Object.assign(state, typeof patch === 'function' ? patch(state) : patch)
  if (opts.persist !== false) persist()
  emit()
}

export function updateUI(patch, opts = {}) {
  state.ui = { ...state.ui, ...patch }
  if (opts.persist !== false) persist()
  emit()
}

export function setWorkspace(id) {
  state.workspaceId = id
  persist()
  emit()
}

export function setRole(role) {
  state.ui.role = role
  persist()
  emit()
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function projectTasks(projectId) {
  return state.tasks.filter((t) => t.project == projectId || t.projectId == projectId)
}

export function workspaceProjects() {
  return state.projects
}

export function unreadCount() {
  return state.notifications.filter((n) => n.is_read === false || !n.read).length
}

const ROLE_RANK = { Owner: 4, Admin: 3, Manager: 2, Member: 1, Viewer: 0 }
export function can(level) {
  return ROLE_RANK[state.ui.role] >= (ROLE_RANK[level] || 0)
}
