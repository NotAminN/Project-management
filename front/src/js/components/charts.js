// components/charts.js — lightweight SVG charts matching the design system.
import { el } from '../utils/dom.js'

// Line/area chart. data: number[] (0..max optional). labels optional.
export function lineChart(data, opts = {}) {
  const { color = '#b99a5b', height = 160, max } = opts
  const w = 520, h = height, pad = 8
  const maxV = max || Math.max(...data, 1)
  const step = (w - pad * 2) / (data.length - 1)
  const pts = data.map((v, i) => [pad + i * step, h - pad - (v / maxV) * (h - pad * 2)])
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pts[0][0].toFixed(1)} ${h - pad} Z`
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('class', 'chart-svg')
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.innerHTML = `
    <defs><linearGradient id="lg-${color.replace('#', '')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#lg-${color.replace('#', '')})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#fcfbf8" stroke="${color}" stroke-width="2"/>`).join('')}
  `
  return el('div', { class: 'chart chart-line' }, [svg])
}

// Bar chart. data: number[]; colors optional per bar.
export function barChart(data, opts = {}) {
  const { colors = ['#b99a5b'], height = 160, max } = opts
  const w = 520, h = height, pad = 8
  const maxV = max || Math.max(...data, 1)
  const bw = (w - pad * 2) / data.length
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('class', 'chart-svg')
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.innerHTML = data.map((v, i) => {
    const bh = (v / maxV) * (h - pad * 2)
    const x = pad + i * bw + bw * 0.18
    const bw2 = bw * 0.64
    const y = h - pad - bh
    const c = colors[i % colors.length]
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw2.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${c}" opacity="0.9"/>`
  }).join('')
  return el('div', { class: 'chart chart-bar' }, [svg])
}

// Donut. segments: [{value, color, label}]
export function donutChart(segments, opts = {}) {
  const { size = 150, thickness = 16 } = opts
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  const circles = segments.map((s) => {
    const frac = s.value / total
    const dash = frac * c
    const circle = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${thickness}" stroke-dasharray="${dash.toFixed(1)} ${(c - dash).toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`
    offset += dash
    return circle
  }).join('')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
  svg.setAttribute('class', 'chart-donut')
  svg.innerHTML = circles
  return svg
}

// Horizontal progress list (e.g., project health bars)
export function progressList(items, opts = {}) {
  return el('div', { class: 'chart-progress' }, items.map((it) =>
    el('div', { class: 'chart-progress-row' }, [
      el('span', { class: 'chart-progress-label' }, [it.label]),
      el('div', { class: 'progress', style: { flex: '1' } }, [
        el('div', { class: 'progress-bar', style: { width: it.value + '%', background: it.color || '#b99a5b' } })
      ]),
      el('span', { class: 'chart-progress-val font-mono' }, [it.value + '%'])
    ])
  ))
}
