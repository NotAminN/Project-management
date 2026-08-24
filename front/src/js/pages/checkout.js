// pages/checkout.js — Payment Checkout Page for selected workspace plans.
import { el } from '../utils/dom.js'
import { icon } from '../components/icons.js'
import { toast } from '../components/toast.js'
import { getState, setState, getCurrentUser } from '../state/app-state.js'
import { navigate } from '../router.js'

export function renderCheckout(root) {
  root.innerHTML = ''

  let planData = { name: 'Pro', price: '$12', per: '/user / mo' }
  try {
    const raw = sessionStorage.getItem('selected_plan')
    if (raw) planData = JSON.parse(raw)
  } catch (e) {}

  const me = getCurrentUser()
  const displayName = me?.name || me?.first_name || me?.username || 'Valued User'

  const container = el('div', { class: 'auth-page grain', style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' } }, [
    el('div', { class: 'card card-pad', style: { width: '100%', maxWidth: '520px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }, [
      // Header
      el('div', { style: { textAlign: 'center', marginBottom: '24px' } }, [
        el('a', { href: '#/', style: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', textDecoration: 'none', color: 'inherit' } }, [
          icon('logo', { size: 24 }),
          el('span', { class: 'font-display', style: { fontSize: '20px', fontWeight: 'bold' } }, ['Northwind'])
        ]),
        el('h2', { class: 'font-display', style: { fontSize: '24px', marginBottom: '4px' } }, ['Complete Your Plan Activation']),
        el('p', { class: 'text-secondary', style: { fontSize: '14px' } }, [`Hello ${displayName}, activate your ${planData.name} plan to unlock full workspace power.`])
      ]),

      // Plan Details Box
      el('div', { class: 'card card-pad', style: { background: 'var(--color-bg-subtle, #f7f6f4)', marginBottom: '24px', border: '1px solid var(--color-beige-deep, #e2ded8)' } }, [
        el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } }, [
          el('span', { style: { fontWeight: '600', fontSize: '16px' } }, [`${planData.name} Subscription`]),
          el('span', { class: 'badge badge-gold', style: { fontSize: '14px', padding: '4px 10px' } }, [`${planData.price} ${planData.per || ''}`])
        ]),
        el('p', { class: 'text-secondary', style: { fontSize: '13px', margin: 0 } }, ['Includes unlimited projects, advanced Gantt timeline, team workload analytics, and priority support.'])
      ]),

      // Form
      el('form', { onsubmit: handlePayment }, [
        el('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' } }, [
          el('div', {}, [
            el('label', { class: 'label', style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' } }, ['Cardholder Name']),
            el('input', { class: 'field', type: 'text', required: true, value: displayName, id: 'pay-name', placeholder: 'e.g. John Doe' })
          ]),
          el('div', {}, [
            el('label', { class: 'label', style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' } }, ['Card Number']),
            el('input', { class: 'field', type: 'text', required: true, value: '4242 •••• •••• 4242', id: 'pay-card', placeholder: '4242 4242 4242 4242' })
          ]),
          el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } }, [
            el('div', {}, [
              el('label', { class: 'label', style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' } }, ['Expiry Date']),
              el('input', { class: 'field', type: 'text', required: true, value: '12/28', placeholder: 'MM/YY' })
            ]),
            el('div', {}, [
              el('label', { class: 'label', style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' } }, ['CVC / CVV']),
              el('input', { class: 'field', type: 'password', required: true, value: '888', placeholder: '123' })
            ])
          ])
        ]),

        el('button', { class: 'btn btn-gold btn-block btn-lg', type: 'submit', id: 'pay-btn' }, [
          icon('lock', { size: 16 }),
          `Pay ${planData.price} & Activate Plan`
        ]),

        el('div', { style: { textAlign: 'center', marginTop: '16px' } }, [
          el('a', { href: '#/app/dashboard', style: { fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'underline' } }, ['Skip for now & use Free Plan'])
        ])
      ])
    ])
  ])

  root.appendChild(container)

  function handlePayment(e) {
    e.preventDefault()
    const btn = document.getElementById('pay-btn')
    if (btn) { btn.disabled = true; btn.textContent = 'Processing Payment…' }

    setTimeout(() => {
      // Save subscription in state & workspace
      const currentUi = getState().ui || {}
      setState({ ui: { ...currentUi, plan: planData.name } })
      sessionStorage.removeItem('selected_plan')

      toast(`🎉 ${planData.name} Plan activated successfully! Welcome aboard.`, { type: 'success' })
      navigate('/app/dashboard')
    }, 1000)
  }
}
