// components/toast.js — reusable toast notifications with GSAP.
import { el } from '../utils/dom.js'
import { icon } from './icons.js'
import { gsap, prefersReducedMotion } from '../animations/gsap.js'

let wrap
function ensureWrap() {
  if (!wrap) {
    wrap = el('div', { class: 'toast-wrap', 'aria-live': 'polite', role: 'status' })
    document.body.appendChild(wrap)
  }
  return wrap
}

export function toast(message, opts = {}) {
  const { type = 'default', duration = 2600, iconName = 'check' } = opts
  const root = ensureWrap()
  const iconMap = { success: 'check', error: 'close', info: 'info', default: 'sparkle' }
  const node = el('div', { class: 'toast', role: 'alert' }, [
    el('span', { class: 'toast-icon' }, [icon(iconMap[type] || iconName, { size: 16 })]),
    el('span', {}, [message])
  ])
  root.appendChild(node)

  if (prefersReducedMotion) {
    setTimeout(() => node.remove(), duration)
    return
  }
  gsap.fromTo(node, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
  gsap.to(node, {
    y: 12, opacity: 0, duration: 0.3, ease: 'power2.in', delay: duration / 1000,
    onComplete: () => node.remove()
  })
}
