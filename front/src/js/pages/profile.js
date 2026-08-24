// pages/profile.js — current user profile & profile editing.
import { el } from '../utils/dom.js'
import { avatar } from '../components/avatar.js'
import { taskRow } from '../components/task-card.js'
import { openTaskModal } from '../components/task-modal.js'
import { toast } from '../components/toast.js'
import { getState, getTasks, getProjects, getCurrentUser } from '../state/app-state.js'
import { userService } from '../services/users.js'

export async function renderProfile(root) {
  root.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">Loading Profile...</div>'
  const me = await userService.getProfile() || getCurrentUser()
  root.innerHTML = ''

  const myTasks = getTasks().filter((t) => (t.assignee === me.id || t.assigned_to === me.id) && t.status !== 'Done').slice(0, 6)
  const myProjects = getProjects()
  const openCount = myTasks.length
  const doneCount = getTasks().filter((t) => (t.assignee === me.id || t.assigned_to === me.id) && t.status === 'Done').length

  const editForm = el('form', { class: 'card card-pad', style: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' } }, [
    el('h3', { style: { marginBottom: '8px' } }, ['Edit Profile Details']),
    el('div', { id: 'prof-err', style: { color: '#b5615e', fontSize: '13px', display: 'none' } }),
    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } }, [
      field('First Name', el('input', { class: 'field', id: 'p-fname', value: me.first_name || '' })),
      field('Last Name', el('input', { class: 'field', id: 'p-lname', value: me.last_name || '' }))
    ]),
    field('Email Address', el('input', { class: 'field', type: 'email', id: 'p-email', value: me.email || '' })),
    field('Username (Read-Only)', el('input', { class: 'field', type: 'text', value: me.username || '', disabled: true })),
    el('button', { type: 'submit', class: 'btn btn-primary', style: { alignSelf: 'flex-start', marginTop: '8px' } }, ['Save Profile Changes'])
  ])

  editForm.onsubmit = async (e) => {
    e.preventDefault()
    const fname = document.getElementById('p-fname').value.trim()
    const lname = document.getElementById('p-lname').value.trim()
    const email = document.getElementById('p-email').value.trim()

    try {
      await userService.updateProfile({ first_name: fname, last_name: lname, email })
      toast('Profile updated successfully', { type: 'success' })
      renderProfile(root)
    } catch (err) {
      toast('Failed to update profile', { type: 'error' })
    }
  }

  const page = el('div', { class: 'page profile' }, [
    el('div', { class: 'profile-hero card card-pad' }, [
      avatar(me.id, 72),
      el('div', { class: 'profile-hero-info' }, [
        el('h2', { class: 'font-display profile-name' }, [me.name || me.username]),
        el('span', { class: 'text-secondary' }, [`@${me.username} · ${me.email || 'No email'}`]),
        el('p', { class: 'profile-bio' }, [`Role: ${me.role || 'Member'}`])
      ]),
      el('div', { class: 'profile-stats' }, [
        stat('Open Tasks', openCount),
        stat('Done Tasks', doneCount),
        stat('Projects', myProjects.length)
      ])
    ]),
    el('div', { class: 'profile-grid' }, [
      el('section', { class: 'card card-pad' }, [
        el('div', { class: 'card-head' }, [el('h3', {}, ['My Open Tasks'])]),
        el('div', { class: 'profile-tasks' }, myTasks.length ? myTasks.map((t) => taskRow(t, { onClick: (t) => openTaskModal(t.id) })) : [el('p', { class: 'text-secondary', style: { padding: '12px 0' } }, ['No open tasks assigned to you.'])])
      ]),
      el('aside', { class: 'card card-pad' }, [
        el('div', { class: 'card-head' }, [el('h3', {}, ['Projects'])]),
        el('div', { class: 'profile-projects' }, myProjects.map((p) =>
          el('div', { class: 'profile-project' }, [
            el('span', { class: 'label-dot', style: { background: p.color || '#b99a5b' } }),
            el('span', {}, [p.name || p.title]),
            el('span', { class: 'text-secondary font-mono' }, [(p.progress || 0) + '%'])
          ])
        ))
      ])
    ]),
    editForm
  ])

  root.innerHTML = ''
  root.appendChild(page)
}

function field(label, inputNode) {
  return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
    el('label', { class: 'field-label', style: { fontSize: '12px', fontWeight: 'bold' } }, [label]),
    inputNode
  ])
}

function stat(label, val) {
  return el('div', { class: 'profile-stat' }, [el('span', { class: 'profile-stat-num font-display' }, [String(val)]), el('span', { class: 'text-secondary' }, [label])])
}
