// pages/projects.js — project list / overview (Phase 8).
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { projectCard } from '../components/project-card.js'
import { openCreateProject } from '../components/quick-create.js'
import { workspaceProjects, getState } from '../state/app-state.js'
import { PROJECT_STATUSES } from '../data/projects-meta.js'
import { scrollRevealGroup } from '../animations/gsap.js'

import { projectService } from '../services/projects.js'

export async function renderProjects(root) {
  root.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">Loading Projects...</div>'
  await projectService.list()
  root.innerHTML = ''

  const projects = workspaceProjects().filter((p) => p.status !== 'Archived')
  const ws = getState().workspaces.find((w) => w.id === getState().workspaceId)

  const filterBar = el('div', { class: 'proj-filters' }, [
    chip('All', 'all', true),
    ...PROJECT_STATUSES.filter((s) => s !== 'Archived').map((s) => chip(s, s, false))
  ])

  const grid = el('div', { class: 'proj-grid' }, projects.map((p) =>
    projectCard(p, { onClick: () => location.hash = `#/app/project/${p.id}` })
  ))

  const page = el('div', { class: 'page projects' }, [
    el('div', { class: 'page-top' }, [
      el('div', {}, [
        el('h2', { class: 'page-title font-display' }, ['Projects']),
        el('p', { class: 'page-sub text-secondary' }, [`${projects.length} projects in ${ws?.name || 'this workspace'}`])
      ]),
      el('button', { class: 'btn btn-primary', onclick: () => openCreateProject() }, [icon('plus', { size: 16 }), 'New project'])
    ]),
    filterBar,
    grid
  ])

  // Filtering
  filterBar.addEventListener('click', (e) => {
    const c = e.target.closest('.chip')
    if (!c) return
    filterBar.querySelectorAll('.chip').forEach((x) => x.classList.remove('active'))
    c.classList.add('active')
    const f = c.dataset.filter
    grid.innerHTML = ''
    const list = f === 'all' ? projects : projects.filter((p) => p.status === f)
    if (!list.length) {
      grid.append(emptyProjects())
    } else {
      list.forEach((p) => grid.append(projectCard(p, { onClick: () => location.hash = `#/app/project/${p.id}` })))
    }
    scrollRevealGroup(grid, '.project-card', { y: 18 })
  })

  root.appendChild(page)
  scrollRevealGroup(grid, '.project-card', { y: 22, stagger: 0.06 })
}

function chip(label, filter, active) {
  return el('button', { class: 'chip' + (active ? ' active' : ''), dataset: { filter } }, [label])
}

function emptyProjects() {
  return el('div', { class: 'empty-state card card-pad' }, [
    el('span', { class: 'empty-ic' }, [icon('folder', { size: 26 })]),
    el('h3', {}, ['No projects here yet']),
    el('p', { class: 'text-secondary' }, ['Your workspace is ready for its first project.']),
    el('button', { class: 'btn btn-primary', onclick: () => openCreateProject() }, [icon('plus', { size: 15 }), 'Create project'])
  ])
}
