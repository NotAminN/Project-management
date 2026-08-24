// scroll.js — Lenis smooth scroll, synced with GSAP ScrollTrigger and resize.
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap.js'

let lenis = null

export function initSmoothScroll() {
  // Respect reduced motion: skip Lenis, keep native scroll.
  if (prefersReducedMotion) return null

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6
  })

  // Drive Lenis from GSAP's ticker for perfect sync.
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  // Keep ScrollTrigger in sync.
  lenis.on('scroll', ScrollTrigger.update)

  return lenis
}

export function getLenis() {
  return lenis
}

export function scrollTo(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -80, duration: 1.0, ...opts })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}

// Refresh ScrollTrigger after content/layout changes (page transitions, async render).
export function refreshScroll() {
  ScrollTrigger.refresh()
}

export function stopScroll() {
  lenis?.stop()
}

export function startScroll() {
  lenis?.start()
}
