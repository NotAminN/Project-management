// pages/project-detail.js — dedicated project workspace with tabbed views (Phase 8-9).
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { avatar, avatarStack } from '../components/avatar.js'
import { statusBadge, healthBadge, priorityBadge, projectStatusBadge } from '../components/badges.js'
import { taskCard } from '../components/task-card.js'
import { openTaskModal } from '../components/task-modal.js'
import { openCreateTask, openCreateProject } from '../components/quick-create.js'
import { getProject, projectTasks, getState, getActivities } from '../state/app-state.js'
import { milestones } from '../data/projects.js'
import { STATUSES } from '../data/tasks.js'
import { fmtShort, fromNow, isOverdue } from '../utils/format.js'
import { taskService } from '../services/tasks.js'
import { toast } from '../components/toast.js'
import { renderKanbanForProject } from './kanban.js'
import { renderProjectCalendar } from './project-calendar.js'
import { renderProjectTimeline } from './project-timeline.js'
import { renderFiles } from './project-files.js'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'board', label: 'Board', icon: 'kanban' },
  { id: 'list', label: 'List', icon: 'list' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'timeline', label: 'Timeline', icon: 'timeline' },
  { id: 'files', label: 'Files', icon: 'file' },
  { id: 'activity', label: 'Activity', icon: 'activity' }
]

export function renderProjectDetail(root, { id }) {
  const p = getProject(id)
  if (!p) {
    root.appendChild(el('div', { class: 'empty-state' }, [el('h3', {}, ['Project not found']), el('button', { class: 'btn btn-primary', onclick: () => location.hash = '#/app/projects' }, ['Back to projects'])]))
    return
  }
  const tasks = projectTasks(p.id)
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'Done').length

  const tabBar = el('div', { class: 'pd-tabs' }, TABS.map((t) =>
    el('button', { class: 'pd-tab' + (t.id === 'overview' ? ' active' : ''), dataset: { tab: t.id } }, [
      icon(t.icon, { size: 16 }), t.label
    ])
  ))

  const header = el('header', { class: 'pd-header' }, [
    el('div', { class: 'pd-head-main' }, [
      el('div', { class: 'pd-head-top' }, [
        el('span', { class: 'pd-glyph', style: { background: `${p.color}1a`, color: p.color } }, [icon('folder', { size: 18 })]),
        projectStatusBadge(p.status), healthBadge(p.health), el('span', { class: 'pd-code font-mono' }, [p.code])
      ]),
      el('h1', { class: 'pd-title font-display' }, [p.name]),
      el('p', { class: 'pd-desc text-secondary' }, [p.description]),
      el('div', { class: 'pd-meta' }, [
        el('span', { class: 'pd-meta-item' }, [icon('clock', { size: 14 }), 'Due ' + fmtShort(p.deadline)]),
        el('span', { class: 'pd-meta-item' }, [icon('flag', { size: 14 }), p.priority + ' priority']),
        el('span', { class: 'pd-meta-item' }, [avatarStack(p.memberIds, 24, 5), p.memberIds.length + ' members'])
      ])
    ]),
    el('div', { class: 'pd-head-actions' }, [
      el('button', { class: 'btn btn-ghost', onclick: () => openCreateTask({ projectId: p.id }) }, [icon('plus', { size: 15 }), 'Add task']),
      el('button', { class: 'btn btn-primary', onclick: () => { const t = tasks[0]; if (t) openTaskModal(t.id) } }, ['Open board'])
    ])
  ])

  const panel = el('div', { class: 'pd-panel', id: 'pd-panel' })
  const page = el('div', { class: 'page project-detail' }, [header, tabBar, panel])
  root.appendChild(page)

  // Tab switching
  tabBar.addEventListener('click', (e) => {
    const b = e.target.closest('.pd-tab')
    if (!b) return
    tabBar.querySelectorAll('.pd-tab').forEach((x) => x.classList.toggle('active', x === b))
    renderTab(b.dataset.tab, panel, p)
  })

  renderTab('overview', panel, p)
}

function renderTab(tab, panel, p) {
  panel.innerHTML = ''
  if (tab === 'overview') renderOverview(panel, p)
  else if (tab === 'board') renderKanbanForProject(panel, p)
  else if (tab === 'list') renderProjectList(panel, p)
  else if (tab === 'calendar') renderProjectCalendar(panel, p)
  else if (tab === 'timeline') renderProjectTimeline(panel, p)
  else if (tab === 'files') renderFiles(panel, p)
  else if (tab === 'activity') renderProjectActivity(panel, p)
}

function renderOverview(panel, p) {
  const tasks = projectTasks(p.id)
  const done = tasks.filter((t) => t.status === 'Done').length

  const grid = el('div', { class: 'pd-overview' }, [
    el('section', { class: 'card card-pad pd-progress' }, [
      el('div', { class: 'card-head' }, [el('h3', {}, ['Progress']), el('span', { class: 'font-mono pd-pct' }, [p.progress + '%'])]),
      el('div', { class: 'progress', style: { height: '8px' } }, [el('div', { class: 'progress-bar', style: { width: p.progress + '%', background: p.color } })]),
      el('div', { class: 'pd-stats-row' }, [
        stat('Tasks', tasks.length), stat('Done', done), stat('Members', p.memberIds.length), stat('Health', p.health)
      ])
    ]),
    el('section', { class: 'card card-pad pd-tasks' }, [
      el('div', { class: 'card-head' }, [el('h3', {}, ['Tasks']), el('button', { class: 'btn btn-subtle btn-sm', onclick: () => location.hash = `#/app/project/${p.id}` })]),
      el('div', { class: 'pd-task-list' }, tasks.slice(0, 5).map((t) => taskCard(t, { onClick: (t) => openTaskModal(t.id) })))
    ]),
    el('section', { class: 'card card-pad pd-ms' }, [
      el('div', { class: 'card-head' }, [el('h3', {}, ['Milestones']), el('button', { class: 'btn btn-subtle btn-sm' }, ['Add'])]),
      milestonesView(p)
    ]),
    el('section', { class: 'card card-pad pd-team' }, [
      el('div', { class: 'card-head' }, [el('h3', {}, ['Team'])]),
      el('div', { class: 'pd-team-list' }, p.memberIds.map((id) => {
        const u = getState().users.find((x) => x.id === id)
        return el('div', { class: 'pd-team-row' }, [avatar(id, 32), el('div', {}, [el('strong', {}, [u?.name]), el('span', { class: 'text-secondary' }, [u?.title])])])
      }))
    ]),
    el('aside', { class: 'card card-pad pd-activity-card' }, [
      el('div', { class: 'card-head' }, [el('h3', {}, ['Recent activity'])]),
      renderProjectActivityList(p)
    ])
  ])
  panel.appendChild(grid)
}

function milestonesView(p) {
  const ms = milestones.filter((m) => m.projectId === p.id)
  if (!ms.length) return el('p', { class: 'text-secondary' }, ['No milestones yet.'])
  return el('div', { class: 'pd-ms-list' }, ms.map((m) =>
    el('div', { class: 'pd-ms-row' }, [
      el('span', { class: 'pd-ms-check' + (m.done ? ' done' : '') }, [m.done ? icon('check', { size: 12 }) : null].filter(Boolean)),
      el('div', {}, [el('span', { class: 'pd-ms-name' }, [m.name]), el('span', { class: 'text-secondary pd-ms-date' }, [fmtShort(m.date)])])
    ])
  ))
}

function renderProjectActivityList(p) {
  const acts = getActivities().filter((a) => a.projectId === p.id).slice(0, 6)
  if (!acts.length) return el('p', { class: 'text-secondary' }, ['No activity yet.'])
  return el('div', { class: 'activity-list' }, acts.map((a) => {
    const u = getState().users.find((x) => x.id === a.user)
    return el('div', { class: 'activity-item' }, [
      el('span', { class: 'activity-dot' }),
      el('div', { class: 'activity-body' }, [
        el('p', {}, [el('strong', {}, [u?.name || 'Someone']), ' ', a.verb, ' ', el('span', { class: 'activity-target' }, [a.target])]),
        el('span', { class: 'text-secondary activity-time' }, [fromNow(a.time)])
      ])
    ])
  }))
}

function renderProjectActivity(panel, p) {
  panel.appendChild(el('div', { class: 'card card-pad' }, [renderProjectActivityList(p)]))
}

function renderProjectList(panel, p) {
  const tasks = projectTasks(p.id)
  const table = el('div', { class: 'task-table' }, [
    el('div', { class: 'tt-head' }, [el('span', {}, ['Task']), el('span', {}, ['Status']), el('span', {}, ['Priority']), el('span', {}, ['Due']), el('span', {}, ['Assignee'])]),
    ...tasks.map((t) => {
      const row = el('div', { class: 'tt-row', role: 'button', tabindex: '0', onclick: () => openTaskModal(t.id) }, [
        el('span', { class: 'tt-title' }, [t.title]),
        el('span', { class: 'tt-badge' }, [statusBadge(t.status)]),
        el('span', { class: 'tt-badge' }, [priorityBadge(t.priority)]),
        el('span', { class: 'tt-due' }, [fmtShort(t.due)]),
        el('span', { class: 'tt-assignee' }, [avatar(t.assignee, 26)])
      ])
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter') openTaskModal(t.id) })
      return row
    })
  ])
  panel.appendChild(table)
}

function stat(label, val) {
  return el('div', { class: 'pd-stat' }, [el('span', { class: 'pd-stat-num font-display' }, [String(val)]), el('span', { class: 'pd-stat-label text-secondary' }, [label])])
}
