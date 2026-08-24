// pages/analytics.js — premium analytics dashboard (Phase 15).
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { lineChart, barChart, donutChart, progressList } from '../components/charts.js'
import { workspaceProjects, getTasks, getState } from '../state/app-state.js'
import { scrollRevealGroup } from '../animations/gsap.js'

export function renderAnalytics(root) {
  const projects = workspaceProjects().filter((p) => p.status !== 'Archived')
  const tasks = getTasks().filter((t) => projects.some((p) => p.id === t.projectId))
  const done = tasks.filter((t) => t.status === 'Done').length
  const open = tasks.length - done
  const overdue = tasks.filter((t) => t.status !== 'Done' && new Date(t.due) < new Date()).length
  const completionRate = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  // Demo series (deterministic)
  const createdSeries = [12, 18, 15, 22, 19, 27, 24, 31, 28, 33, 30, 38]
  const completedSeries = [8, 12, 14, 17, 16, 21, 23, 26, 25, 29, 31, 38]
  // Health distribution
  const healthy = projects.filter((p) => p.health === 'Healthy').length
  const atRisk = projects.filter((p) => p.health === 'At Risk').length
  const critical = projects.filter((p) => p.health === 'Critical').length

  const page = el('div', { class: 'page analytics' }, [
    el('div', { class: 'page-top' }, [
      el('div', {}, [
        el('h2', { class: 'page-title font-display' }, ['Analytics']),
        el('p', { class: 'page-sub text-secondary' }, ['Quiet, considered insight into how your team moves.'])
      ])
    ]),
    el('section', { class: 'an-metrics' }, [
      anMetric('Completed tasks', String(done), '+12%', '#6e9b7c', 'arrowUp'),
      anMetric('Open tasks', String(open), 'steady', '#7186a3', 'list'),
      anMetric('Overdue', String(overdue), overdue ? 'review' : 'clear', '#b5615e', 'clock'),
      anMetric('Completion rate', completionRate + '%', '+4%', '#b99a5b', 'check')
    ]),
    el('section', { class: 'an-grid' }, [
      el('div', { class: 'card card-pad an-chart' }, [
        el('div', { class: 'card-head' }, [el('h3', {}, ['Tasks created vs completed']), el('span', { class: 'text-secondary' }, ['Last 12 weeks'])]),
        el('div', { class: 'an-lines' }, [
          lineChart(completedSeries, { color: '#6e9b7c', height: 170 }),
          lineChart(createdSeries, { color: '#b99a5b', height: 170 })
        ]),
        el('div', { class: 'an-legend' }, [
          legend('#b99a5b', 'Created'), legend('#6e9b7c', 'Completed')
        ])
      ]),
      el('div', { class: 'card card-pad an-donut' }, [
        el('div', { class: 'card-head' }, [el('h3', {}, ['Project health'])]),
        donutWrap(healthy, atRisk, critical),
        el('div', { class: 'donut-legend' }, [
          donutLeg('#6e9b7c', 'Healthy', healthy), donutLeg('#c8a24b', 'At risk', atRisk), donutLeg('#b5615e', 'Critical', critical)
        ])
      ]),
      el('div', { class: 'card card-pad an-bar' }, [
        el('div', { class: 'card-head' }, [el('h3', {}, ['Workload by member']), el('span', { class: 'text-secondary' }, ['Open tasks'])]),
        barChart(memberLoads(), { colors: ['#7186a3', '#879887', '#b99a5b', '#a07d9e', '#6e9b7c', '#5f8a8b', '#c08a5e'], height: 170 })
      ]),
      el('div', { class: 'card card-pad an-progress' }, [
        el('div', { class: 'card-head' }, [el('h3', {}, ['Project progress'])]),
        progressList(projects.map((p) => ({ label: p.name, value: p.progress, color: p.color })), { })
      ])
    ])
  ])
  root.appendChild(page)
  scrollRevealGroup('.an-metrics', '.an-metric', { y: 18, stagger: 0.05 })
  scrollRevealGroup('.an-grid', '.card', { y: 22, stagger: 0.06 })
}

function lineChartOverlay() {}

function anMetric(label, num, sub, color, ic) {
  return el('article', { class: 'an-metric card card-pad' }, [
    el('div', { class: 'an-metric-ic', style: { background: `${color}1a`, color } }, [icon(ic, { size: 18 })]),
    el('div', {}, [
      el('span', { class: 'text-secondary an-metric-label' }, [label]),
      el('span', { class: 'an-metric-num font-display' }, [num]),
      el('span', { class: 'badge ' + (sub.includes('%') && !sub.startsWith('+') ? 'badge-warning' : sub === 'clear' ? 'badge-success' : 'badge-success') }, [sub])
    ])
  ])
}

function memberLoads() {
  const users = getState().users
  return users.map((u) => getTasks().filter((t) => t.assignee === u.id && t.status !== 'Done').length)
}

function donutWrap(healthy, atRisk, critical) {
  const seg = [
    { value: healthy, color: '#6e9b7c' },
    { value: atRisk, color: '#c8a24b' },
    { value: critical, color: '#b5615e' }
  ]
  const total = healthy + atRisk + critical || 1
  const pct = Math.round((healthy / total) * 100)
  return el('div', { class: 'donut donut-lg' }, [
    donutChart(seg, { size: 150, thickness: 16 }),
    el('span', { class: 'donut-center' }, [el('strong', {}, [pct + '%']), el('span', { class: 'text-secondary' }, ['on track'])])
  ])
}
function donutLeg(color, label, val) {
  return el('span', { class: 'donut-leg' }, [el('span', { class: 'label-dot', style: { background: color } }), label, el('strong', {}, [String(val)])])
}
function legend(color, label) {
  return el('span', { class: 'donut-leg' }, [el('span', { class: 'label-dot', style: { background: color } }), label])
}
