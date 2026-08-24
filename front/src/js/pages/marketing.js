// pages/marketing.js — premium editorial landing page (light premium SaaS).
import { el, $, $$ } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { buildFooter } from '../components/footer.js'
import { avatar, avatarStack } from '../components/avatar.js'
import { reveal, revealStagger, scrollRevealGroup, scrollReveal } from '../animations/gsap.js'
import { scrollTo } from '../animations/scroll.js'
import { tasks } from '../data/tasks.js'
import { users } from '../data/users.js'
import { projects } from '../data/projects.js'
import { navigate } from '../router.js'
import { getTokens } from '../api/api.js'
import { authService } from '../services/auth.js'

export function renderMarketing(root, info = {}) {
  root.innerHTML = ''
  // Build the page container.
  const page = el('div', { class: 'marketing grain', id: 'marketing-root' })
  page.appendChild(buildNavbar())
  page.appendChild(buildHero())
  page.appendChild(buildTrustBar())
  page.appendChild(buildFeatureSection())
  page.appendChild(buildBento())
  page.appendChild(buildProductivity())
  page.appendChild(buildWorkflow())
  page.appendChild(buildCollaboration())
  page.appendChild(buildAnalyticsSection())
  page.appendChild(buildPricing())
  page.appendChild(buildFAQ())
  page.appendChild(buildAbout())
  page.appendChild(buildFooter())
  // Scroll-to-top button
  page.appendChild(buildScrollTop())
  root.appendChild(page)

  animateMarketing()
  if (info.scroll) {
    // small delay for layout then scroll to section
    setTimeout(() => scrollTo('#' + info.scroll, { offset: -70 }), 120)
  }
  // Navbar border on scroll + button visibility
  const nav = page.querySelector('.mk-nav')
  const scrollBtn = page.querySelector('.scroll-top-btn')
  const onScroll = () => {
    const y = window.scrollY
    nav?.classList.toggle('scrolled', y > 12)
    if (scrollBtn) scrollBtn.classList.toggle('visible', y > 500)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  window.scrollTo(0, 0)
}

/* ---------------- Navbar ---------------- */
function buildNavbar() {
  const isLoggedIn = !!getTokens().access
  const navActions = isLoggedIn ? [
    el('a', { class: 'btn btn-primary btn-sm', href: '#/app/dashboard' }, ['Go to Workspace']),
    el('button', { class: 'btn btn-subtle btn-sm hide-mobile', onclick: () => { authService.logout(); location.reload() } }, ['Sign out']),
    el('button', { class: 'btn btn-icon btn-ghost mk-menu-btn hide-desktop', 'aria-label': 'Open menu', onclick: openMobileMenu }, [icon('menu', { size: 20 })])
  ] : [
    el('a', { class: 'btn btn-subtle btn-sm hide-mobile', href: '#/login' }, ['Sign in']),
    el('a', { class: 'btn btn-primary btn-sm', href: '#/login' }, ['Start free']),
    el('button', { class: 'btn btn-icon btn-ghost mk-menu-btn hide-desktop', 'aria-label': 'Open menu', onclick: openMobileMenu }, [icon('menu', { size: 20 })])
  ]

  const nav = el('header', { class: 'mk-nav', id: 'top' }, [
    el('div', { class: 'mk-nav-inner container-wide' }, [
      // Brand
      el('a', { class: 'brand', href: '#/', 'aria-label': 'Northwind home' }, [
        icon('logo', { size: 22 }),
        el('span', { class: 'brand-name' }, ['Northwind'])
      ]),
      // Links
      el('nav', { class: 'mk-nav-links hide-mobile', 'aria-label': 'Primary' }, [
        link('Product', '#features'),
        link('Solutions', '#bento'),
        link('Pricing', '#pricing'),
        link('About', '#about')
      ]),
      // Actions
      el('div', { class: 'mk-nav-actions' }, navActions)
    ])
  ])
  return nav
}

function link(label, href) {
  return el('a', { class: 'mk-link link-underline', href, onclick: (e) => {
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault()
      scrollTo(href, { offset: -70 })
    }
  }}, [label])
}

function openMobileMenu() {
  let drawer = $('#mk-drawer')
  if (!drawer) {
    drawer = el('div', { class: 'drawer', id: 'mk-drawer' }, [
      el('div', { class: 'drawer-scrim', onclick: () => drawer.classList.remove('open') }),
      el('div', { class: 'drawer-panel', role: 'dialog', 'aria-label': 'Menu' }, [
        el('div', { class: 'drawer-head' }, [
          el('div', { class: 'brand' }, [icon('logo', { size: 20 }), el('span', { class: 'brand-name' }, ['Northwind'])]),
          el('button', { class: 'btn btn-icon btn-ghost', onclick: () => drawer.classList.remove('open') }, [icon('close', { size: 18 })])
        ]),
        el('nav', { class: 'drawer-links' }, [
          link('Product', '#features'), link('Solutions', '#bento'),
          link('Pricing', '#pricing'), link('About', '#about')
        ].map((a) => { a.addEventListener('click', () => drawer.classList.remove('open')); a.classList.add('drawer-link'); return a })),
        el('div', { class: 'drawer-actions' }, [
          el('a', { class: 'btn btn-soft btn-block', href: '#/login' }, ['Sign in']),
          el('a', { class: 'btn btn-primary btn-block', href: '#/login' }, ['Start free'])
        ])
      ])
    ])
    document.body.appendChild(drawer)
  }
  requestAnimationFrame(() => drawer.classList.add('open'))
}

/* ---------------- Hero ---------------- */
function buildHero() {
  return el('section', { class: 'mk-hero' }, [
    el('div', { class: 'mk-hero-bg', 'aria-hidden': 'true' }, [
      el('span', { class: 'hero-orb hero-orb-1' }),
      el('span', { class: 'hero-orb hero-orb-2' }),
      el('span', { class: 'hero-line' })
    ]),
    el('div', { class: 'mk-hero-inner container-wide' }, [
      el('div', { class: 'mk-hero-copy' }, [
        el('span', { class: 'hero-label reveal-up' }, [
          el('span', { class: 'label-dot', style: { background: 'var(--color-gold)' } }),
          'Project management, refined'
        ]),
        el('h1', { class: 'mk-hero-title display-fluid reveal-up' }, [
          'Turn complex projects into ',
          el('span', { class: 'hero-italic' }, ['clear progress.'])
        ]),
        el('p', { class: 'mk-hero-sub lead-fluid reveal-up' }, [
          'Northwind helps modern teams plan projects, align on priorities, and move every idea from first draft to final delivery — in one beautifully focused workspace.'
        ]),
        el('div', { class: 'mk-hero-cta reveal-up' }, [
          el('a', { class: 'btn btn-primary btn-lg', href: getTokens().access ? '#/app/dashboard' : '#/login' }, [
            getTokens().access ? 'Go to Workspace' : 'Start for free', icon('arrowRight', { size: 16 })
          ]),
          el('a', { class: 'btn btn-ghost btn-lg', href: '#features' }, ['Explore the product'])
        ]),
        el('p', { class: 'mk-hero-trust reveal-up' }, [
          el('span', { class: 'hero-avatars' }, [avatarStack(users.slice(0, 4).map((u) => u.id), 26, 4)]),
          'Built for teams who care about calm, focused work.'
        ])
      ]),
      el('div', { class: 'mk-hero-visual reveal-scale' }, [buildHeroPreview()])
    ])
  ])
}

function buildHeroPreview() {
  const p = projects[0]
  const card = el('div', { class: 'hero-preview card-hover card' }, [
    // top bar
    el('div', { class: 'hp-bar' }, [
      el('div', { class: 'hp-dots' }, [el('span'), el('span'), el('span')]),
      el('div', { class: 'hp-url' }, ['app.northwind.io']),
      el('span', { class: 'hp-live' }, [el('span', { class: 'pulse' }), 'Live'])
    ]),
    el('div', { class: 'hp-body' }, [
      // sidebar
      el('aside', { class: 'hp-side' }, [
        el('div', { class: 'hp-ws' }, [icon('compass', { size: 16 }), 'Amin Studio']),
        ...['Dashboard', 'Projects', 'Calendar', 'Team', 'Analytics'].map((t, i) =>
          el('div', { class: 'hp-navitem' + (i === 0 ? ' active' : '') }, [
            icon(['home', 'folder', 'calendar', 'team', 'analytics'][i], { size: 14 }), t
          ])
        )
      ]),
      // main
      el('div', { class: 'hp-main' }, [
        el('div', { class: 'hp-greet' }, ['Good morning, Amin.']),
        el('div', { class: 'hp-sub' }, ["Your team is 78% on track this week."]),
        el('div', { class: 'hp-stats' }, [
          hpStat('Active', '4', 'projects'),
          hpStat('My tasks', '12', 'today'),
          hpStat('Done', '38', 'this week'),
          hpStat('Overdue', '2', 'review')
        ]),
        el('div', { class: 'hp-proj' }, [
          el('div', { class: 'hp-proj-head' }, [el('span', {}, [p.name]), el('span', { class: 'hp-proj-pct' }, [p.progress + '%'])]),
          el('div', { class: 'progress' }, [el('div', { class: 'progress-bar', style: { width: p.progress + '%' } })]),
          el('div', { class: 'hp-proj-meta' }, [
            avatarStack(p.memberIds, 22, 4),
            el('span', { class: 'hp-due' }, [icon('clock', { size: 13 }), 'Due in 21 days'])
          ])
        ]),
        el('div', { class: 'hp-tasks' }, [
          hpTask(tasks[1]),
          hpTask(tasks[0]),
          hpTask(tasks[4])
        ])
      ])
    ])
  ])
  return card
}

function hpStat(label, num, sub) {
  return el('div', { class: 'hp-stat' }, [
    el('span', { class: 'hp-stat-label' }, [label]),
    el('span', { class: 'hp-stat-num' }, [num]),
    el('span', { class: 'hp-stat-sub' }, [sub])
  ])
}

function hpTask(t) {
  const colors = { High: '#b99a5b', Urgent: '#b5615e', Medium: '#7186a3', Low: '#a39d93' }
  return el('div', { class: 'hp-task' }, [
    el('span', { class: 'hp-task-dot', style: { background: colors[t.priority] } }),
    el('span', { class: 'hp-task-title' }, [t.title]),
    el('span', { class: 'hp-task-code font-mono' }, [t.code])
  ])
}

/* ---------------- Trust bar ---------------- */
function buildTrustBar() {
  const items = ['Plans that hold up', 'Quiet by default', 'Real-time collaboration', 'Privacy-respecting']
  return el('section', { class: 'mk-trust' }, [
    el('div', { class: 'container-wide mk-trust-inner' }, [
      el('span', { class: 'mk-trust-label' }, ['Designed for the way modern teams actually work']),
      el('div', { class: 'mk-trust-row' }, items.map((i) =>
        el('span', { class: 'mk-trust-item' }, [icon('check', { size: 15 }), i])
      ))
    ])
  ])
}

/* ---------------- Features ---------------- */
function buildFeatureSection() {
  const feats = [
    { icon: 'target', title: 'Project clarity', body: 'Every project has a clear status, health, and progress — so nothing hides in a spreadsheet.', wide: true },
    { icon: 'task', title: 'Task flow', body: 'Capture, organize, and move tasks through a calm Kanban or a focused list.' },
    { icon: 'team', title: 'Team alignment', body: 'Assign, mention, and comment. Keep context where the work happens.' },
    { icon: 'analytics', title: 'Quiet analytics', body: 'Understand workload and momentum without a noisy dashboard.' },
    { icon: 'zap', title: 'Automation', body: 'Recurring tasks and smart defaults that remove busywork.' },
    { icon: 'calendar', title: 'Calendar & timeline', body: 'See deadlines and dependencies in one elegant view.' }
  ]
  return el('section', { class: 'mk-section', id: 'features' }, [
    el('div', { class: 'container-wide' }, [
      sectionHead('Everything your team needs', 'A workspace that feels less like software and more like a well-run studio.', 'Features'),
      el('div', { class: 'mk-feat-grid' }, feats.map(featCard))
    ])
  ])
}

function featCard(f) {
  return el('article', { class: 'mk-feat card card-pad card-hover' + (f.wide ? ' mk-feat-wide' : '') }, [
    el('span', { class: 'mk-feat-icon' }, [icon(f.icon, { size: 22 })]),
    el('h3', { class: 'mk-feat-title' }, [f.title]),
    el('p', { class: 'mk-feat-body text-secondary' }, [f.body])
  ])
}

/* ---------------- Bento ---------------- */
function buildBento() {
  const cells = [
    {
      big: true, title: 'One calm workspace', body: 'Projects, tasks, team, and analytics living together — not scattered across tabs.',
      visual: 'bentoBig'
    },
    { title: 'Tasks', icon: 'task', body: 'Capture and move work with a single gesture.' },
    { title: 'Calendar', icon: 'calendar', body: 'Deadlines and milestones, at a glance.' },
    { title: 'Analytics', icon: 'analytics', body: 'Momentum without the noise.' },
    { title: 'Team', icon: 'team', body: 'See who is doing what, kindly.' },
    { title: 'Activity', icon: 'activity', body: 'A quiet timeline of progress.' }
  ]
  return el('section', { class: 'mk-section mk-section-alt', id: 'bento' }, [
    el('div', { class: 'container-wide' }, [
      sectionHead('Made of considered parts', 'An interface built from a small set of calm, purposeful surfaces.', 'Solutions'),
      el('div', { class: 'mk-bento' }, cells.map(bentoCell))
    ])
  ])
}

function bentoCell(c) {
  if (c.big) {
    return el('div', { class: 'mk-bento-cell mk-bento-big card card-pad' }, [
      el('div', { class: 'bento-big-copy' }, [
        el('h3', { class: 'font-display', style: { fontSize: '26px' } }, [c.title]),
        el('p', { class: 'text-secondary', style: { marginTop: '8px', maxWidth: '340px' } }, [c.body])
      ]),
      el('div', { class: 'bento-big-visual' }, [bentoMiniBoard()])
    ])
  }
  return el('div', { class: 'mk-bento-cell card card-pad card-hover' }, [
    el('span', { class: 'mk-feat-icon sm' }, [icon(c.icon, { size: 18 })]),
    el('h3', { class: 'mk-feat-title', style: { fontSize: '16px' } }, [c.title]),
    el('p', { class: 'mk-feat-body text-secondary', style: { fontSize: '13.5px' } }, [c.body])
  ])
}

function bentoMiniBoard() {
  const cols = [['Backlog', 2], ['In Progress', 3], ['Review', 1], ['Done', 4]]
  return el('div', { class: 'bento-mini' }, cols.map(([name, n]) =>
    el('div', { class: 'bento-mini-col' }, [
      el('span', { class: 'bento-mini-head' }, [name]),
      ...Array.from({ length: n }, (_, i) => el('span', { class: 'bento-mini-card', style: { opacity: 1 - i * 0.12 } }))
    ])
  ))
}

/* ---------------- Productivity ---------------- */
function buildProductivity() {
  return el('section', { class: 'mk-section', id: 'productivity' }, [
    el('div', { class: 'container-wide mk-split' }, [
      el('div', { class: 'mk-split-copy' }, [
        sectionHead('Less coordination. More creation.', 'Northwind removes the busywork so your team can spend its energy on the work that matters.', 'Productivity'),
        el('ul', { class: 'mk-bullets' }, [
          bullet('Capture instantly', 'Quick-create from anywhere with a single shortcut.'),
          bullet('Stay in flow', 'Comments, mentions, and files live next to the task.'),
          bullet('See progress', 'Know what is on track before the deadline arrives.')
        ]),
        el('a', { class: 'btn btn-ghost', href: '#/login' }, ['See it in the app', icon('arrowRight', { size: 15 })])
      ]),
      el('div', { class: 'mk-split-visual' }, [productivityMock()])
    ])
  ])
}

function bullet(title, body) {
  return el('li', { class: 'mk-bullet' }, [
    el('span', { class: 'mk-bullet-ic' }, [icon('check', { size: 15 })]),
    el('div', {}, [el('strong', {}, [title]), el('p', { class: 'text-secondary' }, [body])])
  ])
}

function productivityMock() {
  const mock = el('div', { class: 'prod-mock card card-pad' }, [
    el('div', { class: 'pm-head' }, [el('span', {}, ['This week']), el('span', { class: 'badge badge-success' }, ['On track'])]),
    el('div', { class: 'pm-row' }, [pmMetric('Completed', '38', '#6e9b7c'), pmMetric('Remaining', '16', '#7186a3'), pmMetric('Overdue', '2', '#b5615e')]),
    el('div', { class: 'pm-chart' }, [
      el('span', { class: 'pm-bar', style: { height: '40%', background: 'var(--color-beige-deep)' } }),
      el('span', { class: 'pm-bar', style: { height: '62%', background: 'var(--color-blue)' } }),
      el('span', { class: 'pm-bar', style: { height: '78%', background: 'var(--color-gold)' } }),
      el('span', { class: 'pm-bar', style: { height: '55%', background: 'var(--color-beige-deep)' } }),
      el('span', { class: 'pm-bar', style: { height: '88%', background: 'var(--color-sage)' } }),
      el('span', { class: 'pm-bar', style: { height: '70%', background: 'var(--color-blue)' } }),
      el('span', { class: 'pm-bar', style: { height: '95%', background: 'var(--color-gold)' } })
    ])
  ])
  return mock
}

function pmMetric(label, num, color) {
  return el('div', { class: 'pm-metric' }, [
    el('span', { class: 'pm-dot', style: { background: color } }),
    el('div', {}, [el('span', { class: 'pm-num font-mono' }, [num]), el('span', { class: 'pm-label' }, [label])])
  ])
}

/* ---------------- Workflow ---------------- */
function buildWorkflow() {
  const steps = [
    { n: '01', t: 'Idea', d: 'Capture the spark.' },
    { n: '02', t: 'Project', d: 'Shape it into a plan.' },
    { n: '03', t: 'Tasks', d: 'Break work into steps.' },
    { n: '04', t: 'Team', d: 'Assign and align.' },
    { n: '05', t: 'Progress', d: 'Watch it move.' },
    { n: '06', t: 'Completion', d: 'Deliver with confidence.' }
  ]
  return el('section', { class: 'mk-section mk-section-alt', id: 'workflow' }, [
    el('div', { class: 'container-wide' }, [
      sectionHead('From idea to delivery', 'A workflow that feels natural — not imposed. Each step stays visible and calm.', 'How it works'),
      el('div', { class: 'mk-workflow' }, steps.map((s) =>
        el('div', { class: 'mk-step' }, [
          el('span', { class: 'mk-step-n font-mono' }, [s.n]),
          el('span', { class: 'mk-step-line' }),
          el('h3', { class: 'mk-step-t' }, [s.t]),
          el('p', { class: 'text-secondary' }, [s.d])
        ])
      ))
    ])
  ])
}

/* ---------------- Collaboration ---------------- */
function buildCollaboration() {
  const c = el('section', { class: 'mk-section', id: 'collaboration' }, [
    el('div', { class: 'container-wide mk-split' }, [
      el('div', { class: 'mk-split-visual' }, [collabMock()]),
      el('div', { class: 'mk-split-copy' }, [
        sectionHead('Work together, quietly', 'Comments, mentions, and shared context keep everyone aligned — without the noise.', 'Teamwork'),
        el('ul', { class: 'mk-bullets' }, [
          bullet('Mention anyone', 'Bring the right person into the conversation with @.'),
          bullet('Comment in context', 'Discuss the work where it lives.'),
          bullet('See activity', 'A calm timeline of everything that happened.')
        ])
      ])
    ])
  ])
  return c
}

function collabMock() {
  const thread = el('div', { class: 'collab-mock card card-pad' }, [
    el('div', { class: 'cm-task' }, [el('span', { class: 'cm-task-tag badge badge-gold' }, ['AUR-21']), 'Build hero section component']),
    el('div', { class: 'cm-comment' }, [
      avatar('u_sarah', 30),
      el('div', { class: 'cm-bubble' }, [
        el('div', { class: 'cm-meta' }, [el('strong', {}, ['Sarah']), el('span', { class: 'text-secondary' }, ['2 days ago'])]),
        el('p', {}, ['Could we review the new layout before Friday? ', el('span', { class: 'mention' }, ['@Alex'])])
      ])
    ]),
    el('div', { class: 'cm-comment' }, [
      avatar('u_alex', 30),
      el('div', { class: 'cm-bubble' }, [
        el('div', { class: 'cm-meta' }, [el('strong', {}, ['Alex']), el('span', { class: 'text-secondary' }, ['1 day ago'])]),
        el('p', {}, ['On it — reduced-motion fallback is in review now.'])
      ])
    ]),
    el('div', { class: 'cm-input' }, [avatar('u_amin', 28), el('span', {}, ['Write a reply…']), icon('send', { size: 16 })])
  ])
  return thread
}

/* ---------------- Analytics ---------------- */
function buildAnalyticsSection() {
  return el('section', { class: 'mk-section mk-section-alt', id: 'analytics' }, [
    el('div', { class: 'container-wide' }, [
      sectionHead('Insight without the noise', 'The metrics that matter, presented with restraint. Understand momentum at a glance.', 'Analytics'),
      el('div', { class: 'mk-analytics' }, [
        analyticsCard('Completed tasks', '38', '+12%', true),
        analyticsCard('Active projects', '4', 'steady'),
        analyticsCard('Overdue', '2', 'review', false),
        donutCard()
      ])
    ])
  ])
}

function analyticsCard(label, num, sub, up) {
  return el('div', { class: 'mk-a-card card card-pad' }, [
    el('span', { class: 'mk-a-label text-secondary' }, [label]),
    el('div', { class: 'mk-a-num-row' }, [
      el('span', { class: 'stat-num' }, [num]),
      el('span', { class: 'badge ' + (up ? 'badge-success' : 'badge-warning') }, [sub])
    ]),
    el('div', { class: 'mk-a-spark' }, Array.from({ length: 12 }, (_, i) =>
      el('span', { class: 'spark-bar', style: { height: `${30 + ((i * 7) % 60)}%` } })
    ))
  ])
}

function donutCard() {
  return el('div', { class: 'mk-a-card card card-pad mk-a-donut' }, [
    el('span', { class: 'mk-a-label text-secondary' }, ['Project health']),
    el('div', { class: 'donut' }, [
      el('div', { class: 'donut-svg' }, []),
      el('span', { class: 'donut-center' }, [el('strong', {}, ['78%']), el('span', { class: 'text-secondary' }, ['on track'])])
    ]),
    el('div', { class: 'donut-legend' }, [
      legendItem('#6e9b7c', 'Healthy', '3'),
      legendItem('#c8a24b', 'At risk', '1'),
      legendItem('#b5615e', 'Critical', '1')
    ])
  ])
}

function legendItem(color, label, val) {
  return el('span', { class: 'donut-leg' }, [el('span', { class: 'label-dot', style: { background: color } }), label, el('strong', {}, [val])])
}

/* ---------------- Pricing ---------------- */
function buildPricing() {
  const plans = [
    { name: 'Free', price: '$0', desc: 'For individuals getting started.', features: ['Up to 3 projects', 'Unlimited tasks', 'Calendar & list views', 'Community support'], cta: 'Start free', rec: false },
    { name: 'Pro', price: '$12', per: '/user / mo', desc: 'For growing teams that ship.', features: ['Unlimited projects', 'Kanban, timeline & analytics', 'Automations', 'Priority support'], cta: 'Choose Pro', rec: true },
    { name: 'Business', price: '$24', per: '/user / mo', desc: 'For companies that scale.', features: ['Everything in Pro', 'Advanced roles & permissions', 'Audit log', 'SSO (soon)'], cta: 'Choose Business', rec: false },
    { name: 'Enterprise', price: 'Custom', desc: 'For organizations with needs.', features: ['Everything in Business', 'Dedicated success', 'Custom contracts', 'SLA'], cta: 'Contact us', rec: false }
  ]
  return el('section', { class: 'mk-section', id: 'pricing' }, [
    el('div', { class: 'container-wide' }, [
      sectionHead('Pricing that respects your team', 'Start free. Upgrade when the work grows. No dark patterns.', 'Pricing'),
      el('div', { class: 'mk-pricing' }, plans.map(planCard))
    ])
  ])
}

function planCard(p) {
  const onSelectPlan = (e) => {
    e.preventDefault()
    sessionStorage.setItem('selected_plan', JSON.stringify({ name: p.name, price: p.price, per: p.per }))
    const isLoggedIn = !!getTokens().access
    if (isLoggedIn) {
      if (p.name === 'Free') {
        location.hash = '#/app/dashboard'
      } else {
        location.hash = '#/checkout'
      }
    } else {
      location.hash = '#/register'
    }
  }

  return el('div', { class: 'mk-plan card card-pad' + (p.rec ? ' mk-plan-rec' : '') }, [
    p.rec ? el('span', { class: 'mk-plan-badge badge badge-gold' }, ['Recommended']) : null,
    el('h3', { class: 'mk-plan-name' }, [p.name]),
    el('div', { class: 'mk-plan-price' }, [el('span', { class: 'mk-plan-amt font-display' }, [p.price]), p.per ? el('span', { class: 'text-secondary' }, [p.per]) : null]),
    el('p', { class: 'mk-plan-desc text-secondary' }, [p.desc]),
    el('a', { class: 'btn ' + (p.rec ? 'btn-gold' : 'btn-soft') + ' btn-block', href: '#/login', onclick: onSelectPlan }, [p.cta]),
    el('ul', { class: 'mk-plan-feats' }, p.features.map((f) =>
      el('li', {}, [icon('check', { size: 15 }), f])
    ))
  ].filter(Boolean))
}

/* ---------------- FAQ ---------------- */
function buildFAQ() {
  const faqs = [
    { q: 'Is Northwind free to start?', a: 'Yes. The Free plan includes up to three projects and unlimited tasks — enough to run a real workspace before you ever pay.' },
    { q: 'Can I change plans later?', a: 'Anytime. Upgrades and downgrades take effect immediately, and your data moves with you.' },
    { q: 'How does team collaboration work?', a: 'Invite teammates to a workspace, assign tasks, mention people in comments, and watch a calm activity timeline keep everyone aligned.' },
    { q: 'What about security?', a: 'We follow privacy-respecting defaults and keep your data isolated per workspace. (This demo is frontend-only; real authorization happens on a future backend.)' },
    { q: 'Do you support different roles?', a: 'Yes — Owner, Admin, Manager, Member, and Viewer. Roles change what actions appear in the interface for demonstration.' },
    { q: 'Can I cancel anytime?', a: 'Of course. There are no lock-in contracts on self-serve plans.' }
  ]
  return el('section', { class: 'mk-section mk-section-alt', id: 'faq' }, [
    el('div', { class: 'container-page mk-faq-wrap' }, [
      sectionHead('Questions, answered', 'Everything you need to know before your team starts.', 'FAQ', true),
      el('div', { class: 'mk-faq' }, faqs.map(faqItem))
    ])
  ])
}

function faqItem(f) {
  const item = el('div', { class: 'mk-faq-item' }, [
    el('button', { class: 'mk-faq-q', 'aria-expanded': 'false' }, [
      el('span', {}, [f.q]),
      el('span', { class: 'mk-faq-ic' }, [icon('chevronDown', { size: 18 })])
    ]),
    el('div', { class: 'mk-faq-a' }, [el('p', { class: 'text-secondary' }, [f.a])])
  ])
  const btn = item.querySelector('.mk-faq-q')
  const ans = item.querySelector('.mk-faq-a')
  btn.addEventListener('click', () => {
    const open = item.classList.toggle('open')
    btn.setAttribute('aria-expanded', String(open))
    ans.style.maxHeight = open ? ans.scrollHeight + 'px' : '0px'
  })
  return item
}

/* ---------------- About ---------------- */
// Real About content lives here as a home section (id="about"). The footer
// "About" link smooth-scrolls to this section instead of creating a page.
function buildAbout() {
  const values = [
    { icon: 'target', title: 'Clarity over noise', body: 'Software should reduce decisions, not add them. Every surface earns its place.' },
    { icon: 'heart', title: 'Calm by default', body: 'Quiet interfaces, gentle motion, and notifications that respect deep work.' },
    { icon: 'users', title: 'Built with teams', body: 'We design for the people doing the work — not for dashboards that impress at demos.' }
  ]
  return el('section', { class: 'mk-section', id: 'about' }, [
    el('div', { class: 'container-wide' }, [
      el('div', { class: 'mk-about-grid' }, [
        el('div', { class: 'mk-about-copy' }, [
          sectionHead('We made the tool we wished we had', 'Northwind began with a simple frustration: project software had become heavier than the work it was meant to organize.', 'About'),
          el('p', { class: 'mk-about-lead text-secondary' }, [
            'Our mission is to give modern teams a calm, considered home for their projects — where planning feels natural, progress is visible without ceremony, and the people doing the work stay centered.'
          ]),
          el('p', { class: 'text-secondary' }, [
            'We believe good project management is mostly good communication: clear ownership, shared context, and just enough structure to keep momentum. Northwind is our attempt to make that the default.'
          ])
        ]),
        el('div', { class: 'mk-about-stats' }, [
          aboutStat('2024', 'Founded, in a small studio'),
          aboutStat('40%', 'Faster planning in internal tests'),
          aboutStat('0', 'Dark patterns by design')
        ])
      ]),
      el('div', { class: 'mk-about-values' }, values.map((v) =>
        el('div', { class: 'mk-about-value card card-pad' }, [
          el('span', { class: 'mk-feat-icon sm' }, [icon(v.icon, { size: 18 })]),
          el('h3', { class: 'mk-feat-title', style: { fontSize: '16px' } }, [v.title]),
          el('p', { class: 'mk-feat-body text-secondary', style: { fontSize: '13.5px' } }, [v.body])
        ])
      ))
    ])
  ])
}

function aboutStat(num, label) {
  return el('div', { class: 'mk-about-stat' }, [
    el('span', { class: 'stat-num' }, [num]),
    el('span', { class: 'mk-about-stat-label text-secondary' }, [label])
  ])
}

/* ---------------- Footer ---------------- */
// Footer is now a shared component (components/footer.js) so the same
// four-column structure appears on the marketing page and every subpage.

/* ---------------- Shared ---------------- */
function sectionHead(title, body, eyebrow, center = false) {
  return el('div', { class: 'mk-section-head' + (center ? ' center' : '') }, [
    el('span', { class: 'section-eyebrow' }, [eyebrow]),
    el('h2', { class: 'mk-section-title font-display' }, [title]),
    body ? el('p', { class: 'mk-section-body text-secondary' }, [body]) : null
  ])
}

/* ---------------- Scroll to top button ---------------- */
function buildScrollTop() {
  return el('button', {
    class: 'scroll-top-btn',
    'aria-label': 'Scroll to top',
    onclick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [icon('arrowUp', { size: 20, class: 'scroll-top-icon' })])
}

/* ---------------- Animations ---------------- */
function animateMarketing() {
  reveal($$('.hero-label'), { delay: 0.05 })
  reveal($$('.mk-hero-title'), { delay: 0.12 })
  reveal($$('.mk-hero-sub'), { delay: 0.2 })
  reveal($$('.mk-hero-cta'), { delay: 0.28 })
  reveal($$('.mk-hero-trust'), { delay: 0.36 })
  reveal($$('.mk-hero-visual'), { delay: 0.32, y: 40 })

  scrollRevealGroup('.mk-feat-grid', '.mk-feat', { y: 30 })
  scrollRevealGroup('.mk-bento', '.mk-bento-cell', { y: 26 })
  scrollReveal('.mk-split-copy', { y: 24 })
  scrollReveal('.mk-split-visual', { y: 30 })
  scrollRevealGroup('.mk-workflow', '.mk-step', { y: 24, stagger: 0.1 })
  scrollRevealGroup('.mk-analytics', '.mk-a-card', { y: 26 })
  scrollRevealGroup('.mk-pricing', '.mk-plan', { y: 26, stagger: 0.08 })
  scrollRevealGroup('.mk-faq', '.mk-faq-item', { y: 18 })
  scrollReveal('.mk-footer-top', { y: 20 })
}
