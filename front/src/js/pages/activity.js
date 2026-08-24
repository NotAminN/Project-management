// pages/activity.js — global activity & notification feed.
import { el } from '../utils/dom.js'
import { getState, getNotifications } from '../state/app-state.js'
import { notificationService } from '../services/notifications.js'
import { fromNow } from '../utils/format.js'

export async function renderActivity(root) {
  root.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">Loading Activity...</div>'
  const notifications = await notificationService.list() || getNotifications()
  root.innerHTML = ''

  const page = el('div', { class: 'page activity' }, [
    el('div', { class: 'page-top' }, [
      el('div', {}, [
        el('h2', { class: 'page-title font-display' }, ['Activity']),
        el('p', { class: 'page-sub text-secondary' }, ['A calm timeline of notifications and updates in your workspace.'])
      ])
    ]),
    el('div', { class: 'activity-feed card card-pad' },
      notifications.length ? notifications.map(activityItem) : [
        el('p', { class: 'text-secondary', style: { textAlign: 'center', padding: '20px 0' } }, ['No recent activity or notifications yet.'])
      ]
    )
  ])
  root.appendChild(page)
}

function activityItem(n) {
  const title = n.title || 'System Notification'
  const text = n.message || n.text || ''
  const time = n.created_at || n.time || new Date()
  
  return el('div', { class: 'activity-item activity-item-lg' }, [
    el('span', { class: 'activity-dot', style: { background: '#7186a3' } }),
    el('div', { class: 'activity-body' }, [
      el('p', {}, [el('strong', {}, [title]), text ? `: ${text}` : '']),
      el('span', { class: 'text-secondary activity-time' }, [fromNow(time)])
    ])
  ])
}
