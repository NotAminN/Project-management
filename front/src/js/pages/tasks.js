// pages/tasks.js — Kanban board with drag & drop (Phase 10) + list toggle (Phase 11).
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { taskCard } from '../components/task-card.js'
import { openTaskModal } from '../components/task-modal.js'
import { openCreateTask } from '../components/quick-create.js'
import { taskService } from '../services/tasks.js'
import { getState } from '../state/app-state.js'
import { STATUSES } from '../data/tasks.js'
import { statusBadge, priorityBadge } from '../components/badges.js'
import { avatar } from '../components/avatar.js'
import { toast } from '../components/toast.js'
import { canAccessView, showUpgradeModal, getCurrentPlan } from '../utils/plan-guard.js'

let currentView = 'board'

export async function renderTasks(root) {
  root.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">Loading Tasks...</div>'
  await taskService.list()
  root.innerHTML = ''

  const wrap = el('div', { class: 'page tasks' })

  const toggle = el('div', { class: 'tabs' }, [
    tabBtn('Board', 'board'),
    tabBtn('List', 'list')
  ])

  const top = el('div', { class: 'page-top' }, [
    el('div', {}, [
      el('h2', { class: 'page-title font-display' }, ['My Tasks']),
      el('p', { class: 'page-sub text-secondary' }, ['Everything assigned to you, across all projects.'])
    ]),
    el('div', { class: 'tasks-top-actions' }, [toggle, el('button', { class: 'btn btn-primary', onclick: () => openCreateTask() }, [icon('plus', { size: 15 }), 'New task'])])
  ])

  const body = el('div', { class: 'tasks-body', id: 'tasks-body' })
  wrap.append(top, body)
  root.appendChild(wrap)

  renderByView(body)

  function renderByView(node) {
    node.innerHTML = ''
    if (getCurrentPlan() === 'Free' && currentView === 'board') {
      currentView = 'list'
    }
    if (currentView === 'board') renderBoard(node)
    else renderList(node)
  }

  function tabBtn(label, view) {
    const isFreeRestricted = view === 'board' && !canAccessView('kanban').allowed
    const b = el('button', { class: 'tab' + (currentView === view ? ' active' : ''), dataset: { view } }, [
      label,
      isFreeRestricted ? el('span', { class: 'badge badge-gold', style: { fontSize: '10px', marginLeft: '6px', padding: '1px 5px' } }, ['PRO']) : null
    ].filter(Boolean))

    b.addEventListener('click', () => {
      if (view === 'board') {
        const access = canAccessView('kanban')
        if (!access.allowed) {
          showUpgradeModal('Kanban Board Requires Pro Plan', access.reason)
          return
        }
      }
      currentView = view
      toggle.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view))
      renderByView(body)
    })
    return b
  }
}

function myTasks() {
  const me = getState().currentUserId
  return getState().tasks.filter((t) => !me || t.assignee == me || t.assigned_to == me || !t.assignee)
}

function renderBoard(body) {
  const counts = {}
  const cols = el('div', { class: 'kanban', id: 'kanban' }, STATUSES.map((s) => {
    const tasks = myTasks().filter((t) => t.status === s)
    counts[s] = tasks.length
    return column(s, tasks)
  }))
  body.appendChild(cols)
  wireDnd(cols)
}

function column(status, tasks) {
  const list = el('div', { class: 'kanban-list', dataset: { status } }, tasks.map((t) => taskCard(t, { onClick: (t) => openTaskModal(t.id) })))
  const col = el('div', { class: 'kanban-col' }, [
    el('div', { class: 'kanban-col-head' }, [
      el('span', { class: 'kanban-col-dot', style: { background: kanbanColor(status) } }),
      el('span', { class: 'kanban-col-name' }, [status]),
      el('span', { class: 'kanban-col-count' }, [tasks.length])
    ]),
    list,
    el('button', { class: 'kanban-add', onclick: () => openCreateTask({ status }) }, [icon('plus', { size: 14 }), 'Add'])
  ])
  return col
}

function kanbanColor(status) {
  return { Backlog: '#a39d93', Todo: '#7186a3', 'In Progress': '#b99a5b', Review: '#c8a24b', Done: '#6e9b7c' }[status] || '#a39d93'
}

function wireDnd(board) {
  let draggedId = null

  board.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.task-card')
    if (!card) return
    draggedId = card.dataset.id
  })
  board.addEventListener('dragend', () => draggedId = null)

  board.querySelectorAll('.kanban-list').forEach((list) => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault()
      list.classList.add('drag-over')
      const after = getDragAfter(list, e.clientY)
      const dragging = board.querySelector('.task-card.dragging')
      if (!dragging) return
      if (after == null) list.appendChild(dragging)
      else list.insertBefore(dragging, after)
    })
    list.addEventListener('dragleave', (e) => {
      if (!list.contains(e.relatedTarget)) list.classList.remove('drag-over')
    })
    list.addEventListener('drop', async (e) => {
      e.preventDefault()
      list.classList.remove('drag-over')
      const status = list.dataset.status
      if (draggedId) {
        await taskService.move(draggedId, status)
        const t = getState().tasks.find((x) => x.id === draggedId)
        if (t) toast(`${t.title} → ${status}`, { type: 'info' })
        // re-render to keep counts correct
        const body = $('#tasks-body')
        if (body) { body.innerHTML = ''; renderBoard(body) }
      }
    })
  })
}

function getDragAfter(list, y) {
  const cards = Array.from(list.querySelectorAll('.task-card:not(.dragging)'))
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) return { offset, element: child }
    return closest
  }, { offset: -Infinity, element: null }).element
}

function renderList(body) {
  const tasks = myTasks().sort((a, b) => new Date(a.due) - new Date(b.due))
  const table = el('div', { class: 'task-table' }, [
    el('div', { class: 'tt-head' }, [
      el('span', {}, ['Task']), el('span', {}, ['Status']), el('span', {}, ['Priority']),
      el('span', {}, ['Due']), el('span', {}, ['Assignee'])
    ]),
    ...tasks.map((t) => {
      const row = el('div', { class: 'tt-row', role: 'button', tabindex: '0', onclick: () => openTaskModal(t.id) }, [
        el('span', { class: 'tt-title' }, [t.title]),
        el('span', { class: 'tt-badge' }, [statusBadge(t.status)]),
        el('span', { class: 'tt-badge' }, [priorityBadge(t.priority)]),
        el('span', { class: 'tt-due' }, [fmtDate(t.due)]),
        el('span', { class: 'tt-assignee' }, [avatar(t.assignee, 26)])
      ])
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter') openTaskModal(t.id) })
      return row
    })
  ])
  body.appendChild(table)
}

function fmtDate(d) {
  const date = d instanceof Date ? d : new Date(d)
  return `${date.toLocaleString('en', { month: 'short' })} ${date.getDate()}`
}
