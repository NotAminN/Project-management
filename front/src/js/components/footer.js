// components/footer.js — shared Northwind footer used by the marketing site
// and every /p/:id subpage. Implements the exact structure from the brief:
// Product / Solutions / Resources / Company, five links each.
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { scrollTo } from '../animations/scroll.js'

const COLUMNS = [
  { h: 'Product', links: ['Features', 'Pricing', 'Analytics', 'Integrations', 'Changelog'] },
  { h: 'Solutions', links: ['Startups', 'Agencies', 'Software teams', 'Creative teams', 'Enterprise'] },
  { h: 'Resources', links: ['Documentation', 'Guides', 'API', 'Community', 'Status'] },
  { h: 'Company', links: ['About', 'Careers', 'Blog', 'Contact', 'Press'] }
]

// Sections that live on the home page — kept pointing at the section, not a new route.
const HOME_SECTIONS = new Set(['features', 'pricing', 'about'])

function linkFor(label) {
  const slug = label.toLowerCase().replace(/ /g, '-')
  const href = HOME_SECTIONS.has(slug) ? `#/${slug}` : `#/p/${slug}`

  const a = el('a', { class: 'mk-footer-link link-underline', href }, [label])

  // If the target is a home-section and we're already on the home route, smooth-scroll.
  a.addEventListener('click', (e) => {
    if (HOME_SECTIONS.has(slug)) {
      const onHome = location.hash === '#/' || location.hash === '' || location.hash === '#'
      if (onHome) {
        e.preventDefault()
        scrollTo('#' + slug, { offset: -70 })
      }
      // otherwise let the hash change drive main.js → renderMarketing → scroll
    }
  })
  return el('li', {}, [a])
}

export function buildFooter() {
  return el('footer', { class: 'mk-footer' }, [
    el('div', { class: 'container-wide' }, [
      el('div', { class: 'mk-footer-top' }, [
        el('div', { class: 'mk-footer-brand' }, [
          el('div', { class: 'brand' }, [icon('logo', { size: 20 }), el('span', { class: 'brand-name' }, ['Northwind'])]),
          el('p', { class: 'text-secondary', style: { maxWidth: '280px', marginTop: '12px' } }, [
            'A calm, premium workspace for teams who care about focused work.'
          ]),
          el('form', {
            class: 'mk-news',
            onsubmit: (e) => {
              e.preventDefault()
              const btn = e.currentTarget.querySelector('button')
              e.currentTarget.querySelector('input').value = ''
              btn.textContent = 'Joined'
              btn.disabled = true
            }
          }, [
            el('input', { class: 'field', type: 'email', placeholder: 'Email for product notes', 'aria-label': 'Email', required: true }),
            el('button', { class: 'btn btn-primary', type: 'submit' }, ['Subscribe'])
          ])
        ]),
        el('div', { class: 'mk-footer-cols' }, COLUMNS.map((c) =>
          el('div', { class: 'mk-footer-col' }, [
            el('h4', { class: 'mk-footer-h' }, [c.h]),
            el('ul', {}, c.links.map(linkFor))
          ])
        ))
      ]),
      el('div', { class: 'mk-footer-bottom' }, [
        el('span', { class: 'text-secondary' }, ['© 2026 Northwind. A demonstration product.']),
        el('div', { class: 'mk-footer-social' }, [
          icon('send', { size: 16 }), icon('compass', { size: 16 }), icon('comment', { size: 16 }), icon('star', { size: 16 })
        ].map((ic) => el('button', { class: 'mk-social-btn', 'aria-label': 'Social link' }, [ic])))
      ])
    ])
  ])
}
