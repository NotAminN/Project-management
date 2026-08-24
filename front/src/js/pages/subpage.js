// pages/subpage.js — dedicated /p/:id pages (Product / Solutions / Resources /
// Company). Reuses the marketing design system and shares the same footer.
import { el, $ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { buildFooter } from '../components/footer.js'
import { pageContent } from '../data/content-map.js'
import { scrollReveal } from '../animations/gsap.js'
import { scrollTo } from '../animations/scroll.js'
import { getTokens } from '../api/api.js'

export function renderSubpage(root, id) {
  const content = pageContent[id]

  if (!content) {
    root.innerHTML = ''
    const fallback = el('div', { class: 'page marketing' }, [
      buildHeader(),
      el('main', { class: 'mk-main', style: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' } }, [
        el('h1', { class: 'font-display', style: { fontSize: '3rem', marginBottom: '16px' } }, ['404']),
        el('p', { class: 'text-secondary' }, ['Page not found.']),
        el('a', { class: 'btn btn-primary', href: '#/', style: { marginTop: '24px' } }, ['Return Home'])
      ]),
      buildSimpleFooter()
    ])
    root.appendChild(fallback)
    return
  }

  // Parse the markdown-ish content into real elements.
  const paragraphs = parseContent(content.content)

  // Specialized blocks driven by content-map fields (honest, themed).
  const blocks = []
  if (content.blocks?.includes('analytics')) blocks.push(analyticsBlock())
  if (content.blocks?.includes('integrations')) blocks.push(integrationsBlock())
  if (content.changelog) blocks.push(changelogBlock(content.changelog))
  if (content.docCards) blocks.push(docGrid(content.docCards))
  if (content.community) blocks.push(communityBlock(content.community))
  if (content.status) blocks.push(statusBlock(content.status))
  if (content.jobs) blocks.push(careersBlock(content.jobs))
  if (content.apiRoot) blocks.push(apiBlock(content.apiRoot))
  if (content.posts) blocks.push(blogBlock(content.posts))
  if (content.contact) blocks.push(contactBlock())
  if (content.brand) blocks.push(brandBlock(content.brand))
  if (content.blocks?.includes('solutions-rich')) blocks.push(solutionsRichBlock(content))

  root.innerHTML = ''
  const page = el('div', { class: 'page marketing subpage' }, [
    buildHeader(),
    el('main', { class: 'mk-main' }, [
      el('section', { class: 'sub-hero sub-reveal' }, [
        // Hero visual (decorative SVG banner)
        content.heroVisual && el('div', { class: 'sub-hero-visual' }, [
          heroVisualSVG(content.heroVisual)
        ]),
        el('div', { class: 'container-narrow text-center sub-hero-inner' }, [
          el('div', { class: 'sub-hero-ic' }, [icon(content.icon || 'star', { size: 36 })]),
          el('h1', { class: 'sub-title' }, [content.title]),
          el('p', { class: 'sub-subtitle' }, [content.subtitle])
        ])
      ]),
      el('section', { class: 'sub-content sub-reveal' }, [
        el('div', { class: 'container-narrow' }, [
          ...paragraphs,
          ...blocks
        ])
      ]),
      el('section', { class: 'sub-cta sub-reveal text-center' }, [
        el('div', { class: 'container-narrow' }, [
          el('h2', { class: 'font-display', style: { fontSize: '2.2rem', marginBottom: '24px' } }, ['Ready to get started?']),
          el('div', { class: 'sub-cta-actions' }, [
            el('a', { class: 'btn btn-primary btn-lg', href: '#/register' }, ['Try Northwind free']),
            el('a', { class: 'btn btn-soft btn-lg', href: '#/contact' }, ['Contact sales'])
          ])
        ])
      ])
    ]),
    buildFooter()
  ])

  root.appendChild(page)

  // Sticky header border on scroll
  const header = page.querySelector('.sub-header')
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 12)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  window.scrollTo(0, 0)

  // Reveal sections
  page.querySelectorAll('.sub-reveal').forEach((s) => scrollReveal(s, { y: 30 }))
}

/* ---------------- Content parsing ---------------- */
function parseContent(text) {
  return text.split('\n\n').map((p) => {
    const html = p.trim()
    if (!html) return null
    if (html.startsWith('- ')) {
      const items = html.split('\n').filter((l) => l.trim().startsWith('- ')).map((l) =>
        el('li', { html: inline(l.trim().substring(2)) })
      )
      return el('ul', { class: 'mk-plan-feats', style: { marginBottom: '24px' } }, items)
    }
    return el('p', { style: { marginBottom: '24px', lineHeight: '1.7', fontSize: '1.06rem' }, html: inline(html) })
  }).filter(Boolean)
}

// Inline: **bold**, `code`, and escape the rest (text is product copy, not user input).
function inline(s) {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:0.9em;background:var(--color-beige);padding:1px 6px;border-radius:var(--radius-xs);color:var(--color-espresso)">$1</code>')
}

/* ---------------- Header / footer ---------------- */
function buildHeader() {
  const isLoggedIn = !!getTokens().access
  return el('header', { class: 'sub-header' }, [
    el('div', { class: 'container-wide sub-header-inner' }, [
      el('a', { class: 'brand link-clear', href: '#/', 'aria-label': 'Northwind home' }, [
        icon('logo', { size: 22 }), el('span', { class: 'brand-name' }, ['Northwind'])
      ]),
      el('nav', { class: 'sub-nav', 'aria-label': 'Primary' }, [
        subLink('Product', '#features'),
        subLink('Solutions', '#bento'),
        subLink('Pricing', '#pricing'),
        subLink('About', '#about')
      ]),
      el('div', { class: 'sub-auth' }, [
        el('a', { class: 'btn btn-subtle btn-sm', href: '#/login' }, ['Sign in']),
        el('a', { class: 'btn btn-primary btn-sm', href: isLoggedIn ? '#/app/dashboard' : '#/register' }, [
          isLoggedIn ? 'Go to Workspace' : 'Start free'
        ])
      ])
    ])
  ])
}

function subLink(label, href) {
  return el('a', { class: 'sub-nav-link link-underline', href, onclick: (e) => {
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault()
      scrollTo(href, { offset: -70 })
    }
  }}, [label])
}

function buildSimpleFooter() {
  return el('footer', { class: 'sub-footer' }, [
    el('div', { class: 'container-wide sub-footer-inner' }, [
      el('div', { class: 'brand' }, [icon('logo', { size: 20 }), el('span', { class: 'brand-name' }, ['Northwind'])]),
      el('a', { class: 'btn btn-subtle', href: '#/' }, ['Back to Home'])
    ])
  ])
}

/* ---- Hero visual SVGs ---- */
function heroVisualSVG(key) {
  const svgs = {
    'startup-hero': `
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="60" y="80" width="180" height="240" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="60" y="80" width="180" height="240" rx="16" fill="currentColor" opacity="0.08"/>
        <circle cx="150" cy="130" r="36" stroke="currentColor" stroke-width="2" opacity="0.4"/>
        <path d="M120 160h60M120 190h40M120 220h80" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="300" y="60" width="220" height="120" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="300" y="60" width="220" height="120" rx="16" fill="currentColor" opacity="0.05"/>
        <ellipse cx="410" cy="90" rx="40" ry="18" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M340 140h140M340 160h100" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <rect x="580" y="100" width="160" height="220" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="580" y="100" width="160" height="220" rx="16" fill="currentColor" opacity="0.08"/>
        <path d="M610 140h100M610 170h80M610 200h120M610 230h60" stroke="currentColor" stroke-width="2" opacity="0.25"/>
        <circle cx="720" cy="80" r="60" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <path d="M680 60l40-20 40 20" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <circle cx="120" cy="340" r="24" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
        <path d="M100 340h40M120 320v40" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
      </svg>
    `,
    'agency-hero': `
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="60" y="60" width="200" height="280" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="60" y="60" width="200" height="280" rx="16" fill="currentColor" opacity="0.06"/>
        <circle cx="160" cy="110" r="40" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M100 180h120M100 210h90M100 240h140M100 270h70" stroke="currentColor" stroke-width="2" opacity="0.25"/>
        <rect x="300" y="80" width="200" height="120" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="300" y="80" width="200" height="120" rx="12" fill="currentColor" opacity="0.05"/>
        <path d="M340 120h120M340 150h80" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <rect x="550" y="80" width="180" height="120" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="550" y="80" width="180" height="120" rx="12" fill="currentColor" opacity="0.05"/>
        <path d="M590 120h100M590 150h60" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <rect x="300" y="230" width="430" height="110" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="300" y="230" width="430" height="110" rx="16" fill="currentColor" opacity="0.04"/>
        <path d="M340 260h350M340 290h300M340 320h250" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <rect x="60" y="230" width="200" height="110" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="60" y="230" width="200" height="110" rx="16" fill="currentColor" opacity="0.06"/>
        <circle cx="160" cy="275" r="30" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <path d="M100 315h120M100 335h80" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <ellipse cx="720" cy="340" rx="80" ry="40" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
      </svg>
    `,
    'software-hero': `
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="60" width="240" height="280" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="40" y="60" width="240" height="280" rx="12" fill="currentColor" opacity="0.05"/>
        <rect x="60" y="80" width="60" height="20" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
        <path d="M70 120h180M70 150h140M70 180h200M70 210h160M70 240h100M70 270h120" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <rect x="320" y="60" width="200" height="160" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="320" y="60" width="200" height="160" rx="12" fill="currentColor" opacity="0.05"/>
        <rect x="340" y="90" width="40" height="40" rx="8" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M350 110h20M360 100v20" stroke="currentColor" stroke-width="2" opacity="0.4"/>
        <rect x="400" y="90" width="40" height="40" rx="8" stroke="currentColor" stroke-width="2" opacity="0.25"/>
        <path d="M410 110h20M420 100v20" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="340" y="150" width="40" height="40" rx="8" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <rect x="400" y="150" width="40" height="40" rx="8" stroke="currentColor" stroke-width="2" opacity="0.15"/>
        <rect x="560" y="60" width="180" height="280" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="560" y="60" width="180" height="280" rx="12" fill="currentColor" opacity="0.05"/>
        <path d="M580 100h140M580 130h120M580 160h150M580 190h100M580 220h130M580 250h80M580 280h110" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <circle cx="720" cy="80" r="50" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
        <path d="M690 50l30-30 30 30" stroke="currentColor" stroke-width="2" opacity="0.15"/>
        <path d="M200 360l100-20 100 20 100-20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.15"/>
      </svg>
    `,
    'creative-hero': `
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="50" width="320" height="300" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="40" y="50" width="320" height="300" rx="16" fill="currentColor" opacity="0.04"/>
        <ellipse cx="200" cy="130" rx="100" ry="60" stroke="currentColor" stroke-width="2" opacity="0.25"/>
        <ellipse cx="200" cy="130" rx="80" ry="45" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <circle cx="200" cy="130" r="30" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <path d="M140 100l30 30M260 100l-30 30M200 170l0 40" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="400" y="80" width="360" height="140" rx="16" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="400" y="80" width="360" height="140" rx="16" fill="currentColor" opacity="0.04"/>
        <rect x="430" y="110" width="120" height="80" rx="8" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <rect x="580" y="110" width="120" height="80" rx="8" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <path d="M450 130h80M450 155h60" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <path d="M600 130h60M600 155h40" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
        <rect x="400" y="260" width="160" height="100" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="400" y="260" width="160" height="100" rx="12" fill="currentColor" opacity="0.05"/>
        <circle cx="480" cy="310" r="28" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <path d="M452 310h56M480 282v56" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="600" y="260" width="160" height="100" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="600" y="260" width="160" height="100" rx="12" fill="currentColor" opacity="0.05"/>
        <path d="M620 290h120M620 320h80M620 350h100" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <path d="M100 380q100-60 300-30 100 30 200 0" stroke="currentColor" stroke-width="1.5" stroke-dasharray="10 6" opacity="0.12" fill="none"/>
      </svg>
    `,
    'enterprise-hero': `
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="60" y="40" width="220" height="320" rx="20" stroke="currentColor" stroke-width="2.5" opacity="0.4"/>
        <rect x="60" y="40" width="220" height="320" rx="20" fill="currentColor" opacity="0.06"/>
        <rect x="90" y="70" width="160" height="60" rx="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M110 95h120M110 115h80" stroke="currentColor" stroke-width="2" opacity="0.25"/>
        <rect x="90" y="160" width="70" height="200" rx="8" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <rect x="170" y="160" width="70" height="160" rx="8" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <rect x="90" y="380" width="160" height="20" rx="6" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
        <rect x="320" y="60" width="420" height="280" rx="20" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <rect x="320" y="60" width="420" height="280" rx="20" fill="currentColor" opacity="0.04"/>
        <rect x="350" y="90" width="160" height="50" rx="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M370 110h120M370 125h80" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <rect x="350" y="170" width="360" height="140" rx="12" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <rect x="350" y="170" width="360" height="140" rx="12" fill="currentColor" opacity="0.03"/>
        <path d="M370 190h320M370 220h280M370 250h240M370 280h200" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <circle cx="680" cy="80" r="55" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <circle cx="680" cy="80" r="35" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <path d="M645 80l35-35 35 35" stroke="currentColor" stroke-width="2" opacity="0.25"/>
        <path d="M680 45v70M645 80h70" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <rect x="350" y="330" width="360" height="40" rx="8" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <path d="M370 340h100M490 340h100M610 340h80" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
        <path d="M100 380q150-80 400-20 150 20 300 0" stroke="currentColor" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.1" fill="none"/>
      </svg>
    `
  }
  const ns = 'http://www.w3.org/2000/svg'
  const wrapper = document.createElementNS(ns, 'svg')
  wrapper.setAttribute('viewBox', '0 0 800 400')
  wrapper.setAttribute('width', '100%')
  wrapper.setAttribute('height', '100%')
  wrapper.setAttribute('fill', 'none')
  wrapper.setAttribute('stroke', 'currentColor')
  wrapper.setAttribute('stroke-width', '1.5')
  wrapper.setAttribute('stroke-linecap', 'round')
  wrapper.setAttribute('stroke-linejoin', 'round')
  wrapper.setAttribute('aria-hidden', 'true')
  wrapper.innerHTML = svgs[key] || ''
  return wrapper
}

/* ---------------- Specialized themed blocks ---------------- */
function analyticsBlock() {
  return el('div', { class: 'kpi-grid' }, [
    kpiCard('Team velocity', '+12%', '84 pts', 'var(--color-gold)'),
    kpiCard('Task completion', '+5%', '92%', 'var(--color-success)'),
    kpiCard('Active projects', '-2', '14', 'var(--color-blue)')
  ])
}

function kpiCard(label, diff, value, color) {
  return el('div', { class: 'kpi-card card card-pad' }, [
    el('span', { class: 'kpi-label' }, [label]),
    el('span', { class: 'kpi-value' }, [value]),
    el('span', { class: 'kpi-diff', style: { color } }, [diff])
  ])
}

function integrationsBlock() {
  const items = [
    { name: 'Calendar', desc: 'Two-way deadline sync', icon: 'calendar' },
    { name: 'Communication', desc: 'Notifications in-channel', icon: 'comment' },
    { name: 'Version control', desc: 'Link tasks to branches & PRs', icon: 'code' },
    { name: 'Cloud storage', desc: 'Attach files from your drive', icon: 'folder' },
    { name: 'Webhooks', desc: 'Automate your own flows', icon: 'zap' },
    { name: 'REST API', desc: 'Build anything on top', icon: 'terminal' }
  ]
  return el('div', {}, [
    el('div', { class: 'integration-grid' }, items.map((it) =>
      el('div', { class: 'integration-card card card-pad' }, [
        el('div', { class: 'integration-logo' }, [icon(it.icon, { size: 24 })]),
        el('strong', {}, [it.name]),
        el('span', {}, [it.desc]),
        el('span', { class: 'integration-status' }, ['Planned'])
      ])
    )),
    el('p', { class: 'status-note' }, [
      'Connectors are on the roadmap. Until they ship, use the REST API above to move data in and out of Northwind.'
    ])
  ])
}

function changelogBlock(items) {
  return el('div', { class: 'changelog-list' }, items.map((c) =>
    el('div', { class: 'changelog-item card card-pad' }, [
      el('div', { class: 'changelog-head' }, [
        el('span', { class: 'changelog-ver' }, [c.version]),
        el('span', { class: 'changelog-date' }, [c.date])
      ]),
      el('ul', { class: 'changelog-changes' }, [
        el('li', {}, [icon('check', { size: 15 }), [
          el('span', { class: 'changelog-kind ' + c.kind }, [c.kind]),
          el('strong', { style: { marginRight: '6px' } }, [c.title + '.']),
          c.body
        ].filter(Boolean)])
      ])
    ])
  ))
}

function docGrid(cards) {
  return el('div', {}, [
    el('div', { class: 'doc-grid' }, cards.map((c) =>
      el('div', { class: 'doc-card card card-pad' }, [
        el('div', { class: 'ic' }, [icon(c.icon, { size: 20 })]),
        el('h3', {}, [c.title]),
        el('p', { class: 'text-secondary' }, [c.body]),
        el('span', { class: 'doc-link' }, ['Read guide', icon('arrowRight', { size: 14 })])
      ])
    )),
    el('p', { class: 'doc-note' }, [
      'Guides are being written. Each card maps to a real area of the product; full articles arrive as the docs site grows.'
    ])
  ])
}

function communityBlock(cards) {
  return el('div', {}, [
    el('div', { class: 'community-grid' }, cards.map((c) =>
      el('div', { class: 'community-card card card-pad' }, [
        el('div', { class: 'ic' }, [icon(c.icon, { size: 20 })]),
        el('h3', {}, [c.title]),
        el('p', { class: 'text-secondary' }, [c.body])
      ])
    )),
    el('p', { class: 'community-note' }, [
      'The community space is planned. These are the areas we intend to host — nothing here is a live forum yet.'
    ])
  ])
}

function statusBlock(items) {
  return el('div', {}, [
    el('div', { class: 'status-list' }, items.map((s) =>
      el('div', { class: 'status-item card card-pad' }, [
        el('span', { class: 'status-name' }, [s.name]),
        el('span', { class: 'status-badge ' + s.state }, [
          s.state === 'notice' ? icon('info', { size: 13 }) : el('span', { class: 'dot' }),
          s.label
        ])
      ])
    )),
    el('p', { class: 'status-note' }, [
      'This build runs Northwind locally, so these services are not yet tracked by a public monitor. When the status feed ships, this page will show live data.'
    ])
  ])
}

function careersBlock(jobs) {
  return el('div', {}, [
    el('div', { class: 'careers-list' }, jobs.map((j) =>
      el('div', { class: 'job-item card card-pad' }, [
        el('div', {}, [
          el('div', { class: 'job-title' }, [j.title, el('span', { class: 'job-tag' }, ['Planned'])]),
          el('div', { class: 'job-meta' }, [`${j.dept} • ${j.location}`])
        ]),
        el('button', { class: 'btn btn-ghost', onclick: () => { location.hash = '#/contact' } }, ['Notify me'])
      ])
    )),
    el('p', { class: 'careers-note' }, [
      'These are the kinds of roles we hire for. No positions are open in this demo build — check back or reach out via Contact and we’ll let you know when one goes live.'
    ])
  ])
}

function apiBlock(root) {
  const lines = [
    { c: 'api-comment', t: '// Obtain a JWT (access + refresh)' },
    { m: 'POST', p: root + '/auth/login/' },
    { c: 'api-comment', t: '// List projects (authenticated)' },
    { m: 'GET', p: root + '/projects/' },
    { c: 'api-comment', t: '// Create a task' },
    { m: 'POST', p: root + '/tasks/' },
    { c: 'api-comment', t: '// Read the activity feed' },
    { m: 'GET', p: root + '/notifications/' }
  ]
  return el('div', {}, [
    el('div', { class: 'api-docs' }, [
      el('div', { class: 'api-docs-inner' }, lines.map((l) => {
        if (l.c) return el('div', { class: l.c }, [l.t])
        return el('div', {}, [
          el('span', { class: 'api-method' }, [l.m]), ' ',
          el('span', { class: 'api-path' }, [l.p])
        ])
      }))
    ]),
    el('p', { class: 'api-note', html: inline('These endpoints are served by the live Django backend at `' + root + '`. This demo frontend talks to them directly — see the source for exact request shapes.') })
  ])
}

function blogBlock(posts) {
  return el('div', { class: 'blog-grid' }, posts.map((p) =>
    el('article', { class: 'blog-card card card-pad' }, [
      el('span', { class: 'blog-tag' }, [p.tag]),
      el('h3', {}, [p.title]),
      el('p', { class: 'text-secondary' }, [p.excerpt]),
      el('span', { class: 'blog-meta text-secondary' }, [p.date])
    ])
  ))
}

function contactBlock() {
  const form = el('form', {
    class: 'contact-form',
    novalidate: true,
    onsubmit: (e) => {
      e.preventDefault()
      const name = form.querySelector('[name="name"]')
      const email = form.querySelector('[name="email"]')
      const message = form.querySelector('[name="message"]')
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        if (!name.value.trim()) name.classList.add('field-invalid')
        if (!emailOk) email.classList.add('field-invalid')
        if (!message.value.trim()) message.classList.add('field-invalid')
        return
      }
      form.replaceWith(el('div', { class: 'contact-success' }, [
        el('strong', {}, ['Thanks for reaching out.']),
        el('p', { style: { margin: '6px 0 0' } }, ['This is a demo build, so your message was not sent anywhere — but in production it would land with our team, and we’d reply shortly.'])
      ]))
    }
  }, [
    el('div', { class: 'contact-field' }, [
      el('label', { for: 'cf-name' }, ['Name']),
      el('input', { class: 'field', name: 'name', id: 'cf-name', type: 'text', placeholder: 'Your name', required: true, oninput: (e) => e.target.classList.remove('field-invalid') })
    ]),
    el('div', { class: 'contact-field' }, [
      el('label', { for: 'cf-email' }, ['Email']),
      el('input', { class: 'field', name: 'email', id: 'cf-email', type: 'email', placeholder: 'you@company.com', required: true, oninput: (e) => e.target.classList.remove('field-invalid') })
    ]),
    el('div', { class: 'contact-field' }, [
      el('label', { for: 'cf-message' }, ['Message']),
      el('textarea', { class: 'field', name: 'message', id: 'cf-message', rows: '5', placeholder: 'How can we help?', required: true, oninput: (e) => e.target.classList.remove('field-invalid') })
    ]),
    el('button', { class: 'btn btn-primary', type: 'submit' }, ['Send message'])
  ])

  return el('div', {}, [
    form,
    el('p', { class: 'contact-note' }, [
      'No backend form handler is wired in this demo, so submissions stay in your browser. In production this posts to our support inbox.'
    ])
  ])
}

function brandBlock(items) {
  return el('div', { class: 'doc-grid' }, items.map((it) =>
    el('div', { class: 'doc-card card card-pad' }, [
      el('h3', {}, [it.label]),
      el('p', { class: 'text-secondary' }, [it.value])
    ])
  ))
}

/* ---------------- Rich Solutions Pages ---------------- */
function solutionsRichBlock(content) {
  const fragments = []

  // Problem / Solution statement
  if (content.problemStatement || content.solutionStatement) {
    fragments.push(el('section', { class: 'sol-problem-solution sub-reveal' }, [
      el('div', { class: 'container-narrow' }, [
        el('div', { class: 'sol-ps-grid' }, [
          content.problemStatement && el('div', { class: 'sol-ps-card card card-pad' }, [
            el('div', { class: 'sol-ps-icon' }, [icon('alertTriangle', { size: 24 })]),
            el('h3', { class: 'sol-ps-title' }, ['The Problem']),
            el('p', { class: 'text-secondary' }, [content.problemStatement])
          ]),
          content.solutionStatement && el('div', { class: 'sol-ps-card card card-pad' }, [
            el('div', { class: 'sol-ps-icon' }, [icon('checkCircle', { size: 24 })]),
            el('h3', { class: 'sol-ps-title' }, ['Our Approach']),
            el('p', { class: 'text-secondary' }, [content.solutionStatement])
          ])
        ])
      ])
    ]))
  }

  // Features grid
  if (content.features?.length) {
    fragments.push(el('section', { class: 'sol-features sub-reveal' }, [
      el('div', { class: 'container-narrow' }, [
        el('div', { class: 'sol-section-head' }, [
          el('span', { class: 'section-eyebrow' }, ['Features']),
          el('h2', { class: 'font-display' }, ['Built for how you work'])
        ]),
        el('div', { class: 'sol-feat-grid' }, content.features.map((f, i) =>
          el('article', { class: 'sol-feat-card card card-pad card-hover', style: { transitionDelay: `${i * 60}ms` } }, [
            el('div', { class: 'sol-feat-icon' }, [icon(f.icon, { size: 24 })]),
            el('h3', { class: 'sol-feat-title' }, [f.title]),
            el('p', { class: 'sol-feat-desc text-secondary' }, [f.desc])
          ])
        ))
      ])
    ]))
  }

  // Use cases
  if (content.useCases?.length) {
    fragments.push(el('section', { class: 'sol-usecases sub-reveal' }, [
      el('div', { class: 'container-narrow' }, [
        el('div', { class: 'sol-section-head' }, [
          el('span', { class: 'section-eyebrow' }, ['Use cases']),
          el('h2', { class: 'font-display' }, ['Real teams, real workflows'])
        ]),
        el('div', { class: 'sol-uc-grid' }, content.useCases.map((uc, i) =>
          el('div', { class: 'sol-uc-card card card-pad card-hover', style: { transitionDelay: `${i * 60}ms` } }, [
            el('h3', { class: 'sol-uc-title' }, [uc.title]),
            el('p', { class: 'sol-uc-desc text-secondary' }, [uc.desc])
          ])
        ))
      ])
    ]))
  }

  // Testimonial
  if (content.testimonial) {
    const t = content.testimonial
    fragments.push(el('section', { class: 'sol-testimonial sub-reveal' }, [
      el('div', { class: 'container-narrow' }, [
        el('div', { class: 'sol-testimonial-card card card-pad' }, [
          el('div', { class: 'sol-testimonial-quote' }, [t.quote]),
          el('div', { class: 'sol-testimonial-author' }, [
            el('div', { class: 'sol-testimonial-avatar' }, [icon('user', { size: 36 })]),
            el('div', {}, [
              el('div', { class: 'sol-testimonial-name' }, [t.author]),
              el('div', { class: 'sol-testimonial-role text-secondary' }, [t.role])
            ])
          ])
        ])
      ])
    ]))
  }

  // Page-specific CTA
  if (content.cta) {
    fragments.push(el('section', { class: 'sol-cta sub-reveal text-center' }, [
      el('div', { class: 'container-narrow' }, [
        el('h2', { class: 'font-display', style: { fontSize: '2.2rem', marginBottom: '24px' } }, ['Ready to get started?']),
        el('div', { class: 'sub-cta-actions' }, [
          content.cta.primary && el('a', { class: 'btn btn-primary btn-lg', href: content.cta.primary.href }, [content.cta.primary.label]),
          content.cta.secondary && el('a', { class: 'btn btn-soft btn-lg', href: content.cta.secondary.href }, [content.cta.secondary.label])
        ].filter(Boolean))
      ])
    ]))
  }

  return el('div', {}, fragments.filter(Boolean))
}
