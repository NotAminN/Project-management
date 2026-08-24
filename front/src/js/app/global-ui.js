// app/global-ui.js — global overlays installed once at startup.
// Handles: command palette (Ctrl+K), search overlay, notifications,
// workspace switcher, user menu, mobile drawer.
import { el, $, $$ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { avatar } from '../components/avatar.js'
import { openModal } from '../components/modal.js'
import { openTaskModal } from '../components/task-modal.js'
import { openCreateTask, openCreateProject, openInviteMember } from '../components/quick-create.js'
import { toast } from '../components/toast.js'
import { getState, setWorkspace, workspaceProjects, getNotifications, getCurrentUser } from '../state/app-state.js'
import { notificationService } from '../services/notifications.js'
import { updateNotificationBadge } from './topbar.js'
import { navigate } from '../router.js'
import { NOTIF_ICONS } from '../data/notifications.js'
import { fromNow } from '../utils/format.js'
import { authService } from '../services/auth.js'

export function initGlobalUI() {
  document.addEventListener('nw:open-search', openSearch)
  document.addEventListener('nw:open-command', openCommandPalette)
  document.addEventListener('nw:open-notifications', openNotifications)
  document.addEventListener('nw:open-workspace', openWorkspaceSwitcher)
  document.addEventListener('nw:open-user', openUserMenu)
  document.addEventListener('nw:open-help', openHelpModal)
  document.addEventListener('nw:open-drawer', openMobileDrawer)
  document.addEventListener('nw:refresh-page', refreshCurrentPage)

  // Global keyboard: Ctrl/Cmd+K opens command palette; "/" focuses search.
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      openCommandPalette()
    }
  })
}

function refreshCurrentPage() {
  // Re-render the visible app content via route handler
  const ev = new HashChangeEvent('hashchange')
  window.dispatchEvent(ev)
}

/* ---------------- Command Palette ---------------- */
function openCommandPalette() {
  const commands = [
    { label: 'Create task', icon: 'plus', hint: 'C', run: () => openCreateTask() },
    { label: 'Create project', icon: 'folder', hint: 'P', run: () => openCreateProject() },
    { label: 'Invite member', icon: 'user', hint: '', run: () => openInviteMember() },
    { label: 'Go to Dashboard', icon: 'home', hint: 'G D', run: () => navigate('/app/dashboard') },
    { label: 'Go to Projects', icon: 'folder', hint: 'G P', run: () => navigate('/app/projects') },
    { label: 'Go to Calendar', icon: 'calendar', hint: 'G C', run: () => navigate('/app/calendar') },
    { label: 'Go to Team', icon: 'team', hint: 'G T', run: () => navigate('/app/team') },
    { label: 'Go to Analytics', icon: 'analytics', hint: 'G A', run: () => navigate('/app/analytics') },
    { label: 'Go to Settings', icon: 'settings', hint: 'G S', run: () => navigate('/app/settings') },
    { label: 'Switch workspace', icon: 'compass', hint: '', run: () => openWorkspaceSwitcher() },
    { label: 'Search everything', icon: 'search', hint: '/', run: () => openSearch() }
  ]

  const input = el('input', { class: 'field cmd-input', placeholder: 'Type a command…', 'aria-label': 'Command palette' })
  const list = el('div', { class: 'cmd-list' }, commands.map(cmdItem))

  function cmdItem(c) {
    const item = el('button', { class: 'cmd-item', role: 'option' }, [
      el('span', { class: 'cmd-ic' }, [icon(c.icon, { size: 17 })]),
      el('span', { class: 'cmd-label' }, [c.label]),
      c.hint ? el('span', { class: 'kbd' }, [c.hint]) : null
    ].filter(Boolean))
    item.addEventListener('click', () => { close(); c.run() })
    return item
  }

  function filter(q) {
    list.innerHTML = ''
    const ql = q.toLowerCase()
    const found = commands.filter((c) => c.label.toLowerCase().includes(ql))
    if (!found.length) { list.append(el('div', { class: 'cmd-empty' }, ['No commands found.'])) ; return }
    found.forEach((c) => list.append(cmdItem(c)))
  }
  input.addEventListener('input', () => filter(input.value))

  // Arrow navigation
  input.addEventListener('keydown', (e) => {
    const items = Array.from(list.querySelectorAll('.cmd-item'))
    const active = list.querySelector('.cmd-item.active')
    let idx = items.indexOf(active)
    if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(items.length - 1, idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); items[idx >= 0 ? idx : 0]?.click(); return }
    else return
    items.forEach((i) => i.classList.remove('active'))
    items[idx]?.classList.add('active')
  })

  const modal = el('div', { class: 'cmd-palette' }, [
    el('div', { class: 'cmd-input-row' }, [icon('command', { size: 18 }), input, el('span', { class: 'kbd' }, ['Esc'])]),
    list
  ])
  const m = openModal({ title: '', content: modal, variant: 'center', width: '600px' })
  setTimeout(() => input.focus(), 60)
  function close() { /* modal closed by Escape/click handled in modal.js */ }
}

/* ---------------- Search ---------------- */
function openSearch() {
  const input = el('input', { class: 'field search-input', placeholder: 'Search projects, tasks, people…', 'aria-label': 'Search' })
  const results = el('div', { class: 'search-results' })

  const modal = el('div', { class: 'search-modal' }, [
    el('div', { class: 'search-input-row' }, [icon('search', { size: 18 }), input, el('span', { class: 'kbd' }, ['Esc'])]),
    el('div', { class: 'search-tabs' }, ['Projects', 'Tasks', 'People', 'All'].map((t, i) =>
      el('button', { class: 'chip' + (i === 3 ? ' active' : ''), dataset: { tab: t.toLowerCase() }, onclick: (e) => switchTab(e, t.toLowerCase()) }, [t])
    )),
    results
  ])

  function switchTab(e, tab) {
    modal.querySelectorAll('.search-tabs .chip').forEach((x) => x.classList.toggle('active', x === e.currentTarget))
    run(input.value, tab)
  }

  function run(q, tab = 'all') {
    results.innerHTML = ''
    const ql = q.trim().toLowerCase()
    const projects = workspaceProjects()
    const tasks = getState().tasks.filter((t) => projects.some((p) => p.id == (t.projectId || t.project)))
    const people = getState().users

    const pMatch = ql ? projects.filter((p) => (p.name || p.title || '').toLowerCase().includes(ql)) : projects.slice(0, 4)
    const tMatch = ql ? tasks.filter((t) => (t.title || '').toLowerCase().includes(ql)) : tasks.slice(0, 5)
    const uMatch = ql ? people.filter((u) => (u.name || u.username || '').toLowerCase().includes(ql)) : []

    const addGroup = (title, items, render) => {
      if (!items.length) return
      results.append(el('div', { class: 'search-group-label' }, [title]))
      items.forEach((it) => results.append(render(it)))
    }

    if (tab === 'all' || tab === 'projects') addGroup('Projects', pMatch, (p) =>
      searchRow('folder', p.name, p.description, () => { closeAll(); navigate(`/app/project/${p.id}`) }))
    if (tab === 'all' || tab === 'tasks') addGroup('Tasks', tMatch, (t) =>
      searchRow('task', t.title, t.code, () => { closeAll(); openTaskModal(t.id) }))
    if (tab === 'all' || tab === 'people') addGroup('People', uMatch, (u) =>
      searchRow('user', u.name, u.title, () => { closeAll(); navigate('/app/team') }))

    if (!results.children.length) results.append(el('div', { class: 'cmd-empty' }, ['No results. Try a different term.']))
  }

  function searchRow(ic, title, sub, onClick) {
    const row = el('button', { class: 'search-row' }, [
      el('span', { class: 'search-row-ic' }, [icon(ic, { size: 16 })]),
      el('div', { class: 'search-row-text' }, [el('span', { class: 'search-row-title' }, [title]), el('span', { class: 'text-secondary' }, [sub])]),
      icon('chevronRight', { size: 15 })
    ])
    row.addEventListener('click', onClick)
    return row
  }

  input.addEventListener('input', () => {
    const tab = modal.querySelector('.search-tabs .chip.active')?.dataset.tab || 'all'
    run(input.value, tab)
  })

  openModal({ title: '', content: modal, variant: 'center', width: '640px' })
  setTimeout(() => input.focus(), 60)
  run('', 'all')

  function closeAll() { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) }
}

/* ---------------- Notifications ---------------- */
function openNotifications() {
  const ntf = getNotifications()
  const list = el('div', { class: 'notif-list' }, ntf.map(notifItem))

  const modal = el('div', { class: 'notif-modal' }, [
    el('div', { class: 'notif-head' }, [
      el('h3', {}, ['Notifications']),
      el('button', { class: 'btn btn-subtle btn-sm', onclick: () => { notificationService.markAllRead(); updateNotificationBadge(); rerender() } }, ['Mark all read'])
    ]),
    ntf.length ? list : el('div', { class: 'empty-mini' }, [icon('bell', { size: 18 }), 'You\'re all caught up.'])
  ])

  function rerender() {
    modal.querySelector('.notif-list')?.remove()
    const nl = el('div', { class: 'notif-list' }, getNotifications().map(notifItem))
    modal.querySelector('.notif-head').after(nl)
  }

  openModal({ title: '', content: modal, variant: 'sheet', width: '420px' })

  function notifItem(n) {
    const u = getState().users.find((x) => x.id === n.user)
    return el('div', { class: 'notif-item' + (n.read ? '' : ' unread'), onclick: () => { notificationService.markRead(n.id); updateNotificationBadge(); n.read = true; openNotificationsRefresh() } }, [
      el('span', { class: 'notif-ic', style: { background: notifColor(n.type) + '1a', color: notifColor(n.type) } }, [icon(NOTIF_ICONS[n.type] || 'dot', { size: 15 })]),
      el('div', { class: 'notif-body' }, [
        el('p', { class: 'notif-title' }, [n.title]),
        el('p', { class: 'text-secondary notif-text' }, [n.text]),
        el('span', { class: 'text-secondary notif-time' }, [fromNow(n.time)])
      ]),
      n.read ? null : el('span', { class: 'notif-dot' })
    ].filter(Boolean))
  }
  function openNotificationsRefresh() { /* badge updated; modal stays open */ }
}

function notifColor(type) {
  return { mention: '#b99a5b', comment: '#7186a3', assigned: '#879887', deadline: '#b5615e', update: '#a07d9e', invite: '#5f8a8b' }[type] || '#a39d93'
}

/* ---------------- Workspace switcher ---------------- */
function openWorkspaceSwitcher() {
  const wsList = getState().workspaces.length ? getState().workspaces : [getState().workspaces[0] || { id: 'ws_default', name: 'Main Workspace', kind: 'Team', role: 'Member', color: '#b99a5b' }]
  const list = el('div', { class: 'ws-list' }, wsList.map((w) => {
    const active = w.id === getState().workspaceId
    return el('button', { class: 'ws-item' + (active ? ' active' : ''), onclick: () => { setWorkspace(w.id); updateNotificationBadge(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); toast('Switched to ' + (w.name || 'Workspace'), { type: 'success' }); refreshCurrentPage() } }, [
      el('span', { class: 'ws-glyph', style: { background: w.color || '#b99a5b' } }, [icon('compass', { size: 15 })]),
      el('div', { class: 'ws-item-info' }, [el('strong', {}, [w.name || 'Workspace']), el('span', { class: 'text-secondary' }, [(w.kind || 'Team') + ' · ' + (w.role || 'Member')])]),
      active ? icon('check', { size: 16 }) : null
    ].filter(Boolean))
  }))

  function createInWorkspace() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    openCreateProject()
  }

  const modal = el('div', { class: 'ws-modal' }, [
    el('div', { class: 'ws-head' }, [
      el('h3', {}, ['Workspaces']),
      el('button', { class: 'btn btn-soft btn-sm', onclick: createInWorkspace }, [icon('plus', { size: 14 }), 'New'])
    ]),
    list
  ])
  openModal({ title: '', content: modal, variant: 'center', width: '440px' })
}

/* ---------------- User menu ---------------- */
function openUserMenu() {
  const me = getCurrentUser()
  const displayName = me?.name || [me?.first_name, me?.last_name].filter(Boolean).join(' ') || me?.username || 'User'
  const menu = el('div', { class: 'user-menu' }, [
    el('div', { class: 'user-menu-head' }, [avatar(me.id, 40), el('div', {}, [el('strong', {}, [displayName]), el('span', { class: 'text-secondary' }, [me.email || ''])])]),
    el('div', { class: 'user-menu-items' }, [
      menuItem('home', 'Back to Home Page', () => navigate('/')),
      menuItem('profile', 'View profile', () => navigate('/app/profile')),
      menuItem('settings', 'Settings', () => navigate('/app/settings')),
      menuItem('compass', 'Switch workspace', () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); openWorkspaceSwitcher() }),
      menuItem('logout', 'Sign out', () => { authService.logout(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) }, true)
    ])
  ])
  openModal({ title: '', content: menu, variant: 'center', width: '300px' })

  function menuItem(ic, label, onClick, danger) {
    const item = el('button', { class: 'dropdown-item' + (danger ? ' danger' : '') }, [icon(ic, { size: 16 }), label])
    item.addEventListener('click', () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); onClick() })
    return item
  }
}

/* ---------------- Help & Documentation ---------------- */
function openHelpModal() {
  const modal = el('div', { class: 'help-modal', style: { padding: '8px 4px' } }, [
    el('h3', { class: 'font-display', style: { marginBottom: '8px' } }, ['Help & Support Center']),
    el('p', { class: 'text-secondary', style: { fontSize: '14px', marginBottom: '16px' } }, [
      'Welcome to Northwind Project Management! Here is a quick guide to using the application:'
    ]),
    el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' } }, [
      el('div', { class: 'card card-pad' }, [
        el('strong', { style: { display: 'block', marginBottom: '4px' } }, ['🔍 Search & Navigation']),
        el('span', { class: 'text-secondary' }, ['Press Ctrl+K (or Cmd+K) anywhere to open the Command Palette or search projects and tasks instantly.'])
      ]),
      el('div', { class: 'card card-pad' }, [
        el('strong', { style: { display: 'block', marginBottom: '4px' } }, ['📋 Project & Task Management']),
        el('span', { class: 'text-secondary' }, ['Create projects and tasks using the "New Task" or "New Project" buttons. Drag and drop tasks in Kanban view to update status.'])
      ]),
      el('div', { class: 'card card-pad' }, [
        el('strong', { style: { display: 'block', marginBottom: '4px' } }, ['👤 User Profile & Settings']),
        el('span', { class: 'text-secondary' }, ['Access your Profile or Settings from the top right user menu to edit your details or return to the landing page.'])
      ])
    ])
  ])
  openModal({ title: 'Help & Guide', content: modal, variant: 'center', width: '520px' })
}

/* ---------------- Mobile drawer ---------------- */
function openMobileDrawer() {
  let drawer = $('#app-drawer')
  if (!drawer) {
    const NAV = [
      { page: 'dashboard', label: 'Dashboard', icon: 'home' },
      { page: 'projects', label: 'Projects', icon: 'folder' },
      { page: 'tasks', label: 'My Tasks', icon: 'task' },
      { page: 'calendar', label: 'Calendar', icon: 'calendar' },
      { page: 'timeline', label: 'Timeline', icon: 'timeline' },
      { page: 'team', label: 'Team', icon: 'team' },
      { page: 'analytics', label: 'Analytics', icon: 'analytics' },
      { page: 'activity', label: 'Activity', icon: 'activity' },
      { page: 'settings', label: 'Settings', icon: 'settings' }
    ]
    const links = NAV.map((n) => el('a', { class: 'drawer-link', href: n.href || `#/app/${n.page}` }, [
      icon(n.icon, { size: 18 }), n.label
    ]))
    drawer = el('div', { class: 'drawer', id: 'app-drawer' }, [
      el('div', { class: 'drawer-scrim', onclick: () => drawer.classList.remove('open') }),
      el('div', { class: 'drawer-panel' }, [
        el('div', { class: 'drawer-head' }, [
          el('div', { class: 'brand' }, [icon('logo', { size: 20 }), el('span', { class: 'brand-name' }, ['Northwind'])]),
          el('button', { class: 'btn btn-icon btn-ghost', onclick: () => drawer.classList.remove('open') }, [icon('close', { size: 18 })])
        ]),
        el('nav', { class: 'drawer-links' }, links),
        el('div', { class: 'drawer-actions' }, [
          el('button', { class: 'btn btn-primary btn-block', onclick: () => { drawer.classList.remove('open'); openCreateTask() } }, [icon('plus', { size: 15 }), 'New task'])
        ])
      ])
    ])
    document.body.appendChild(drawer)
  }
  requestAnimationFrame(() => drawer.classList.add('open'))
  drawer.querySelectorAll('.drawer-link').forEach((a) => a.addEventListener('click', () => drawer.classList.remove('open')))
}
