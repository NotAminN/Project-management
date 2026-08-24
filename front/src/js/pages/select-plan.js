// pages/select-plan.js — Plan Selection Page shown after registration.
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { toast } from '../components/toast.js'
import { getState, setState, getCurrentUser } from '../state/app-state.js'
import { navigate } from '../router.js'

export function renderSelectPlan(root) {
  root.innerHTML = ''

  const me = getCurrentUser()
  const displayName = me?.name || me?.first_name || me?.username || 'User'

  const plans = [
    { name: 'Free', price: '$0', desc: 'For individuals getting started.', features: ['Up to 3 projects', 'Unlimited tasks', 'Calendar & list views'], rec: false },
    { name: 'Pro', price: '$12', per: '/user / mo', desc: 'For growing teams that ship.', features: ['Unlimited projects', 'Kanban, timeline & analytics', 'Automations', 'Priority support'], rec: true },
    { name: 'Business', price: '$24', per: '/user / mo', desc: 'For companies that scale.', features: ['Everything in Pro', 'Advanced roles & permissions', 'Audit log'], rec: false }
  ]

  const container = el('div', { class: 'auth-page grain', style: { minHeight: '100vh', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
    el('div', { style: { textAlign: 'center', maxWidth: '600px', marginBottom: '40px' } }, [
      el('a', { href: '#/', style: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', textDecoration: 'none', color: 'inherit' } }, [
        icon('logo', { size: 28 }),
        el('span', { class: 'font-display', style: { fontSize: '24px', fontWeight: 'bold' } }, ['Northwind'])
      ]),
      el('h1', { class: 'font-display', style: { fontSize: '32px', marginBottom: '8px' } }, [`Welcome, ${displayName}! Choose Your Workspace Plan`]),
      el('p', { class: 'text-secondary', style: { fontSize: '15px' } }, ['Select a plan to configure your new workspace. You can change or upgrade your plan anytime from Settings.'])
    ]),

    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', width: '100%', maxWidth: '960px' } },
      plans.map((p) =>
        el('div', { class: 'card card-pad' + (p.rec ? ' border-gold' : ''), style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px', background: 'var(--color-surface, #fff)', border: p.rec ? '2px solid var(--color-gold, #b99a5b)' : '1px solid var(--color-beige-deep, #e2ded8)' } }, [
          el('div', {}, [
            p.rec ? el('span', { class: 'badge badge-gold', style: { marginBottom: '12px', display: 'inline-block' } }, ['Recommended']) : null,
            el('h3', { class: 'font-display', style: { fontSize: '20px', marginBottom: '6px' } }, [p.name]),
            el('div', { style: { fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' } }, [p.price, p.per ? el('span', { style: { fontSize: '13px', color: '#888', fontWeight: 'normal' } }, [p.per]) : null]),
            el('p', { class: 'text-secondary', style: { fontSize: '13px', marginBottom: '16px' } }, [p.desc]),
            el('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' } },
              p.features.map((f) => el('li', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [icon('check', { size: 14 }), f]))
            )
          ]),
          el('button', {
            class: 'btn ' + (p.rec ? 'btn-gold' : 'btn-primary') + ' btn-block',
            onclick: () => selectPlan(p)
          }, [p.price === '$0' ? 'Start Free Plan' : `Select ${p.name}`])
        ])
      )
    )
  ])

  root.appendChild(container)

  function selectPlan(p) {
    sessionStorage.setItem('selected_plan', JSON.stringify(p))
    if (p.price === '$0') {
      const currentUi = getState().ui || {}
      setState({ ui: { ...currentUi, plan: 'Free' } })
      sessionStorage.removeItem('selected_plan')
      toast('Free Plan selected. Welcome to your dashboard!', { type: 'success' })
      navigate('/app/dashboard')
    } else {
      navigate('/checkout')
    }
  }
}
