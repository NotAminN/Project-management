// pages/project-calendar.js — project task deadlines + milestones on a month grid.
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { avatar } from '../components/avatar.js'
import { projectTasks } from '../state/app-state.js'
import { milestones } from '../data/projects.js'
import { TODAY, fmtShort, addDays, startOfDay } from '../utils/format.js'
import { openTaskModal } from '../components/task-modal.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function renderProjectCalendar(panel, p) {
  const now = new Date(TODAY)
  let view = new Date(now.getFullYear(), now.getMonth(), 1)
  const grid = el('div', { class: 'cal' })
  panel.appendChild(grid)
  draw(view)

  function draw(date) {
    grid.innerHTML = ''
    const year = date.getFullYear(), month = date.getMonth()
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const tasks = projectTasks(p.id)
    const events = [
      ...tasks.map((t) => ({ date: startOfDay(t.due), kind: 'task', ref: t, color: p.color })),
      ...milestones.filter((m) => m.projectId === p.id).map((m) => ({ date: startOfDay(m.date), kind: 'milestone', ref: m, color: '#b99a5b' }))
    ]

    const head = el('div', { class: 'cal-head' }, [
      el('div', { class: 'cal-nav' }, [
        btn('chevronLeft', () => { view = new Date(year, month - 1, 1); draw(view) }),
        btn('chevronRight', () => { view = new Date(year, month + 1, 1); draw(view) })
      ]),
      el('h3', { class: 'cal-title font-display' }, [`${MONTHS[month]} ${year}`]),
      el('div', { class: 'cal-legend' }, [
        legend('#b99a5b', 'Milestone'), legend(p.color, 'Deadline')
      ])
    ])

    const weekRow = el('div', { class: 'cal-week' }, DAYS.map((d) => el('span', { class: 'cal-dow' }, [d])))
    const cells = el('div', { class: 'cal-grid' })

    const total = startOffset + daysInMonth
    const weeks = Math.ceil(total / 7)
    for (let i = 0; i < weeks * 7; i++) {
      const dayNum = i - startOffset + 1
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth
      const d = new Date(year, month, dayNum)
      const isToday = startOfDay(d).getTime() === startOfDay(TODAY).getTime()
      const dayEvents = events.filter((e) => startOfDay(e.date).getTime() === startOfDay(d).getTime())

      const cell = el('div', { class: 'cal-cell' + (inMonth ? '' : ' out') + (isToday ? ' today' : '') }, [
        el('span', { class: 'cal-daynum' }, [inMonth ? String(dayNum) : '']),
        el('div', { class: 'cal-events' }, dayEvents.slice(0, 3).map((ev) =>
          el('span', {
            class: 'cal-event' + (ev.kind === 'milestone' ? ' milestone' : ''),
            title: ev.kind === 'milestone' ? ev.ref.name : ev.ref.title,
            onclick: () => { if (ev.kind === 'task' && ev.ref) openTaskModal(ev.ref.id) }
          }, [ev.kind === 'milestone' ? icon('flag', { size: 10 }) : null, ev.kind === 'milestone' ? ev.ref.name : ev.ref.code].filter(Boolean))
        )),
        dayEvents.length > 3 ? el('span', { class: 'cal-more' }, [`+${dayEvents.length - 3}`]) : null
      ].filter(Boolean))
      cells.appendChild(cell)
    }

    grid.append(head, weekRow, cells)
  }

  function btn(ic, onClick) {
    return el('button', { class: 'btn btn-icon btn-ghost', 'aria-label': 'Navigate', onclick: onClick }, [icon(ic, { size: 18 })])
  }
  function legend(color, label) {
    return el('span', { class: 'cal-leg' }, [el('span', { class: 'label-dot', style: { background: color } }), label])
  }
}
