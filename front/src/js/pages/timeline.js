// pages/timeline.js — global project timeline (Gantt) across workspace projects.
import { el } from '../utils/dom.js'
import { getState, workspaceProjects } from '../state/app-state.js'
import { TODAY, startOfDay } from '../utils/format.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function renderTimeline(root) {
  const wsProjects = workspaceProjects().filter((p) => p.status !== 'Archived')
  const tasks = getState().tasks

  let min = startOfDay(TODAY), max = startOfDay(TODAY)
  tasks.forEach((t) => {
    const c = startOfDay(t.created_at || t.created || TODAY)
    const d = startOfDay(t.due_date || t.due || TODAY)
    if (c < min) min = c
    if (d > max) max = d
  })
  const span = Math.max(30, Math.round((max - min) / 86400000))

  const page = el('div', { class: 'page timeline' }, [
    el('div', { class: 'page-top' }, [
      el('div', {}, [
        el('h2', { class: 'page-title font-display' }, ['Timeline']),
        el('p', { class: 'page-sub text-secondary' }, ['Every task, mapped across time.'])
      ])
    ]),
    el('div', { class: 'gantt gantt-global' }, [
      el('div', { class: 'gantt-head' }, [
        el('div', { class: 'gantt-labels' }, [el('span', {}, ['Project / Task'])]),
        el('div', { class: 'gantt-axis' }, axisTicks(min, span))
      ]),
      el('div', { class: 'gantt-rows' }, wsProjects.flatMap((p) => [
        el('div', { class: 'gantt-group' }, [
          el('div', { class: 'gantt-labels' }, [el('span', { class: 'gantt-group-name', style: { color: p.color || '#b99a5b' } }, [p.name || p.title])]),
          el('div', { class: 'gantt-track gantt-track-group' })
        ]),
        ...tasks.filter((t) => (t.projectId || t.project) == p.id).map((t) => {
          const a = Math.round((startOfDay(t.created_at || t.created || TODAY) - min) / 86400000)
          const b = Math.max(a + 1, Math.round((startOfDay(t.due_date || t.due || TODAY) - min) / 86400000))
          const done = t.status === 'Done'
          return el('div', { class: 'gantt-row' }, [
            el('div', { class: 'gantt-labels' }, [el('span', { class: 'gantt-task-name' }, [t.title])]),
            el('div', { class: 'gantt-track' }, [
              el('div', { class: 'gantt-bar' + (done ? ' done' : ''), style: { left: (a / span) * 100 + '%', width: Math.max(5, ((b - a) / span) * 100) + '%', background: p.color || '#b99a5b' } }, [
                el('span', { class: 'gantt-bar-label' }, [t.code || `TSK-${t.id}`])
              ])
            ])
          ])
        })
      ]))
    ])
  ])
  root.appendChild(page)
}

function axisTicks(min, span) {
  const ticks = []
  const cur = new Date(min.getFullYear(), min.getMonth(), 1)
  const end = new Date(min.getTime() + span * 86400000)
  while (cur <= end) {
    ticks.push(el('span', { class: 'gantt-tick' }, [`${MONTHS[cur.getMonth()]} ${cur.getFullYear() % 100}`]))
    cur.setMonth(cur.getMonth() + 1)
  }
  return ticks
}
