// app/topbar.js — top navigation: search, command palette, notifications, help, user.
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { unreadCount, getState, getCurrentUser } from '../state/app-state.js'
import { avatar } from '../components/avatar.js'

export function renderTopbar(title, crumb) {
  const user = getCurrentUser() || { id: 'me', name: 'User' }
  const searchBtn = el('button', {
    class: 'tb-search', id: 'tb-search', 'aria-label': 'Search',
    onclick: () => document.dispatchEvent(new CustomEvent('nw:open-search'))
  }, [
    icon('search', { size: 17 }),
    el('span', { class: 'tb-search-text' }, ['Search projects, tasks, people…']),
    el('span', { class: 'kbd' }, ['⌘K'])
  ])

  const cmdBtn = el('button', {
    class: 'btn btn-icon btn-ghost tb-icon', 'aria-label': 'Command palette', title: 'Commands',
    onclick: () => document.dispatchEvent(new CustomEvent('nw:open-command'))
  }, [icon('command', { size: 18 })])

  const bellBtn = el('button', {
    class: 'btn btn-icon btn-ghost tb-icon has-tip', 'aria-label': 'Notifications', title: 'Notifications',
    id: 'tb-bell', onclick: () => document.dispatchEvent(new CustomEvent('nw:open-notifications'))
  }, [
    icon('bell', { size: 18 }),
    el('span', { class: 'tb-badge', id: 'tb-badge', style: { display: 'none' } }, ['0'])
  ])

  const helpBtn = el('button', {
    class: 'btn btn-icon btn-ghost tb-icon hide-mobile', 'aria-label': 'Help', title: 'Help',
    onclick: () => document.dispatchEvent(new CustomEvent('nw:open-help'))
  }, [icon('info', { size: 18 })])

  const displayName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'User'
  const userBtn = el('button', {
    class: 'tb-user', id: 'tb-user', 'aria-label': 'Account menu',
    onclick: () => document.dispatchEvent(new CustomEvent('nw:open-user'))
  }, [
    avatar(user.id || 'me', 30),
    el('span', { class: 'tb-user-meta hide-mobile' }, [
      el('span', { class: 'tb-user-name' }, [displayName]),
      el('span', { class: 'tb-user-role' }, [getState().ui.role || 'Member'])
    ]),
    icon('chevronDown', { size: 15, class: 'hide-mobile' })
  ])

  const menuBtn = el('button', {
    class: 'btn btn-icon btn-ghost tb-icon hide-desktop', 'aria-label': 'Open menu',
    onclick: () => document.dispatchEvent(new CustomEvent('nw:open-drawer'))
  }, [icon('menu', { size: 20 })])

  const bar = el('header', { class: 'app-topbar', id: 'app-topbar' }, [
    el('div', { class: 'tb-left' }, [
      menuBtn,
      el('div', { class: 'tb-title' }, [
        crumb ? el('span', { class: 'tb-crumb text-secondary' }, [crumb]) : null,
        el('h1', { class: 'tb-heading' }, [title])
      ].filter(Boolean))
    ]),
    el('div', { class: 'tb-right' }, [
      searchBtn,
      cmdBtn,
      bellBtn,
      helpBtn,
      userBtn
    ])
  ])
  return bar
}

export function updateNotificationBadge() {
  const badge = $('#tb-badge')
  if (!badge) return
  const n = unreadCount()
  badge.textContent = n > 9 ? '9+' : String(n)
  badge.style.display = n > 0 ? 'flex' : 'none'
}

export function updateTopbarUser() {
  const nameEl = $('#app-topbar .tb-user-name')
  if (!nameEl) return
  const user = getCurrentUser()
  const displayName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'User'
  nameEl.textContent = displayName
}
