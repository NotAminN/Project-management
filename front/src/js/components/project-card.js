// components/project-card.js — project card for dashboards / project list.
import { el } from '../utils/dom.js'
import { icon } from './icons.js'
import { avatarStack } from './avatar.js'
import { projectStatusBadge, healthBadge } from './badges.js'
import { fmtShort, addDays } from '../utils/format.js'

export function projectCard(p, { onClick } = {}) {
  const card = el('article', {
    class: 'project-card card card-pad card-hover', dataset: { id: p.id }, tabindex: '0', role: 'button',
    'aria-label': `Project: ${p.name}`
  }, [
    el('div', { class: 'pc-top' }, [
      el('span', { class: 'pc-glyph', style: { background: `${p.color || '#b99a5b'}1a`, color: p.color || '#b99a5b' } }, [icon('folder', { size: 18 })]),
      el('div', { class: 'pc-status-row' }, [projectStatusBadge(p.status), healthBadge(p.health)])
    ]),
    el('h3', { class: 'pc-name' }, [p.name || p.title || 'Untitled Project']),
    el('p', { class: 'pc-desc text-secondary' }, [p.description || '']),
    el('div', { class: 'pc-progress-row' }, [
      el('div', { class: 'progress', style: { flex: '1' } }, [
        el('div', { class: 'progress-bar', style: { width: (p.progress || 0) + '%', background: p.color || '#b99a5b' } })
      ]),
      el('span', { class: 'pc-pct font-mono' }, [(p.progress || 0) + '%'])
    ]),
    el('div', { class: 'pc-foot' }, [
      avatarStack(p.memberIds || [], 26, 4),
      el('span', { class: 'pc-due text-secondary' }, [
        icon('clock', { size: 13 }), 'Due ' + fmtShort(p.deadline || p.due)
      ])
    ]),
    el('div', { class: 'pc-tags' }, [
      el('span', { class: 'pc-code font-mono' }, [p.code || 'PRJ']),
      ...(p.labels || []).map((l) => el('span', { class: 'pc-tag' }, [l]))
    ])
  ])

  const open = () => onClick?.(p)
  card.addEventListener('click', open)
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter') open() })
  return card
}
