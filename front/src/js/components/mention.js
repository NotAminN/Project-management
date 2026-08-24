// components/mention.js — @mention suggestion dropdown for text inputs.
import { el, $ } from '../utils/dom.js'
import { avatar } from './avatar.js'
import { getUsers } from '../state/app-state.js'

// Attach mention suggestions to a textarea. Shows a dropdown when typing "@".
export function attachMentions(textarea, onSubmit) {
  const users = getUsers()
  let popup = null

  function close() {
    popup?.remove()
    popup = null
  }

  async function handle() {
    const pos = textarea.selectionStart
    const before = textarea.value.slice(0, pos)
    const match = before.match(/@([A-Za-z]*)$/)
    if (!match) return close()
    const q = match[1].toLowerCase()
    const found = users.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 5)
    if (!found.length) return close()

    close()
    popup = el('div', { class: 'mention-pop' }, found.map((u, i) =>
      el('button', {
        class: 'mention-opt' + (i === 0 ? ' active' : ''), 'data-name': u.name, 'data-i': i,
        onmousedown: (e) => { e.preventDefault(); apply(u.name) }
      }, [avatar(u.id, 24), el('span', {}, [u.name]), el('span', { class: 'text-secondary' }, [u.title])])
    ))
    position()
    document.addEventListener('click', outside, { once: true })
  }

  function position() {
    const rect = textarea.getBoundingClientRect()
    popup.style.position = 'fixed'
    popup.style.left = rect.left + 'px'
    popup.style.top = rect.bottom + 6 + 'px'
    popup.style.zIndex = 120
  }

  function apply(name) {
    const pos = textarea.selectionStart
    const before = textarea.value.slice(0, pos)
    const after = textarea.value.slice(pos)
    const next = before.replace(/@([A-Za-z]*)$/, `@${name} `) + after
    textarea.value = next
    close()
    textarea.focus()
  }

  function outside(e) { if (popup && !popup.contains(e.target)) close() }

  textarea.addEventListener('input', handle)
  textarea.addEventListener('keyup', handle)
  return { close }
}

export function mentionSuggestions(q) {
  return getUsers().filter((u) => u.name.toLowerCase().includes((q || '').toLowerCase())).slice(0, 5)
}
