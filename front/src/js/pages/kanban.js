// pages/kanban.js — reusable Kanban board for a given project (drag & drop included).
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { taskCard } from '../components/task-card.js'
import { openTaskModal } from '../components/task-modal.js'
import { openCreateTask } from '../components/quick-create.js'
import { taskService } from '../services/tasks.js'
import { getState } from '../state/app-state.js'
import { STATUSES } from '../data/tasks.js'
import { toast } from '../components/toast.js'

const COLORS = { Backlog: '#a39d93', Todo: '#7186a3', 'In Progress': '#b99a5b', Review: '#c8a24b', Done: '#6e9b7c' }

export function renderKanbanForProject(panel, p) {
  const board = el('div', { class: 'kanban' }, STATUSES.map((s) => {
    const tasks = projectTasksFor(p.id, s)
    return column(s, tasks, p)
  }))
  panel.appendChild(board)
  wireDnd(board, p.id)
}

function projectTasksFor(projectId, status) {
  return getState().tasks.filter((t) => (t.projectId == projectId || t.project == projectId) && t.status === status)
}

function column(status, tasks, p) {
  const list = el('div', { class: 'kanban-list', dataset: { status } },
    tasks.map((t) => taskCard(t, { onClick: (t) => openTaskModal(t.id) }))
  )
  return el('div', { class: 'kanban-col' }, [
    el('div', { class: 'kanban-col-head' }, [
      el('span', { class: 'kanban-col-dot', style: { background: COLORS[status] } }),
      el('span', { class: 'kanban-col-name' }, [status]),
      el('span', { class: 'kanban-col-count' }, [tasks.length])
    ]),
    list,
    el('button', { class: 'kanban-add', onclick: () => openCreateTask({ projectId: p.id, status }) }, [icon('plus', { size: 14 }), 'Add'])
  ])
}

function wireDnd(board, projectId) {
  let draggedId = null
  board.addEventListener('dragstart', (e) => { const c = e.target.closest('.task-card'); if (c) draggedId = c.dataset.id })
  board.addEventListener('dragend', () => { draggedId = null })

  board.querySelectorAll('.kanban-list').forEach((list) => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault()
      list.classList.add('drag-over')
      const dragging = board.querySelector('.task-card.dragging')
      if (!dragging) return
      const after = getDragAfter(list, e.clientY)
      if (after == null) list.appendChild(dragging)
      else list.insertBefore(dragging, after)
    })
    list.addEventListener('dragleave', (e) => { if (!list.contains(e.relatedTarget)) list.classList.remove('drag-over') })
    list.addEventListener('drop', async (e) => {
      e.preventDefault()
      list.classList.remove('drag-over')
      const status = list.dataset.status
      if (draggedId) {
        await taskService.move(draggedId, status)
        const t = getState().tasks.find((x) => x.id === draggedId)
        if (t) toast(`${t.code} moved to ${status}`, { type: 'info' })
        const panelInner = board.closest('.pd-panel')
        if (panelInner) { renderKanbanForProject(panelInner, { id: draggedId ? t.projectId : projectId }) }
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
