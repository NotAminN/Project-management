// pages/project-files.js — file attachments aggregated for a project.
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { avatar } from '../components/avatar.js'
import { projectTasks, getState } from '../state/app-state.js'
import { fmtShort } from '../utils/format.js'

export function renderFiles(panel, p) {
  const files = []
  projectTasks(p.id).forEach((t) => (t.attachments || []).forEach((a) => files.push({ ...a, task: t })))
  // Seed a couple of project-level files for realism
  const seed = [
    { name: 'brand-guidelines.pdf', type: 'PDF', size: '3.2 MB', uploader: p.memberIds[0], date: new Date(Date.now() - 9 * 864e5), task: null },
    { name: 'kickoff-notes.md', type: 'MD', size: '22 KB', uploader: p.memberIds[1] || p.memberIds[0], date: new Date(Date.now() - 4 * 864e5), task: null }
  ]
  const all = [...files, ...seed]

  const grid = el('div', { class: 'files-grid' }, all.length ? all.map(fileCard) : [
    el('div', { class: 'empty-state card card-pad' }, [
      el('span', { class: 'empty-ic' }, [icon('paperclip', { size: 24 })]),
      el('h3', {}, ['No files yet']),
      el('p', { class: 'text-secondary' }, ['Attachments from tasks will appear here.'])
    ])
  ])
  panel.appendChild(grid)
}

function fileCard(f) {
  const u = getState().users.find((x) => x.id === f.uploader)
  return el('div', { class: 'file-card card card-pad card-hover' }, [
    el('div', { class: 'file-ic', style: { background: typeColor(f.type) + '1a', color: typeColor(f.type) } }, [icon('file', { size: 18 })]),
    el('div', { class: 'file-info' }, [
      el('span', { class: 'file-name' }, [f.name]),
      el('span', { class: 'text-secondary file-meta' }, [`${f.type} · ${f.size}`])
    ]),
    el('div', { class: 'file-foot' }, [
      el('span', { class: 'text-secondary' }, [avatar(f.uploader, 22), u?.firstName || '?']),
      el('span', { class: 'text-secondary file-date' }, [fmtShort(f.date)])
    ])
  ])
}

function typeColor(type) {
  return { PDF: '#b5615e', JSON: '#7186a3', FIG: '#a07d9e', MD: '#6e9b7c' }[type] || '#b99a5b'
}
