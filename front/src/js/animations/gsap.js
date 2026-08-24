// gsap.js — central GSAP + ScrollTrigger registration + reusable reveal utilities.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Mark document as JS-active so initial hidden states apply only when JS runs.
if (document.documentElement) document.documentElement.classList.add('js')

/**
 * Reveal a single element with a gentle fade + translate.
 */
export function reveal(el, opts = {}) {
  if (!el) return
  if (prefersReducedMotion) {
    el.style.opacity = 1
    el.style.transform = 'none'
    return
  }
  const { y = 26, x = 0, duration = 0.8, delay = 0, ease = 'power3.out' } = opts
  gsap.fromTo(
    el,
    { autoAlpha: 0, y, x },
    { autoAlpha: 1, y: 0, x: 0, duration, delay, ease, clearProps: 'transform' }
  )
}

/**
 * Staggered reveal of a collection of elements.
 */
export function revealStagger(els, opts = {}) {
  const nodes = toArray(els)
  if (!nodes.length) return
  if (prefersReducedMotion) {
    nodes.forEach((n) => { n.style.opacity = 1; n.style.transform = 'none' })
    return
  }
  const { y = 24, duration = 0.7, stagger = 0.08, delay = 0, ease = 'power3.out' } = opts
  gsap.fromTo(
    nodes,
    { autoAlpha: 0, y },
    { autoAlpha: 1, y: 0, duration, stagger, delay, ease, clearProps: 'transform' }
  )
}

/**
 * Scroll-triggered reveal for sections as they enter the viewport.
 */
export function scrollReveal(trigger, opts = {}) {
  const el = toArray(trigger)[0]
  if (!el) return
  if (prefersReducedMotion) {
    el.style.opacity = 1
    el.style.transform = 'none'
    return
  }
  const { y = 30, duration = 0.9, start = 'top 88%' } = opts
  gsap.fromTo(
    el,
    { autoAlpha: 0, y },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start, once: true },
      clearProps: 'transform'
    }
  )
}

/**
 * Scroll-triggered stagger reveal of children.
 */
export function scrollRevealGroup(trigger, childSelector, opts = {}) {
  const el = toArray(trigger)[0]
  if (!el) return
  const nodes = childSelector ? el.querySelectorAll(childSelector) : el.children
  if (!nodes.length) return
  if (prefersReducedMotion) {
    toArray(nodes).forEach((n) => { n.style.opacity = 1; n.style.transform = 'none' })
    return
  }
  const { y = 28, duration = 0.8, stagger = 0.09, start = 'top 85%' } = opts
  gsap.fromTo(
    nodes,
    { autoAlpha: 0, y },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      stagger,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start, once: true },
      clearProps: 'transform'
    }
  )
}

export function toArray(x) {
  if (!x) return []
  if (typeof x === 'string') return Array.from(document.querySelectorAll(x))
  if (x instanceof Element) return [x]
  return Array.from(x)
}

export { gsap, ScrollTrigger }
