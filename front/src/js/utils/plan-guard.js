// utils/plan-guard.js — central helper for workspace plan limits and feature access control.
import { getUI, getState } from '../state/app-state.js'
import { openModal, closeModal } from '../components/modal.js'
import { el } from './dom.js'
import { icon } from '../components/icons.js'

export function getCurrentPlan() {
  return getUI().plan || 'Free'
}

export function canCreateProject() {
  const plan = getCurrentPlan()
  if (plan === 'Free') {
    const count = getState().projects.length
    if (count >= 3) {
      return {
        allowed: false,
        reason: 'Free plan is limited to 3 projects. Upgrade to Pro for unlimited projects.'
      }
    }
  }
  return { allowed: true }
}

export function canAccessView(viewName) {
  const plan = getCurrentPlan()
  if (plan === 'Free') {
    const restricted = ['timeline', 'analytics', 'kanban']
    if (restricted.includes(viewName.toLowerCase())) {
      return {
        allowed: false,
        reason: `${viewName.charAt(0).toUpperCase() + viewName.slice(1)} view requires Pro or Business plan.`
      }
    }
  }
  return { allowed: true }
}

export function showUpgradeModal(title = 'Upgrade Required', description = 'Upgrade to Pro to unlock unlimited projects and advanced views.') {
  const content = el('div', { style: { padding: '12px 4px', textAlign: 'center' } }, [
    el('div', { style: { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(185, 154, 91, 0.15)', color: 'var(--color-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' } }, [
      icon('zap', { size: 28 })
    ]),
    el('h3', { class: 'font-display', style: { fontSize: '22px', marginBottom: '8px' } }, [title]),
    el('p', { class: 'text-secondary', style: { fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' } }, [description]),
    el('div', { class: 'card card-pad', style: { textAlign: 'left', marginBottom: '24px', background: 'var(--color-bg-subtle, #f7f6f4)' } }, [
      el('strong', { style: { display: 'block', fontSize: '14px', marginBottom: '8px' } }, ['Pro Plan ($12/user/mo) Includes:']),
      el('ul', { style: { listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' } }, [
        el('li', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [icon('check', { size: 14 }), 'Unlimited projects']),
        el('li', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [icon('check', { size: 14 }), 'Kanban board & Gantt timeline']),
        el('li', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [icon('check', { size: 14 }), 'Team workload & analytics']),
        el('li', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [icon('check', { size: 14 }), 'Priority support'])
      ])
    ]),
    el('button', {
      class: 'btn btn-gold btn-block btn-lg',
      onclick: () => {
        closeModal()
        location.hash = '#/select-plan'
      }
    }, [icon('zap', { size: 16 }), 'Upgrade to Pro'])
  ])

  openModal({ title: '', content, variant: 'center', width: '460px' })
}
