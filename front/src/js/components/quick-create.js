// components/quick-create.js — quick create task / project modal.
import { el, $ } from '../utils/dom.js'
import { icon } from './icons.js'
import { openModal, closeModal } from './modal.js'
import { toast } from './toast.js'
import { taskService } from '../services/tasks.js'
import { projectService } from '../services/projects.js'
import { userService } from '../services/users.js'
import { getState, workspaceProjects, getProjects, can } from '../state/app-state.js'
import { PRIORITIES, STATUSES } from '../data/tasks.js'
import { PROJECT_STATUSES } from '../data/projects-meta.js'
import { canCreateProject, showUpgradeModal } from '../utils/plan-guard.js'

export function openCreateTask(prefill = {}) {
  const projects = getState().projects
  const content = el('div', { class: 'qc-form' }, [
    field('Title', el('input', { class: 'field', placeholder: 'e.g. Draft the launch plan', id: 'qc-title', value: prefill.title || '' })),
    el('div', { class: 'qc-grid' }, [
      field('Project', select(projects.map((p) => ({ value: p.id, label: p.name })), prefill.projectId || projects[0]?.id, 'qc-project')),
      field('Assignee', select(getState().users.map((u) => ({ value: u.id, label: u.name })), prefill.assignee || getState().currentUserId, 'qc-assignee')),
      field('Priority', select(PRIORITIES.map((p) => ({ value: p, label: p })), prefill.priority || 'Medium', 'qc-prio')),
      field('Due', el('input', { class: 'field', type: 'date', id: 'qc-due', value: toISO(prefill.due || new Date(Date.now() + 7 * 864e5)) }))
    ]),
    field('Description', el('textarea', { class: 'field', rows: 3, id: 'qc-desc', placeholder: 'Optional details…' }))
  ])

  openModal({
    title: 'Create task',
    subtitle: 'Add work to a project in seconds',
    content,
    variant: 'center',
    footer: [
      el('button', { class: 'btn btn-ghost', onclick: () => closeMod() }, ['Cancel']),
      el('button', { class: 'btn btn-primary', onclick: submit }, [icon('plus', { size: 15 }), 'Create task'])
    ]
  })

  function closeMod() { closeModal() }

  async function submit() {
    const title = $('#qc-title').value.trim()
    if (!title) { toast('Please enter a task title', { type: 'error' }); return }

    let selectedProject = $('#qc-project')?.value || projects[0]?.id
    if (!selectedProject) {
      toast('Please create a project first before adding tasks', { type: 'error' })
      closeModal()
      openCreateProject()
      return
    }

    try {
      await taskService.create({
        title,
        project: selectedProject,
        projectId: selectedProject,
        assigned_to: $('#qc-assignee')?.value || null,
        assignee: $('#qc-assignee')?.value || null,
        priority: $('#qc-prio')?.value || 'Medium',
        due_date: $('#qc-due')?.value ? $('#qc-due').value : null,
        due: $('#qc-due')?.value ? $('#qc-due').value : null,
        description: $('#qc-desc')?.value || ''
      })
      closeModal()
      toast('Task created successfully', { type: 'success' })
      refreshApps()
    } catch (e) {
      console.error(e)
      toast('Failed to create task', { type: 'error' })
    }
  }
}

export function openCreateProject(prefill = {}) {
  const check = canCreateProject()
  if (!check.allowed) {
    showUpgradeModal('Project Limit Reached', check.reason)
    return
  }

  const content = el('div', { class: 'qc-form' }, [
    field('Name', el('input', { class: 'field', id: 'qp-name', placeholder: 'e.g. Website Relaunch', value: prefill.name || '' })),
    el('div', { class: 'qc-grid' }, [
      field('Status', select(PROJECT_STATUSES.map((s) => ({ value: s, label: s })), prefill.status || 'Planning', 'qp-status')),
      field('Priority', select(PRIORITIES.map((p) => ({ value: p, label: p })), prefill.priority || 'Medium', 'qp-prio'))
    ]),
    field('Deadline', el('input', { class: 'field', type: 'date', id: 'qp-deadline', value: toISO(prefill.deadline || new Date(Date.now() + 30 * 864e5)) })),
    field('Description', el('textarea', { class: 'field', rows: 3, id: 'qp-desc', placeholder: 'What is this project about?' }))
  ])
  openModal({
    title: 'Create project',
    subtitle: 'Spin up a focused workspace for your team',
    content,
    variant: 'center',
    footer: [
      el('button', { class: 'btn btn-ghost', onclick: () => closeModal() }, ['Cancel']),
      el('button', { class: 'btn btn-gold', onclick: submit }, [icon('plus', { size: 15 }), 'Create project'])
    ]
  })
  async function submit() {
    const name = $('#qp-name').value.trim()
    if (!name) { toast('Please enter a project name', { type: 'error' }); return }
    try {
      await projectService.create({
        title: name,
        name: name,
        status: $('#qp-status').value,
        priority: $('#qp-prio').value,
        start_date: new Date().toISOString().slice(0, 10),
        deadline: $('#qp-deadline')?.value ? $('#qp-deadline').value : null,
        description: $('#qp-desc').value
      })
      closeModal()
      toast('Project created successfully', { type: 'success' })
      refreshApps()
    } catch (e) {
      console.error(e)
      toast('Failed to create project', { type: 'error' })
    }
  }
}

export function openInviteMember() {
  const content = el('div', { class: 'qc-form' }, [
    field('Name', el('input', { class: 'field', id: 'qi-name', placeholder: 'e.g. Jordan Lee' })),
    el('div', { class: 'qc-grid' }, [
      field('Role', select([{ value: 'Member', label: 'Member' }, { value: 'Manager', label: 'Manager' }, { value: 'Admin', label: 'Admin' }, { value: 'Viewer', label: 'Viewer' }], 'Member', 'qi-role')),
      field('Email', el('input', { class: 'field', type: 'email', id: 'qi-email', placeholder: 'name@team.com' }))
    ]),
    field('Title', el('input', { class: 'field', id: 'qi-title', placeholder: 'e.g. Product Designer' }))
  ])
  openModal({
    title: 'Invite member',
    subtitle: 'Add someone to this workspace',
    content,
    variant: 'center',
    footer: [
      el('button', { class: 'btn btn-ghost', onclick: () => closeModal() }, ['Cancel']),
      el('button', { class: 'btn btn-primary', onclick: submit }, [icon('user', { size: 15 }), 'Send invite'])
    ]
  })
  async function submit() {
    const name = $('#qi-name').value.trim()
    if (!name) { toast('Please enter a member name', { type: 'error' }); return }
    try {
      await userService.invite({ name, role: $('#qi-role').value, email: $('#qi-email').value, title: $('#qi-title').value })
      closeModal()
      toast('Invitation sent successfully', { type: 'success' })
    } catch (e) {
      toast('Failed to send invitation', { type: 'error' })
    }
  }
}

function field(label, node) {
  return el('div', { class: 'qc-field' }, [el('label', { class: 'field-label' }, [label]), node])
}
function select(opts, value, id) {
  return el('select', { class: 'field', id }, opts.map((o) =>
    el('option', { value: o.value, selected: o.value === value }, [o.label])))
}
function toISO(d) {
  const date = d instanceof Date ? d : new Date(d)
  return date.toISOString().slice(0, 10)
}
function refreshApps() {
  // Re-render current app page if mounted
  document.dispatchEvent(new CustomEvent('nw:refresh-page'))
}
