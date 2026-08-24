// components/onboarding.js — new-user onboarding flow (5 steps).
import { el, $ } from '../utils/dom.js'
import { icon } from './icons.js'
import { openModal, closeModal } from './modal.js'
import { toast } from './toast.js'
import { getState, updateUI, getWorkspace, setWorkspace, getCurrentUser } from '../state/app-state.js'
import { projectService } from '../services/projects.js'
import { taskService } from '../services/tasks.js'
import { userService } from '../services/users.js'
import { openInviteMember } from './quick-create.js'

const STEPS = [
  { id: 'workspace', title: 'Create Workspace', subtitle: 'Give your workspace a name and pick a type.', icon: 'compass' },
  { id: 'invite', title: 'Invite Team', subtitle: 'Add teammates now or skip for later.', icon: 'team' },
  { id: 'project', title: 'Create Project', subtitle: 'Start with your first project.', icon: 'folder' },
  { id: 'task', title: 'First Task', subtitle: 'Capture your first piece of work.', icon: 'task' },
  { id: 'complete', title: 'You\'re Ready', subtitle: 'Dive in and start organizing.', icon: 'sparkle' }
]

let onboardingData = {}
let currentStep = 0

export function startOnboarding() {
  onboardingData = { workspaceName: '', workspaceKind: 'Studio', inviteSkipped: false }
  currentStep = 0
  updateUI({ onboardingDone: false })
  renderStep()
}

function renderStep() {
  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1

  const content = el('div', { class: 'onb-content' }, [
    el('div', { class: 'onb-progress' }, STEPS.map((s, i) =>
      el('div', { class: 'onb-step-dot' + (i < currentStep ? ' done' : i === currentStep ? ' active' : '') }, [
        i < currentStep ? icon('check', { size: 12 }) : el('span', { class: 'onb-step-n' }, [String(i + 1)])
      ])
    )),
    el('div', { class: 'onb-step' }, [
      el('div', { class: 'onb-step-icon' }, [icon(step.icon, { size: 28 })]),
      el('h3', { class: 'onb-step-title font-display' }, [step.title]),
      el('p', { class: 'onb-step-sub text-secondary' }, [step.subtitle])
    ]),
    stepContent(step),
    el('div', { class: 'onb-actions' }, [
      currentStep > 0 ? el('button', { class: 'btn btn-ghost', onclick: prevStep }, ['Back']) : el('div'),
      isLast
        ? el('button', { class: 'btn btn-primary', onclick: finishOnboarding }, [icon('sparkle', { size: 16 }), 'Start Working'])
        : el('button', { class: 'btn btn-primary', onclick: nextStep }, ['Continue', icon('arrowRight', { size: 16 })])
    ].filter(Boolean))
  ])

  openModal({ title: '', content, variant: 'center', width: '520px' })
}

function stepContent(step) {
  if (step.id === 'workspace') {
    return el('div', { class: 'onb-form' }, [
      el('div', { class: 'onb-field' }, [
        el('label', { class: 'field-label' }, ['Workspace name']),
        el('input', { class: 'field', id: 'onb-ws-name', placeholder: 'e.g. Acme Studio', value: onboardingData.workspaceName, oninput: (e) => onboardingData.workspaceName = e.target.value })
      ]),
      el('div', { class: 'onb-field' }, [
        el('label', { class: 'field-label' }, ['Kind']),
        el('select', { class: 'field', id: 'onb-ws-kind', value: onboardingData.workspaceKind, onchange: (e) => onboardingData.workspaceKind = e.target.value }, [
          el('option', { value: 'Studio' }, ['Studio']),
          el('option', { value: 'Team' }, ['Team']),
          el('option', { value: 'Personal' }, ['Personal'])
        ])
      ])
    ])
  }
  if (step.id === 'invite') {
    return el('div', { class: 'onb-form' }, [
      el('p', { class: 'text-secondary', style: { marginBottom: '16px' } }, ['You can invite teammates now — or skip and add them later from Settings.']),
      el('button', { class: 'btn btn-primary', onclick: openInviteInOnboarding }, [icon('user', { size: 16 }), 'Invite someone']),
      el('button', { class: 'btn btn-ghost', onclick: skipInvite }, ['Skip for now'])
    ])
  }
  if (step.id === 'project') {
    return el('div', { class: 'onb-form' }, [
      el('div', { class: 'onb-field' }, [
        el('label', { class: 'field-label' }, ['Project name']),
        el('input', { class: 'field', id: 'onb-prj-name', placeholder: 'e.g. Website Redesign', oninput: (e) => onboardingData.projectName = e.target.value })
      ]),
      el('div', { class: 'onb-field' }, [
        el('label', { class: 'field-label' }, ['Deadline']),
        el('input', { class: 'field', type: 'date', id: 'onb-prj-deadline', value: toISO(new Date(Date.now() + 30 * 864e5)) })
      ])
    ])
  }
  if (step.id === 'task') {
    return el('div', { class: 'onb-form' }, [
      el('div', { class: 'onb-field' }, [
        el('label', { class: 'field-label' }, ['Task title']),
        el('input', { class: 'field', id: 'onb-task-title', placeholder: 'e.g. Draft project brief', oninput: (e) => onboardingData.taskTitle = e.target.value })
      ]),
      el('div', { class: 'onb-field' }, [
        el('label', { class: 'field-label' }, ['Due date']),
        el('input', { class: 'field', type: 'date', id: 'onb-task-due', value: toISO(new Date(Date.now() + 7 * 864e5)) })
      ])
    ])
  }
  if (step.id === 'complete') {
    return el('div', { class: 'onb-complete' }, [
      el('div', { class: 'onb-success' }, [icon('check', { size: 40 })]),
      el('p', { class: 'text-secondary' }, ['Your workspace is set up and ready. Welcome to Northwind.'])
    ])
  }
}

function openInviteInOnboarding() {
  closeModal()
  openInviteMember()
  // After invite modal closes, continue onboarding
  setTimeout(() => renderStep(), 100)
}

function skipInvite() {
  onboardingData.inviteSkipped = true
  nextStep()
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    setTimeout(renderStep, 200)
  }
}

function nextStep() {
  // Validate
  if (currentStep === 0 && !onboardingData.workspaceName.trim()) {
    toast('Please enter a workspace name', { type: 'error' })
    return
  }
  if (currentStep === 2 && !onboardingData.projectName?.trim()) {
    toast('Please enter a project name', { type: 'error' })
    return
  }
  if (currentStep === 3 && !onboardingData.taskTitle?.trim()) {
    toast('Please enter a task title', { type: 'error' })
    return
  }
  currentStep++
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  setTimeout(renderStep, 200)
}

async function finishOnboarding() {
  // Create workspace
  const wsId = 'ws_' + Math.random().toString(36).slice(2, 8)
  const ws = {
    id: wsId,
    name: onboardingData.workspaceName,
    kind: onboardingData.workspaceKind,
    color: onboardingData.workspaceKind === 'Studio' ? '#b99a5b' : onboardingData.workspaceKind === 'Team' ? '#7186a3' : '#6e9b7c',
    role: 'Owner'
  }
  const state = getState()
  state.workspaces.push(ws)
  setWorkspace(wsId)
  updateUI({ onboardingDone: true })

  // Create project
  const project = await projectService.create({
    name: onboardingData.projectName,
    status: 'Planning',
    priority: 'Medium',
    deadline: new Date(document.getElementById('onb-prj-deadline')?.value || Date.now() + 30 * 864e5)
  })

  // Create first task
  await taskService.create({
    title: onboardingData.taskTitle,
    projectId: project.id,
    assignee: getCurrentUser().id,
    priority: 'Medium',
    due: new Date(document.getElementById('onb-task-due')?.value || Date.now() + 7 * 864e5)
  })

  closeModal()
  toast('Welcome! Your workspace is ready.', { type: 'success' })
  // Refresh app
  const ev = new HashChangeEvent('hashchange')
  window.dispatchEvent(ev)
}

function toISO(d) {
  const date = d instanceof Date ? d : new Date(d)
  return date.toISOString().slice(0, 10)
}