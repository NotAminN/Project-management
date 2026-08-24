// pages/team.js — team members, roles, workload.
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { avatar } from '../components/avatar.js'
import { openInviteMember } from '../components/quick-create.js'
import { getState, getTasks } from '../state/app-state.js'
import { userService } from '../services/users.js'
import { scrollRevealGroup } from '../animations/gsap.js'

export async function renderTeam(root) {
  root.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">Loading Team...</div>'
  const users = await userService.list() || getState().users
  root.innerHTML = ''

  const tasks = getTasks()

  const members = users.map((u) => {
    const assigned = tasks.filter((t) => t.assignee === u.id || t.assigned_to === u.id)
    const open = assigned.filter((t) => t.status !== 'Done').length
    const done = assigned.filter((t) => t.status === 'Done').length
    return {
      ...u,
      name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username,
      open,
      done,
      workload: u.workload || Math.min(95, Math.max(10, open * 15))
    }
  })

  const page = el('div', { class: 'page team' }, [
    el('div', { class: 'page-top' }, [
      el('div', {}, [
        el('h2', { class: 'page-title font-display' }, ['Team']),
        el('p', { class: 'page-sub text-secondary' }, [`${members.length} member${members.length === 1 ? '' : 's'} registered in system`])
      ]),
      el('button', { class: 'btn btn-primary', onclick: () => openInviteMember() }, [icon('user', { size: 16 }), 'Invite member'])
    ]),
    el('section', { class: 'team-workload' }, [
      el('div', { class: 'card card-pad' }, [
        el('div', { class: 'card-head' }, [el('h3', {}, ['Workload this week']), el('span', { class: 'text-secondary' }, ['By open tasks'])]),
        el('div', { class: 'workload-list' }, members.map((m) => workloadRow(m)))
      ])
    ]),
    el('section', { class: 'team-grid' }, members.map((m) => memberCard(m)))
  ])

  root.appendChild(page)
  scrollRevealGroup('.team-grid', '.member-card', { y: 22, stagger: 0.05 })
}

function workloadRow(m) {
  const color = m.workload > 80 ? 'var(--color-danger)' : m.workload > 60 ? 'var(--color-warning)' : 'var(--color-sage)'
  return el('div', { class: 'workload-row' }, [
    el('div', { class: 'workload-id' }, [avatar(m.id, 28), el('span', {}, [m.name])]),
    el('div', { class: 'workload-bar-wrap' }, [
      el('div', { class: 'progress', style: { height: '8px' } }, [
        el('div', { class: 'progress-bar', style: { width: m.workload + '%', background: color } })
      ])
    ]),
    el('span', { class: 'workload-pct font-mono' }, [m.workload + '%'])
  ])
}

function memberCard(m) {
  return el('article', { class: 'member-card card card-pad card-hover' }, [
    el('div', { class: 'member-top' }, [
      avatar(m.id, 48),
      el('div', {}, [
        el('h3', { class: 'member-name' }, [m.name]),
        el('span', { class: 'text-secondary member-role' }, [m.role || m.title || 'Team Member'])
      ]),
      el('span', { class: 'member-status', title: 'Active' }, [
        el('span', { class: 'label-dot', style: { background: '#6e9b7c' } })
      ])
    ]),
    el('p', { class: 'member-bio text-secondary' }, [m.email ? `Email: ${m.email}` : '']),
    el('div', { class: 'member-stats' }, [
      stat('Open', m.open), stat('Done', m.done), stat('Load', m.workload + '%')
    ]),
    el('div', { class: 'member-tags' }, (m.skills || ['Member']).map((s) => el('span', { class: 'badge' }, [s])))
  ])
}

function stat(label, val) {
  return el('div', { class: 'member-stat' }, [el('span', { class: 'member-stat-num font-display' }, [String(val)]), el('span', { class: 'text-secondary' }, [label])])
}
