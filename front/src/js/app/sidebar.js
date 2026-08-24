// app/sidebar.js — sidebar navigation with collapse + active state.
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { getState, getUI, getWorkspace, getCurrentUser, updateUI } from '../state/app-state.js'
import { avatar } from '../components/avatar.js'
import { getCurrentPlan } from '../utils/plan-guard.js'

const NAV = [
  { page: 'dashboard', label: 'Dashboard', icon: 'home', href: '#/app/dashboard' },
  { page: 'tasks', label: 'My Tasks', icon: 'task', href: '#/app/tasks' },
  { page: 'projects', label: 'Projects', icon: 'folder', href: '#/app/projects' },
  { page: 'calendar', label: 'Calendar', icon: 'calendar', href: '#/app/calendar' },
  { page: 'timeline', label: 'Timeline', icon: 'timeline', href: '#/app/timeline' },
  { page: 'team', label: 'Team', icon: 'team', href: '#/app/team' },
  { page: 'analytics', label: 'Analytics', icon: 'analytics', href: '#/app/analytics' },
  { page: 'activity', label: 'Activity', icon: 'activity', href: '#/app/activity' },
  { page: 'settings', label: 'Settings', icon: 'settings', href: '#/app/settings' }
]

export function renderSidebar(collapsed) {
  const ws = getWorkspace() || { name: 'Workspace', kind: 'Team', role: 'Member', color: '#b99a5b' }
  const me = getCurrentUser()
  const plan = getCurrentPlan()
  const nav = el('nav', { class: 'sb-nav', 'aria-label': 'Workspace' }, NAV.map((item) => {
    const isProFeature = plan === 'Free' && ['timeline', 'analytics'].includes(item.page)
    return el('a', {
      class: 'sb-link', href: item.href, dataset: { page: item.page },
      'aria-label': item.label
    }, [
      el('span', { class: 'sb-ic' }, [icon(item.icon, { size: 19 })]),
      el('span', { class: 'sb-label' }, [item.label]),
      isProFeature ? el('span', { class: 'badge badge-gold', style: { fontSize: '10px', marginLeft: 'auto', padding: '1px 5px' } }, ['PRO']) : null
    ].filter(Boolean))
  }))

  const aside = el('aside', {
    class: 'app-sidebar' + (collapsed ? ' collapsed' : ''),
    id: 'app-sidebar',
    'aria-label': 'Primary navigation'
  }, [
    el('div', { class: 'sb-head' }, [
      // workspace switcher trigger
      el('button', {
        class: 'sb-ws', id: 'sb-ws-trigger', 'aria-haspopup': 'true', 'aria-expanded': 'false',
        onclick: (e) => { e.stopPropagation(); openWorkspaceMenu() }
      }, [
        el('span', { class: 'sb-ws-glyph', style: { background: ws.color || '#b99a5b' } }, [icon('compass', { size: 16 })]),
        el('span', { class: 'sb-ws-info' }, [
          el('span', { class: 'sb-ws-name' }, [ws.name || 'Workspace']),
          el('span', { class: 'sb-ws-kind' }, [ws.kind || 'Team'])
        ]),
        el('span', { class: 'sb-ws-caret' }, [icon('chevronDown', { size: 15 })])
      ])
    ]),
    nav,
    el('div', { class: 'sb-foot' }, [
      el('button', {
        class: 'sb-collapse', id: 'sb-collapse', 'aria-label': 'Collapse sidebar',
        onclick: () => toggleCollapse()
      }, [
        icon('chevronLeft', { size: 18, class: 'sb-collapse-ic' }),
        el('span', { class: 'sb-label' }, ['Collapse'])
      ]),
      el('a', { class: 'sb-profile', href: '#/app/profile' }, [
        avatar(me?.id, 30),
        el('span', { class: 'sb-label sb-profile-info' }, [
          el('span', { class: 'sb-profile-name' }, [me?.name || 'User']),
          el('span', { class: 'sb-profile-role' }, [ws.role || 'Member'])
        ])
      ])
    ])
  ])
  return aside
}

export function setActiveNav(page) {
  $$sidebarNavLinks().forEach((l) => {
    const active = l.dataset.page === page
    l.classList.toggle('active', active)
    if (active) l.setAttribute('aria-current', 'page')
    else l.removeAttribute('aria-current')
  })
}

function $$sidebarNavLinks() {
  return Array.from(document.querySelectorAll('.sb-link'))
}

export function updateSidebar() {
  const aside = $('#app-sidebar')
  if (!aside) return
  const collapsed = getUI().sidebarCollapsed
  aside.classList.toggle('collapsed', collapsed)
}

function toggleCollapse() {
  const collapsed = !getUI().sidebarCollapsed
  updateUI({ sidebarCollapsed: collapsed })
  const aside = $('#app-sidebar')
  if (aside) aside.classList.toggle('collapsed', collapsed)
}

function openWorkspaceMenu() {
  // Built in workspace-switcher via global-ui; dispatch event.
  document.dispatchEvent(new CustomEvent('nw:open-workspace'))
}
