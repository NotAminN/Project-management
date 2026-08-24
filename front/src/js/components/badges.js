// components/badges.js — semantic badge helpers for status, priority, health, labels.
import { el } from '../utils/dom.js'
import { colorFromString } from '../utils/format.js'

const STATUS_CLASS = {
  Backlog: 'badge', Todo: 'badge-blue', 'In Progress': 'badge', Review: 'badge-warning', Done: 'badge-success'
}
const STATUS_DOT = {
  Backlog: '#a39d93', Todo: '#7186a3', 'In Progress': '#b99a5b', Review: '#c8a24b', Done: '#6e9b7c'
}
const PRIORITY_CLASS = {
  Low: 'badge', Medium: 'badge-blue', High: 'badge-warning', Urgent: 'badge-danger'
}
const PRIORITY_DOT = {
  Low: '#a39d93', Medium: '#7186a3', High: '#c8a24b', Urgent: '#b5615e'
}
const HEALTH_CLASS = { Healthy: 'badge-success', 'At Risk': 'badge-warning', Critical: 'badge-danger' }
const HEALTH_DOT = { Healthy: '#6e9b7c', 'At Risk': '#c8a24b', Critical: '#b5615e' }

export function statusBadge(status) {
  return el('span', { class: `badge ${STATUS_CLASS[status] || 'badge'}` }, [
    el('span', { class: 'dot', style: { background: STATUS_DOT[status] || '#a39d93' } }),
    status
  ])
}

export function priorityBadge(priority) {
  return el('span', { class: `badge ${PRIORITY_CLASS[priority] || 'badge'}` }, [
    el('span', { class: 'dot', style: { background: PRIORITY_DOT[priority] || '#a39d93' } }),
    priority
  ])
}

export function healthBadge(health) {
  return el('span', { class: `badge ${HEALTH_CLASS[health] || 'badge'}` }, [
    el('span', { class: 'dot', style: { background: HEALTH_DOT[health] || '#a39d93' } }),
    health
  ])
}

export function projectStatusBadge(status) {
  const map = {
    Planning: 'badge-blue', Active: 'badge-gold', 'On Hold': 'badge-warning', Completed: 'badge-success', Archived: 'badge'
  }
  return el('span', { class: `badge ${map[status] || 'badge'}` }, [status])
}

export function labelBadge(label) {
  const color = colorFromString(label)
  return el('span', {
    class: 'badge',
    style: { background: `${color}1a`, color }
  }, [label])
}

export function labelDot(label) {
  return el('span', { class: 'label-dot', style: { background: colorFromString(label) } })
}
