// pages/dashboard.js — premium productivity dashboard.
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { projectCard } from '../components/project-card.js'
import { taskRow } from '../components/task-card.js'
import { avatar, avatarStack } from '../components/avatar.js'
import { statusBadge, healthBadge } from '../components/badges.js'
import { openTaskModal } from '../components/task-modal.js'
import { openCreateTask } from '../components/quick-create.js'
import { getState, workspaceProjects, projectTasks, getActivities, getCurrentUser } from '../state/app-state.js'
import { fmtShort, fromNow, TODAY, addDays, isOverdue } from '../utils/format.js'
import { scrollRevealGroup } from '../animations/gsap.js'

function greeting() {
  const h = TODAY.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

import { projectService } from '../services/projects.js'
import { taskService } from '../services/tasks.js'

export async function renderDashboard(root) {
  root.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">Loading Dashboard...</div>'
  await projectService.list()
  await taskService.list()
  root.innerHTML = ''

  const user = getCurrentUser()
  const projects = workspaceProjects().filter((p) => p.status !== 'Archived')
  const allTasks = getState().tasks
  const myTasks = allTasks
    .filter((t) => t.assignee === user.id && t.status !== 'Done')
    .sort((a, b) => new Date(a.due) - new Date(b.due))

  const doneThisWeek = allTasks.filter((t) => t.status === 'Done').length
  const overdue = myTasks.filter((t) => isOverdue(t.due)).length
  const onTrack = 78

  // My tasks filter (hoisted before page construction)
  const taskChips = ['Today', 'Upcoming', 'Overdue'].map((label) =>
    el('button', { class: 'chip' + (label === 'Today' ? ' active' : ''), dataset: { filter: label } }, [label])
  )
  const taskList = el('div', { class: 'dash-tasks' })
  const tasksGrid = el('section', { class: 'dash-col dash-col-main' }, [
    sectionHead('My tasks', taskChips),
    taskList
  ])
  function applyTaskFilter(filter) {
    let list = myTasks
    if (filter === 'Today') list = myTasks.filter((t) => fromNowEq(t.due) === 'Today')
    else if (filter === 'Upcoming') list = myTasks.filter((t) => fromNowEq(t.due) !== 'Today' && !isOverdue(t.due))
    else if (filter === 'Overdue') list = myTasks.filter((t) => isOverdue(t.due))
    taskList.innerHTML = ''
    if (!list.length) { taskList.append(emptyState('Nothing here.')); return }
    list.slice(0, 6).forEach((t) => taskList.append(taskRow(t, { onClick: (t) => openTaskModal(t.id), showProject: true })))
  }
  taskChips.forEach((chip) => chip.addEventListener('click', () => {
    taskChips.forEach((c) => c.classList.toggle('active', c === chip))
    applyTaskFilter(chip.dataset.filter)
  }))
  applyTaskFilter('Today')

  const page = el('div', { class: 'page dashboard' }, [
    // Hero summary
    el('section', { class: 'dash-hero reveal' }, [
      el('div', { class: 'dash-hero-copy' }, [
        el('h2', { class: 'dash-greet font-display' }, [`${greeting()}, ${user.first_name || user.name || user.username || 'User'}.`]),
        el('p', { class: 'dash-sub text-secondary' }, [
          `Your team is `, el('strong', { style: { color: 'var(--color-gold-deep)' } }, [`${onTrack}% on track`]), ` this week — ${overdue} task${overdue === 1 ? '' : 's'} need attention.`
        ])
      ]),
      el('div', { class: 'dash-hero-actions' }, [
        el('button', { class: 'btn btn-primary', onclick: () => openCreateTask() }, [icon('plus', { size: 16 }), 'New task']),
        el('button', { class: 'btn btn-soft', onclick: () => location.hash = '#/app/projects' }, ['View projects'])
      ])
    ]),

    // Metric cards
    el('section', { class: 'dash-metrics' }, [
      metricCard('Active projects', String(projects.filter((p) => p.status === 'Active').length), 'folder', '#b99a5b', '2 launching soon'),
      metricCard('My open tasks', String(myTasks.length), 'task', '#7186a3', 'across 4 projects'),
      metricCard('Completed', String(doneThisWeek), 'check', '#6e9b7c', 'this period'),
      metricCard('Overdue', String(overdue), 'clock', '#b5615e', overdue ? 'review needed' : 'all clear')
    ]),

    // Main grid: my tasks + activity + projects
    el('div', { class: 'dash-grid' }, [
      tasksGrid,
      el('aside', { class: 'dash-col dash-col-side' }, [
        // Team health
        el('section', { class: 'card card-pad dash-team' }, [
          el('div', { class: 'card-head' }, [el('h3', {}, ['Team on track']), healthBadge('Healthy')]),
          el('div', { class: 'dash-team-row' }, [
            miniHealth('Aurora Redesign', 72, '#b99a5b'),
            miniHealth('API Platform v2', 48, '#7186a3'),
            miniHealth('Brand System', 61, '#a07d9e')
          ]),
          el('div', { class: 'dash-team-foot' }, [
            el('span', { class: 'text-secondary' }, ['Members']),
            avatarStack(projects[0]?.memberIds || [], 26, 5)
          ])
        ]),
        // Activity
        el('section', { class: 'card card-pad dash-activity' }, [
          el('div', { class: 'card-head' }, [el('h3', {}, ['Recent activity']), el('button', { class: 'btn btn-subtle btn-sm', onclick: () => location.hash = '#/app/activity' }, ['All'])]),
          buildActivity(getActivities().slice(0, 5))
        ])
      ])
    ]),

    // Projects row
    el('section', { class: 'dash-projects' }, [
      sectionHead('Active projects', [
        el('button', { class: 'btn btn-soft btn-sm', onclick: () => location.hash = '#/app/projects' }, ['See all'])
      ]),
      el('div', { class: 'dash-project-grid' }, projects.filter((p) => p.status === 'Active' || p.status === 'Planning').map((p) =>
        projectCard(p, { onClick: () => location.hash = `#/app/project/${p.id}` })
      ))
    ])
  ])

  root.appendChild(page)
  scrollRevealGroup('.dash-metrics', '.metric-card', { y: 20, stagger: 0.06 })
  scrollRevealGroup('.dash-tasks', '.task-row', { y: 14, stagger: 0.05 })
  scrollRevealGroup('.dash-project-grid', '.project-card', { y: 24, stagger: 0.07 })
}

function metricCard(label, num, ic, color, sub) {
  return el('article', { class: 'metric-card card card-pad' }, [
    el('div', { class: 'metric-ic', style: { background: `${color}1a`, color } }, [icon(ic, { size: 18 })]),
    el('div', {}, [
      el('span', { class: 'metric-label text-secondary' }, [label]),
      el('span', { class: 'metric-num font-display' }, [num]),
      el('span', { class: 'metric-sub text-secondary' }, [sub])
    ])
  ])
}

function miniHealth(name, val, color) {
  return el('div', { class: 'mini-health' }, [
    el('div', { class: 'mini-health-top' }, [el('span', {}, [name]), el('span', { class: 'font-mono' }, [val + '%'])]),
    el('div', { class: 'progress' }, [el('div', { class: 'progress-bar', style: { width: val + '%', background: color } })])
  ])
}

function buildActivity(items) {
  return el('div', { class: 'activity-list' }, items.map((a) => {
    const u = getState().users.find((x) => x.id === a.user)
    const verbColor = { comment: '#7186a3', mention: '#b99a5b', create: '#6e9b7c', complete: '#879887', status: '#a07d9e', invite: '#5f8a8b' }[a.type] || '#a39d93'
    return el('div', { class: 'activity-item' }, [
      el('span', { class: 'activity-dot', style: { background: verbColor } }),
      el('div', { class: 'activity-body' }, [
        el('p', {}, [el('strong', {}, [u?.name || 'Someone']), ' ', a.verb, ' ', el('span', { class: 'activity-target' }, [a.target])]),
        el('span', { class: 'text-secondary activity-time' }, [a.meta ? a.meta + ' · ' : '', fromNow(a.time)])
      ])
    ])
  }))
}

function sectionHead(title, action) {
  return el('div', { class: 'page-head' }, [
    el('h3', { class: 'page-head-title' }, [title]),
    action ? el('div', { class: 'page-head-actions' }, [action]) : null
  ].filter(Boolean))
}

function emptyState(text) {
  return el('div', { class: 'empty-mini' }, [icon('check', { size: 18 }), el('span', {}, [text])])
}

function fromNowEq(d) {
  const date = d instanceof Date ? d : new Date(d)
  const today = new Date()
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((startOf(date) - startOf(today)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === -1) return 'Yesterday'
  if (diff === 1) return 'Tomorrow'
  return ''
}
