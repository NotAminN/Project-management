// components/task-modal.js — detailed task view: edit, subtasks, comments, attachments, activity.
import { el, clear } from '../utils/dom.js'
import { icon } from './icons.js'
import { avatar } from './avatar.js'
import { labelBadge } from './badges.js'
import { openModal } from './modal.js'
import { toast } from './toast.js'
import { fmtShort, fromNow } from '../utils/format.js'
import { taskService } from '../services/tasks.js'
import { getTask, getProject, getUser, getState } from '../state/app-state.js'
import { STATUSES, PRIORITIES } from '../data/tasks.js'

let currentModalContentNode = null

export function openTaskModal(taskId) {
  const task = getTask(taskId)
  if (!task) return
  const p = getProject(task.projectId || task.project)

  const content = el('div', { class: 'task-modal' })
  currentModalContentNode = content
  renderTaskModalContent(content, task)
  openModal({ title: task.code || `TSK-${task.id}`, subtitle: p?.name || p?.title || 'Project Task', content, variant: 'sheet', width: '560px' })
}

function renderTaskModalContent(content, task0) {
  clear(content)
  let task = task0
  const p = getProject(task.projectId || task.project)

  const title = el('input', { class: 'tm-title-input', value: task.title })
  title.addEventListener('change', async () => {
    await taskService.update(task.id, { title: title.value })
    toast('Task updated')
  })

  const statusSel = selectField(STATUSES, task.status, async (v) => {
    await taskService.update(task.id, { status: v })
    toast('Status updated', { type: 'info' })
  })
  const prioSel = selectField(PRIORITIES, task.priority, async (v) => {
    await taskService.update(task.id, { priority: v })
    toast('Priority updated', { type: 'info' })
  })

  const assigneeUser = getUser(task.assignee || task.assigned_to)
  const assigneeWrap = el('div', { class: 'tm-assignee' }, [
    avatar(assigneeUser?.id, 28),
    el('span', {}, [assigneeUser?.name || 'Unassigned'])
  ])

  content.append(
    el('div', { class: 'tm-head' }, [
      el('div', { class: 'tm-head-top' }, [title]),
      el('div', { class: 'tm-head-meta' }, [
        field('Status', statusSel),
        field('Priority', prioSel),
        field('Assignee', assigneeWrap, true),
        field('Due', dueEditor(task))
      ]),
      el('div', { class: 'tm-labels' }, (task.labels || []).map((l) => labelBadge(l)))
    ]),
    el('div', { class: 'tm-desc-wrap' }, [
      el('label', { class: 'tm-section-label' }, ['Description']),
      el('textarea', { class: 'field tm-desc', rows: 3 }, [task.description || '']),
    ]),
    subtaskSection(task),
    commentSection(task),
    attachmentSection(task),
    activitySection(task)
  )

  const desc = content.querySelector('.tm-desc')
  desc.addEventListener('change', () => taskService.update(task.id, { description: desc.value }))

  content._refresh = async function() {
    const updated = getTask(task.id) || task
    renderTaskModalContent(content, updated)
  }
}

function field(label, node, inline = false) {
  return el('div', { class: 'tm-field' + (inline ? ' tm-field-inline' : '') }, [
    el('span', { class: 'tm-field-label' }, [label]),
    node
  ])
}

function selectField(options, value, onChange) {
  const sel = el('select', { class: 'field tm-select' }, options.map((o) =>
    el('option', { value: o, selected: o === value }, [o])
  ))
  sel.addEventListener('change', () => onChange(sel.value))
  return sel
}

function dueEditor(task) {
  const input = el('input', { class: 'field tm-due', type: 'date', value: toISO(task.due || task.due_date) })
  input.addEventListener('change', () => taskService.update(task.id, { due: new Date(input.value) }))
  return input
}

function toISO(d) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function subtaskSection(task) {
  const subtasks = task.subtasks || []
  const done = subtasks.filter((s) => s.done).length
  const list = el('div', { class: 'tm-subtasks' }, subtasks.map((s) => subtaskRow(s, task)))
  const input = el('input', { class: 'field', placeholder: 'Add a subtask and press Enter', 'aria-label': 'Add subtask' })
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      await taskService.addSubtask(task.id, input.value.trim())
      input.value = ''
      if (currentModalContentNode?._refresh) currentModalContentNode._refresh()
    }
  })

  const wrap = el('div', { class: 'tm-block' }, [
    el('div', { class: 'tm-block-head' }, [
      el('span', { class: 'tm-section-label' }, ['Subtasks']),
      el('span', { class: 'tm-sub-count' }, [`${done}/${subtasks.length}`])
    ]),
    el('div', { class: 'progress', style: { margin: '4px 0 12px' } }, [
      el('div', { class: 'progress-bar', style: { width: (done / (subtasks.length || 1)) * 100 + '%' } })
    ]),
    list,
    input
  ])
  return wrap
}

function subtaskRow(s, task) {
  return el('div', { class: 'tm-sub-row' }, [
    el('button', {
      class: 'tm-check' + (s.done ? ' done' : ''), 'aria-label': 'Toggle subtask',
      onclick: async () => {
        await taskService.toggleSubtask(task.id, s.id)
        if (currentModalContentNode?._refresh) currentModalContentNode._refresh()
      }
    }, [s.done ? icon('check', { size: 12 }) : null].filter(Boolean)),
    el('span', { class: 'tm-sub-text' + (s.done ? ' done' : '') }, [s.text]),
    el('button', {
      class: 'tm-sub-del', 'aria-label': 'Delete subtask',
      onclick: async () => {
        await taskService.removeSubtask(task.id, s.id)
        if (currentModalContentNode?._refresh) currentModalContentNode._refresh()
      }
    }, [icon('close', { size: 13 })])
  ])
}

function commentSection(task) {
  const comments = task.comments || []
  const list = el('div', { class: 'tm-comments' }, comments.map((c) => commentRow(c)))
  const editor = el('div', { class: 'tm-comment-editor' }, [
    avatar(getState().currentUserId || 'me', 30),
    el('div', { class: 'tm-editor-box' }, [
      el('textarea', { class: 'field', placeholder: 'Write a comment…', rows: 2, 'aria-label': 'Comment' }),
      el('div', { class: 'tm-editor-actions' }, [
        el('button', { class: 'btn btn-primary btn-sm', onclick: sendComment }, ['Comment'])
      ])
    ])
  ])

  async function sendComment() {
    const ta = editor.querySelector('textarea')
    const text = ta.value.trim()
    if (!text) return
    await taskService.addComment(task.id, text)
    ta.value = ''
    if (currentModalContentNode?._refresh) currentModalContentNode._refresh()
    toast('Comment added')
  }

  const wrap = el('div', { class: 'tm-block' }, [
    el('span', { class: 'tm-section-label' }, ['Comments']),
    list,
    editor
  ])
  return wrap
}

function commentRow(c) {
  const u = getUser(c.user || c.created_by)
  return el('div', { class: 'tm-comment' }, [
    avatar(u?.id, 30),
    el('div', { class: 'tm-comment-body' }, [
      el('div', { class: 'tm-comment-meta' }, [
        el('strong', {}, [u?.name || 'User']),
        el('span', { class: 'text-secondary' }, [fromNow(c.created_at || c.time)])
      ]),
      el('p', {}, [c.content || c.text || ''])
    ])
  ])
}

function attachmentSection(task) {
  const attachments = task.attachments || []
  const list = el('div', { class: 'tm-attachments' }, attachments.map((a) => attachmentRow(a)))
  const upload = el('button', { class: 'tm-upload', onclick: () => toast('Upload is simulated in this demo') }, [
    icon('paperclip', { size: 15 }), 'Attach a file'
  ])
  return el('div', { class: 'tm-block' }, [
    el('span', { class: 'tm-section-label' }, ['Attachments']),
    list,
    upload
  ])
}

function attachmentRow(a) {
  return el('div', { class: 'tm-attachment' }, [
    el('span', { class: 'tm-att-ic' }, [icon('file', { size: 16 })]),
    el('div', { class: 'tm-att-info' }, [
      el('span', { class: 'tm-att-name' }, [a.name]),
      el('span', { class: 'text-secondary' }, [`${a.type || 'file'} · ${a.size || ''}`])
    ]),
    el('span', { class: 'tm-att-meta text-secondary' }, [`${getUser(a.uploader)?.name || '?'} · ${fmtShort(a.date)}`])
  ])
}

function activitySection(task) {
  const comments = task.comments || []
  const items = comments.map(c => ({ type: 'comment', text: 'commented', who: c.user || c.created_by, time: c.created_at || c.time }))
  return el('div', { class: 'tm-block' }, [
    el('span', { class: 'tm-section-label' }, ['Activity']),
    el('div', { class: 'tm-activity' }, items.length ? items.map((i) =>
      el('div', { class: 'tm-act' }, [
        el('span', { class: 'tm-act-dot' }),
        el('span', { class: 'text-secondary' }, [`${getUser(i.who)?.name || 'User'} ${i.text} · ${fromNow(i.time)}`])
      ])
    ) : [el('p', { class: 'text-secondary' }, ['No recent activity.'])])
  ])
}
