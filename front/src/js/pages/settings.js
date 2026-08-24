// pages/settings.js — settings (account, appearance, notifications, workspace, members, prefs).
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { avatar } from '../components/avatar.js'
import { openInviteMember } from '../components/quick-create.js'
import { getState, getUI, updateUI, setRole, getUsers, getCurrentUser } from '../state/app-state.js'
import { userService } from '../services/users.js'
import { toast } from '../components/toast.js'

const SECTIONS = [
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'subscription', label: 'Subscription', icon: 'zap' },
  { id: 'appearance', label: 'Appearance', icon: 'sun' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'workspace', label: 'Workspace', icon: 'briefcase' },
  { id: 'members', label: 'Members', icon: 'team' },
  { id: 'preferences', label: 'Preferences', icon: 'settings' }
]

export function renderSettings(root) {
  const ui = getUI()
  const me = getCurrentUser()

  const nav = el('div', { class: 'set-nav' }, SECTIONS.map((s) =>
    el('button', { class: 'set-nav-item' + (s.id === 'account' ? ' active' : ''), dataset: { sec: s.id } }, [
      icon(s.icon, { size: 17 }), s.label
    ])
  ))

  const panel = el('div', { class: 'set-panel', id: 'set-panel' })
  const page = el('div', { class: 'page settings' }, [
    el('div', { class: 'page-top' }, [
      el('div', {}, [
        el('h2', { class: 'page-title font-display' }, ['Settings']),
        el('p', { class: 'page-sub text-secondary' }, ['Manage your account, workspace, and preferences.'])
      ])
    ]),
    el('div', { class: 'set-layout' }, [nav, panel])
  ])
  root.appendChild(page)
  renderSection('account', panel)

  nav.addEventListener('click', (e) => {
    const b = e.target.closest('.set-nav-item')
    if (!b) return
    nav.querySelectorAll('.set-nav-item').forEach((x) => x.classList.toggle('active', x === b))
    renderSection(b.dataset.sec, panel)
  })

  function renderSection(sec, panel) {
    panel.innerHTML = ''
    if (sec === 'account') panel.appendChild(sectionAccount(getCurrentUser()))
    else if (sec === 'subscription') panel.appendChild(sectionSubscription())
    else if (sec === 'appearance') panel.appendChild(sectionAppearance(ui))
    else if (sec === 'notifications') panel.appendChild(sectionNotifications(ui))
    else if (sec === 'workspace') panel.appendChild(sectionWorkspace())
    else if (sec === 'members') panel.appendChild(sectionMembers())
    else if (sec === 'preferences') panel.appendChild(sectionPreferences(ui))
  }
}

function sectionAccount(me) {
  const fnameInput = el('input', { class: 'field', value: me.first_name || '' })
  const lnameInput = el('input', { class: 'field', value: me.last_name || '' })
  const emailInput = el('input', { class: 'field', value: me.email || '', type: 'email' })

  const saveBtn = el('button', { class: 'btn btn-primary' }, ['Save changes'])
  saveBtn.addEventListener('click', async () => {
    try {
      await userService.updateProfile({
        first_name: fnameInput.value.trim(),
        last_name: lnameInput.value.trim(),
        email: emailInput.value.trim()
      })
      toast('Account details saved', { type: 'success' })
    } catch (e) {
      toast('Failed to save account details', { type: 'error' })
    }
  })

  return el('div', { class: 'set-sec' }, [
    secTitle('Account', 'Your personal account information.'),
    el('div', { class: 'set-row' }, [
      el('div', { class: 'set-profile' }, [avatar(me.id, 56), el('div', {}, [el('strong', {}, [me.name]), el('span', { class: 'text-secondary' }, [me.email])])])
    ]),
    field('First name', fnameInput),
    field('Last name', lnameInput),
    field('Email address', emailInput),
    field('Role', el('input', { class: 'field', value: me.role || 'Member', disabled: true })),
    roleSimulator(),
    el('div', { class: 'set-save' }, [saveBtn])
  ])
}

function roleSimulator() {
  const roles = ['Owner', 'Admin', 'Manager', 'Member', 'Viewer']
  return el('div', { class: 'set-block' }, [
    secLabel('Role simulator'),
    el('p', { class: 'text-secondary set-note' }, ['Select a role to preview UI capabilities.']),
    el('div', { class: 'set-roles' }, roles.map((r) => {
      const b = el('button', { class: 'chip' + (getUI().role === r ? ' active' : ''), dataset: { role: r } }, [r])
      b.addEventListener('click', () => {
        setRole(r)
        document.querySelectorAll('.set-roles .chip').forEach((x) => x.classList.toggle('active', x.dataset.role === r))
        toast(`Viewing as ${r}`, { type: 'info' })
      })
      return b
    }))
  ])
}

function sectionSubscription() {
  const plan = getUI().plan || 'Free'
  return el('div', { class: 'set-sec' }, [
    secTitle('Subscription & Plan', 'View and manage your active workspace plan.'),
    el('div', { class: 'card card-pad', style: { marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-subtle, #f7f6f4)' } }, [
      el('div', {}, [
        el('span', { class: 'text-secondary', style: { fontSize: '12px', display: 'block', marginBottom: '4px' } }, ['Current Workspace Plan']),
        el('strong', { style: { fontSize: '18px' } }, [`${plan} Plan`])
      ]),
      el('span', { class: 'badge badge-gold', style: { fontSize: '14px', padding: '6px 12px' } }, [plan === 'Free' ? 'Active Free' : 'Subscribed'])
    ]),
    el('div', { class: 'set-field' }, [
      el('label', { class: 'field-label' }, ['Upgrade or Change Plan']),
      el('p', { class: 'text-secondary set-note', style: { marginBottom: '12px' } }, ['Switching plans upgrades your workspace features immediately.']),
      el('button', { class: 'btn btn-gold', onclick: () => { location.hash = '#/select-plan' } }, [icon('zap', { size: 15 }), 'Change / Upgrade Plan'])
    ])
  ])
}

function sectionAppearance(ui) {
  return el('div', { class: 'set-sec' }, [
    secTitle('Appearance', 'Tune UI density and appearance.'),
    toggleRow('Compact density', 'Show more rows with less space.', false),
    toggleRow('Reduced motion', 'Respect system reduced-motion setting.', true, true),
    saveBar()
  ])
}

function sectionNotifications(ui) {
  return el('div', { class: 'set-sec' }, [
    secTitle('Notifications', 'Choose what reaches you.'),
    toggleRow('Task assigned to me', 'Get notified when work lands on you.', true),
    toggleRow('Mentions', 'Notify me when someone @mentions me.', true),
    toggleRow('Comments', 'Notify me on comments in my tasks.', true),
    saveBar()
  ])
}

function sectionWorkspace() {
  const ws = getState().workspaces.find((w) => w.id === getState().workspaceId)
  return el('div', { class: 'set-sec' }, [
    secTitle('Workspace', ws?.name || 'Main Workspace'),
    field('Workspace name', el('input', { class: 'field', value: ws?.name || 'Main Workspace' })),
    saveBar()
  ])
}

function sectionMembers() {
  const members = getUsers()
  return el('div', { class: 'set-sec' }, [
    secTitle('Members', `${members.length} member(s) in this workspace`),
    el('div', { class: 'set-members' }, members.map((m) =>
      el('div', { class: 'set-member' }, [
        avatar(m.id, 36),
        el('div', { class: 'set-member-info' }, [el('strong', {}, [m.name]), el('span', { class: 'text-secondary' }, [m.email || ''])]),
        el('span', { class: 'badge' }, [m.role || 'Member'])
      ])
    )),
    el('button', { class: 'btn btn-primary', onclick: () => openInviteMember() }, [icon('user', { size: 15 }), 'Invite member'])
  ])
}

function sectionPreferences(ui) {
  return el('div', { class: 'set-sec' }, [
    secTitle('Preferences', 'Workspace preferences.'),
    toggleRow('Start with collapsed sidebar', 'Open with a compact view.', getUI().sidebarCollapsed, false, (v) => updateUI({ sidebarCollapsed: v })),
    saveBar()
  ])
}

function secTitle(title, sub) {
  return el('div', { class: 'set-sec-head' }, [el('h3', {}, [title]), sub ? el('p', { class: 'text-secondary' }, [sub]) : null].filter(Boolean))
}
function secLabel(t) { return el('span', { class: 'set-label' }, [t]) }
function field(label, node) {
  return el('div', { class: 'set-field' }, [el('label', { class: 'field-label' }, [label]), node])
}
function toggleRow(label, sub, on, locked = false, onChange) {
  const sw = el('span', { class: 'switch' + (on ? ' on' : '') })
  sw.addEventListener('click', () => {
    if (locked) { toast('Controlled by your system setting', { type: 'info' }); return }
    sw.classList.toggle('on')
    onChange?.(sw.classList.contains('on'))
  })
  return el('div', { class: 'set-toggle' }, [
    el('div', {}, [el('strong', {}, [label]), el('p', { class: 'text-secondary' }, [sub])]),
    sw
  ])
}
function saveBar() {
  return el('div', { class: 'set-save' }, [
    el('button', { class: 'btn btn-primary', onclick: () => toast('Changes saved', { type: 'success' }) }, ['Save changes'])
  ])
}
