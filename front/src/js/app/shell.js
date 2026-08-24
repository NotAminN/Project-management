// app/shell.js — application shell: sidebar + topbar + routed content.
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { renderSidebar, setActiveNav, updateSidebar } from './sidebar.js'
import { renderTopbar, updateNotificationBadge, updateTopbarUser } from './topbar.js'
import { getUI } from '../state/app-state.js'
import { canAccessView } from '../utils/plan-guard.js'
import { renderDashboard } from '../pages/dashboard.js'
import { renderProjects } from '../pages/projects.js'
import { renderProjectDetail } from '../pages/project-detail.js'
import { renderTasks } from '../pages/tasks.js'
import { renderCalendar } from '../pages/calendar.js'
import { renderTimeline } from '../pages/timeline.js'
import { renderTeam } from '../pages/team.js'
import { renderAnalytics } from '../pages/analytics.js'
import { renderActivity } from '../pages/activity.js'
import { renderSettings } from '../pages/settings.js'
import { renderProfile } from '../pages/profile.js'
import { needsOnboarding, runOnboarding } from './onboarding.js'
import { userService } from '../services/users.js'
import { projectService } from '../services/projects.js'
import { taskService } from '../services/tasks.js'
import { notificationService } from '../services/notifications.js'

let shellBuilt = false
let initialDataLoaded = false

export async function initAppData() {
  try {
    await userService.getProfile()
    updateTopbarUser()
    await Promise.all([
      userService.list(),
      projectService.list(),
      taskService.list(),
      notificationService.list()
    ])
    initialDataLoaded = true
    updateTopbarUser()
  } catch (e) {
    console.error('Failed to load initial app data:', e)
  }
}

export function ensureShell(root) {
  if (shellBuilt && $('#app-content')) return
  shellBuilt = false
  root.innerHTML = ''
  const shell = el('div', { class: 'app-shell', id: 'app-shell' }, [
    // Skip to main content link
    el('a', { class: 'skip-link', href: '#app-content', tabindex: 0 }, ['Skip to main content']),
    // Scroll to top button
    el('button', {
      class: 'scroll-top-btn',
      id: 'scroll-top-btn',
      'aria-label': 'Scroll to top',
      onclick: scrollToTop
    }, [
      icon('arrowUp', { size: 20, class: 'scroll-top-icon' })
    ]),
    renderSidebar(getUI().sidebarCollapsed),
    el('div', { class: 'app-main' }, [
      renderTopbar('Dashboard', null),
      el('main', { class: 'app-content', id: 'app-content', tabindex: '-1' })
    ])
  ])
  root.appendChild(shell)
  shellBuilt = true
  updateNotificationBadge()
  initScrollTopButton()
  // Mobile drawer reuse handled by global-ui listening to nw:open-drawer
}

// Map page -> { title, render }
const PAGES = {
  dashboard: { title: 'Dashboard', render: renderDashboard },
  projects: { title: 'Projects', render: renderProjects },
  project: { title: 'Project', render: renderProjectDetail, param: 'id' },
  tasks: { title: 'My Tasks', render: renderTasks },
  calendar: { title: 'Calendar', render: renderCalendar },
  timeline: { title: 'Timeline', render: renderTimeline },
  team: { title: 'Team', render: renderTeam },
  analytics: { title: 'Analytics', render: renderAnalytics },
  activity: { title: 'Activity', render: renderActivity },
  settings: { title: 'Settings', render: renderSettings },
  profile: { title: 'Profile', render: renderProfile }
}

export async function renderAppPage(info) {
  if (!shellBuilt) ensureShell($('#app'))
  
  if (!initialDataLoaded) {
    initAppData().then(() => {
      // Re-update sidebar & topbar once data is populated
      updateSidebar()
      updateNotificationBadge()
      updateTopbarUser()
    })
  }
  const page = info.page || 'dashboard'
  const def = PAGES[page] || PAGES.dashboard

  // Update topbar title
  const heading = $('#app-topbar .tb-heading')
  if (heading) heading.textContent = def.title
  const crumb = $('#app-topbar .tb-crumb')

  // Update sidebar active state
  if (page === 'project') setActiveNav('projects')
  else setActiveNav(page)
  updateSidebar()
  updateNotificationBadge()

  // Render content
  const content = $('#app-content')
  content.innerHTML = ''

  const access = canAccessView(page)
  if (!access.allowed) {
    content.appendChild(upgradeRequiredState(page, access.reason))
    return
  }

  const params = page === 'project' ? { id: info.id } : {}
  if (!def.render) {
    content.appendChild(errorState())
    return
  }
  def.render(content, params)

  // Scroll to top of content (reset Lenis if present)
  if (window.NorthwindLenis) window.NorthwindLenis.scrollTo(0, { immediate: true })
  else content.scrollTop = 0
}

function errorState(code = '404') {
  return el('div', { class: 'error-state' }, [
    el('span', { class: 'error-code' }, [code]),
    el('h3', {}, ['Page not found']),
    el('p', { class: 'text-secondary' }, ['The page you are looking for doesn\'t exist or has been moved.']),
    el('a', { class: 'btn btn-primary', href: '#/app/dashboard' }, ['Back to dashboard'])
  ])
}

function upgradeRequiredState(pageName, reason) {
  return el('div', { class: 'error-state card card-pad', style: { maxWidth: '520px', margin: '60px auto', textAlign: 'center', padding: '40px 24px' } }, [
    el('div', { style: { width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(185, 154, 91, 0.15)', color: 'var(--color-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, [
      icon('zap', { size: 30 })
    ]),
    el('h2', { class: 'font-display', style: { fontSize: '24px', marginBottom: '8px' } }, [`${pageName.charAt(0).toUpperCase() + pageName.slice(1)} View Requires Pro Plan`]),
    el('p', { class: 'text-secondary', style: { fontSize: '14px', marginBottom: '24px' } }, [reason]),
    el('a', { class: 'btn btn-gold btn-lg', href: '#/select-plan' }, [icon('zap', { size: 16 }), 'Upgrade Workspace Plan']),
    el('div', { style: { marginTop: '16px' } }, [
      el('a', { class: 'btn btn-subtle btn-sm', href: '#/app/dashboard' }, ['Back to Dashboard'])
    ])
  ])
}

// Scroll to top button logic
function initScrollTopButton() {
  const btn = $('#scroll-top-btn')
  if (!btn) return

  const onScroll = () => {
    const scrollY = window.scrollY
    if (scrollY > 300) {
      btn.classList.add('visible')
    } else {
      btn.classList.remove('visible')
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })

  // Store cleanup
  btn._scrollCleanup = () => {
    window.removeEventListener('scroll', onScroll)
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function destroyShell() {
  const btn = $('#scroll-top-btn')
  if (btn && btn._scrollCleanup) btn._scrollCleanup()
  shellBuilt = false
  initialDataLoaded = false
  const root = $('#app')
  if (root) root.innerHTML = ''
}
