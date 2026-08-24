// components/task-card.js — reusable task card + list row for Kanban / lists.
import { el } from '../utils/dom.js'
import { icon } from './icons.js'
import { avatar } from './avatar.js'
import { statusBadge, priorityBadge, labelBadge } from './badges.js'
import { fmtShort, fromNow, isOverdue } from '../utils/format.js'
import { getProject, getState } from '../state/app-state.js'

const PRIORITY_DOT = { Low: '#a39d93', Medium: '#7186a3', High: '#c8a24b', Urgent: '#b5615e' }

export function taskCard(task, { onClick } = {}) {
  const p = getProject(task.projectId)
  const card = el('article', {
    class: 'task-card',
    draggable: true,
    dataset: { id: task.id, status: task.status },
    role: 'button',
    tabindex: '0',
    'aria-label': `Task: ${task.title}`
  }, [
    el('div', { class: 'tc-top' }, [
      el('span', { class: 'tc-code font-mono' }, [task.code]),
      el('span', { class: 'tc-prio' }, [
        el('span', { class: 'label-dot', style: { background: PRIORITY_DOT[task.priority] } }),
        task.priority
      ])
    ]),
    el('h4', { class: 'tc-title' }, [task.title]),
    task.labels?.length ? el('div', { class: 'tc-labels' }, task.labels.map((l) => labelBadge(l))) : null,
    el('div', { class: 'tc-foot' }, [
      el('span', { class: 'tc-meta' }, [
        icon('calendar', { size: 13 }),
        el('span', { class: isOverdue(task.due) && task.status !== 'Done' ? 'tc-due overdue' : 'tc-due' }, [fmtShort(task.due)])
      ]),
      task.assignee ? avatar(task.assignee, 24) : el('span', { class: 'tc-unassigned' }, [icon('user', { size: 14 })])
    ])
  ])

  if (task.subtasks?.length) {
    const done = task.subtasks.filter((s) => s.done).length
    card.insertBefore(
      el('div', { class: 'tc-sub' }, [
        icon('check', { size: 12 }),
        el('span', {}, [`${done}/${task.subtasks.length}`])
      ]),
      card.querySelector('.tc-foot')
    )
  }

  const open = (e) => { e.preventDefault(); onClick?.(task) }
  card.addEventListener('click', open)
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(e) })

  // Drag handlers (state updated by Kanban via delegated listeners)
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    card.classList.add('dragging')
    document.dispatchEvent(new CustomEvent('nw:dragstart', { detail: { id: task.id } }))
  })
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging')
    document.dispatchEvent(new CustomEvent('nw:dragend'))
  })

  return card
}

// Compact row for list / "my tasks" tables.
export function taskRow(task, { onClick, showProject = true } = {}) {
  const p = getProject(task.projectId)
  const row = el('div', {
    class: 'task-row', dataset: { id: task.id }, tabindex: '0', role: 'button',
    'aria-label': `Task: ${task.title}`
  }, [
    el('button', { class: 'tr-check', 'aria-label': 'Toggle done', onclick: (e) => e.stopPropagation() }, [
      task.status === 'Done' ? icon('check', { size: 13 }) : null
    ].filter(Boolean)),
    el('div', { class: 'tr-main' }, [
      el('span', { class: 'tr-title' }, [task.title]),
      el('div', { class: 'tr-sub' }, [
        showProject && p ? el('span', { class: 'tr-project' }, [el('span', { class: 'label-dot', style: { background: p.color } }), p.name]) : null,
        el('span', { class: 'tr-code font-mono' }, [task.code])
      ].filter(Boolean))
    ]),
    el('div', { class: 'tr-badges' }, [
      statusBadge(task.status),
      priorityBadge(task.priority)
    ]),
    el('span', { class: 'tr-due' }, [fmtShort(task.due)]),
    task.assignee ? avatar(task.assignee, 26) : el('span', { class: 'tc-unassigned' }, [icon('user', { size: 14 })])
  ])

  const open = (e) => onClick?.(task)
  row.addEventListener('click', open)
  row.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(e) })
  return row
}
