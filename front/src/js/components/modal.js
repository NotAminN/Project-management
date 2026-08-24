// components/modal.js — reusable modal (center dialog + side sheet).
// Handles focus trap, ESC, click-outside, scroll lock, and GSAP animation.
import { el, $ } from '../utils/dom.js'
import { icon } from './icons.js'
import { gsap, prefersReducedMotion } from '../animations/gsap.js'
import { stopScroll, startScroll } from '../animations/scroll.js'

let activeModal = null

export function openModal({ title, content, variant = 'center', width, onClose, footer, subtitle } = {}) {
  closeModal(true)

  const backdrop = el('div', { class: 'modal-backdrop', 'aria-hidden': 'false' })
  const modal = el('div', {
    class: `modal modal-${variant}`,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title || 'Dialog'
  })
  if (width) modal.style.width = width

  const header = el('div', { class: 'modal-header' }, [
    el('div', {}, [
      title ? el('h3', { class: 'font-display', style: { fontSize: '20px' } }, [title]) : null,
      subtitle ? el('p', { class: 'text-secondary', style: { fontSize: '13px', marginTop: '2px' } }, [subtitle]) : null
    ].filter(Boolean)),
    el('button', {
      class: 'btn btn-icon btn-ghost has-tip',
      'aria-label': 'Close',
      onclick: () => closeModal()
    }, [icon('close', { size: 18 }), el('span', { class: 'tooltip' }, ['Esc'])])
  ])

  const body = el('div', { class: 'modal-body' }, [content])

  const children = [header, body]
  if (footer) children.push(el('div', { class: 'modal-footer' }, [footer]))
  modal.append(...children)

  backdrop.append(modal)
  document.body.appendChild(backdrop)
  document.body.classList.add('modal-open')

  // Focus management
  const focusables = () =>
    Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((n) => !n.disabled)
  const focusTimer = setTimeout(() => {
    const first = focusables()[0]
    if (first && typeof first.focus === 'function') {
      try { first.focus() } catch (e) {}
    }
  }, 60)

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal() }
    if (e.key === 'Tab') {
      const f = focusables()
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) closeModal() })
  document.addEventListener('keydown', onKey)

  activeModal = {
    close: () => closeModal(),
    el: modal,
    backdrop,
    cleanup: () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
      startScroll()
    }
  }

  if (prefersReducedMotion) {
    backdrop.classList.add('open')
  } else {
    requestAnimationFrame(() => backdrop.classList.add('open'))
    stopScroll()
  }

  return activeModal
}

export function closeModal(immediate = false) {
  if (!activeModal) return
  const { backdrop, cleanup } = activeModal
  activeModal = null
  cleanup()
  if (prefersReducedMotion || immediate) {
    backdrop.remove()
    return
  }
  backdrop.classList.remove('open')
  setTimeout(() => backdrop.remove(), 280)
}

export function isModalOpen() {
  return !!activeModal
}
