// pages/project-timeline.js — lightweight Gantt-style timeline for a project.
import { el } from '../utils/dom.js'
import { projectTasks } from '../state/app-state.js'
import { TODAY, startOfDay, addDays } from '../utils/format.js'

export function renderProjectTimeline(panel, p) {
  const tasks = projectTasks(p.id)
  // Build a date window from project start to deadline.
  const start = startOfDay(p.start)
  const end = startOfDay(p.deadline)
  const span = Math.max(1, Math.round((end - start) / 86400000))
  const todayOffset = Math.max(0, Math.min(span, Math.round((startOfDay(TODAY) - start) / 86400000)))

  const wrap = el('div', { class: 'gantt' }, [
    el('div', { class: 'gantt-head' }, [
      el('div', { class: 'gantt-labels' }, [el('span', {}, ['Task'])]),
      el('div', { class: 'gantt-axis' }, monthTicks(start, end))
    ]),
    el('div', { class: 'gantt-rows' }, tasks.map((t) => {
      const ts = startOfDay(t.created)
      const te = startOfDay(t.due)
      const a = Math.max(0, Math.round((ts - start) / 86400000))
      const b = Math.max(a + 1, Math.round((te - start) / 86400000))
      const left = (a / span) * 100
      const width = ((b - a) / span) * 100
      const done = t.status === 'Done'
      return el('div', { class: 'gantt-row' }, [
        el('div', { class: 'gantt-labels' }, [el('span', { class: 'gantt-task-name' }, [t.title])]),
        el('div', { class: 'gantt-track' }, [
          el('div', { class: 'gantt-bar' + (done ? ' done' : ''), style: { left: left + '%', width: width + '%', background: p.color } }, [
            el('span', { class: 'gantt-bar-label' }, [t.code])
          ])
        ])
      ])
    }))
  ])
  // Today marker overlaid on the track area only (positioned via CSS grid alignment)
  const todayMarker = el('div', { class: 'gantt-today', style: { gridColumnStart: 2, left: `calc(${todayOffset / span} * 100%)` } }, [
    el('span', { class: 'gantt-today-label' }, ['Today'])
  ])
  wrap.querySelector('.gantt-rows')?.append(todayMarker)
  panel.appendChild(wrap)
}

function monthTicks(start, end) {
  const ticks = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const endD = new Date(end)
  while (cur <= endD) {
    ticks.push(el('span', { class: 'gantt-tick' }, [cur.toLocaleString('en', { month: 'short' })]))
    cur.setMonth(cur.getMonth() + 1)
  }
  return ticks
}
