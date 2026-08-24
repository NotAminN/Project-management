// pages/calendar.js — global calendar across all workspace tasks + milestones.
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { getState, workspaceProjects } from '../state/app-state.js'
import { milestones } from '../data/projects.js'
import { TODAY, startOfDay } from '../utils/format.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function renderCalendar(root) {
  const now = new Date(TODAY)
  let view = new Date(now.getFullYear(), now.getMonth(), 1)
  const page = el('div', { class: 'page calendar' }, [
    el('div', { class: 'page-top' }, [
      el('div', {}, [
        el('h2', { class: 'page-title font-display' }, ['Calendar']),
        el('p', { class: 'page-sub text-secondary' }, ['Deadlines, milestones, and upcoming work.'])
      ])
    ])
  ])
  const grid = el('div', { class: 'cal' })
  page.appendChild(grid)
  root.appendChild(page)
  draw(view)

  function draw(date) {
    grid.innerHTML = ''
    const year = date.getFullYear(), month = date.getMonth()
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const wsProjects = workspaceProjects()
    const tasks = getState().tasks
    const events = tasks.filter(t => t.due || t.due_date).map((t) => {
      const d = t.due || t.due_date
      const pId = t.projectId || t.project
      const proj = wsProjects.find((p) => p.id == pId)
      return {
        date: startOfDay(d),
        kind: 'task',
        ref: t,
        color: proj?.color || '#b99a5b',
        title: t.title,
        code: t.code || `TSK-${t.id}`
      }
    })

    const head = el('div', { class: 'cal-head' }, [
      el('div', { class: 'cal-nav' }, [
        navBtn('chevronLeft', () => { view = new Date(year, month - 1, 1); draw(view) }),
        navBtn('chevronRight', () => { view = new Date(year, month + 1, 1); draw(view) })
      ]),
      el('h3', { class: 'cal-title font-display' }, [`${MONTHS[month]} ${year}`]),
      el('button', { class: 'btn btn-soft btn-sm', onclick: () => { view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1); draw(view) } }, ['Today'])
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
          el('span', { class: 'cal-event' + (ev.kind === 'milestone' ? ' milestone' : ''), title: ev.title }, [
            ev.kind === 'milestone' ? icon('flag', { size: 10 }) : null,
            ev.kind === 'milestone' ? ev.title : ev.code
          ].filter(Boolean))
        )),
        dayEvents.length > 3 ? el('span', { class: 'cal-more' }, [`+${dayEvents.length - 3}`]) : null
      ].filter(Boolean))
      cells.appendChild(cell)
    }
    grid.append(head, weekRow, cells)
  }

  function navBtn(ic, onClick) {
    return el('button', { class: 'btn btn-icon btn-ghost', 'aria-label': 'Navigate', onclick: onClick }, [icon(ic, { size: 18 })])
  }
}
