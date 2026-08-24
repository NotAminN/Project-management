// data/tasks.js — structured demo tasks across all projects & statuses.
import { TODAY, addDays } from '../utils/format.js'

// Statuses per spec: Backlog, Todo, In Progress, Review, Done
export const STATUSES = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done']

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export const tasks = [
  // ---- Aurora Redesign ----
  {
    id: 'tk_001', code: 'AUR-14', projectId: 'pr_aurora', title: 'Define editorial type scale',
    description: 'Establish a clear hierarchy using Playfair Display for headlines and Inter for UI. Document spacing and line-heights.',
    status: 'Done', priority: 'High', assignee: 'u_sarah', creator: 'u_amin',
    due: addDays(TODAY, -6), created: addDays(TODAY, -30), updated: addDays(TODAY, -5),
    labels: ['Design'], subtasks: [
      { id: 's1', text: 'Audit current type usage', done: true },
      { id: 's2', text: 'Propose display sizes', done: true },
      { id: 's3', text: 'Review with team', done: true }
    ], comments: [
      { id: 'c1', user: 'u_amin', text: 'Love the direction — can we push the hero size a touch?', time: addDays(TODAY, -7) },
      { id: 'c2', user: 'u_sarah', text: 'Done, bumped the display fluid step up one notch.', time: addDays(TODAY, -6) }
    ], attachments: [
      { id: 'a1', name: 'type-scale-v2.pdf', type: 'PDF', size: '2.4 MB', uploader: 'u_sarah', date: addDays(TODAY, -8) }
    ]
  },
  {
    id: 'tk_002', code: 'AUR-21', projectId: 'pr_aurora', title: 'Build hero section component',
    description: 'A staggered, animation-light hero that previews the live product. Must respect reduced motion.',
    status: 'In Progress', priority: 'High', assignee: 'u_alex', creator: 'u_sarah',
    due: addDays(TODAY, 3), created: addDays(TODAY, -22), updated: addDays(TODAY, -1),
    labels: ['Frontend', 'Design'], subtasks: [
      { id: 's1', text: 'Markup & tokens', done: true },
      { id: 's2', text: 'GSAP entrance sequence', done: true },
      { id: 's3', text: 'Responsive pass', done: false },
      { id: 's4', text: 'Reduced-motion fallback', done: false }
    ], comments: [
      { id: 'c1', user: 'u_sarah', text: 'Could we review the new layout before Friday?', time: addDays(TODAY, -2) }
    ], attachments: []
  },
  {
    id: 'tk_003', code: 'AUR-27', projectId: 'pr_aurora', title: 'Write launch announcement',
    description: 'A calm, confident piece for the blog and newsletter. Length ~600 words.',
    status: 'Todo', priority: 'Medium', assignee: 'u_mia', creator: 'u_amin',
    due: addDays(TODAY, 9), created: addDays(TODAY, -12), updated: addDays(TODAY, -12),
    labels: ['Marketing', 'Content'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_004', code: 'AUR-31', projectId: 'pr_aurora', title: 'Motion system documentation',
    description: 'Document the reusable GSAP utilities (fadeIn, slideIn, stagger, modal) for the team.',
    status: 'Backlog', priority: 'Low', assignee: 'u_diego', creator: 'u_alex',
    due: addDays(TODAY, 18), created: addDays(TODAY, -6), updated: addDays(TODAY, -6),
    labels: ['Design', 'Research'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_005', code: 'AUR-09', projectId: 'pr_aurora', title: 'Final QA on color contrast',
    description: 'Verify all text passes WCAG AA across surfaces. Focus on warm gray on ivory.',
    status: 'Review', priority: 'Medium', assignee: 'u_sarah', creator: 'u_amin',
    due: addDays(TODAY, 1), created: addDays(TODAY, -14), updated: addDays(TODAY, -2),
    labels: ['Design', 'A11y'], subtasks: [
      { id: 's1', text: 'Audit primary text', done: true },
      { id: 's2', text: 'Audit metadata', done: true }
    ], comments: [
      { id: 'c1', user: 'u_amin', text: 'Warm gray reads well. Approved.', time: addDays(TODAY, -1) }
    ], attachments: []
  },

  // ---- API Platform v2 ----
  {
    id: 'tk_010', code: 'APL-03', projectId: 'pr_api', title: 'Design typed schema for v2',
    description: 'Define the request/response contracts. Prioritize backward compatibility where reasonable.',
    status: 'In Progress', priority: 'Urgent', assignee: 'u_john', creator: 'u_amin',
    due: addDays(TODAY, 2), created: addDays(TODAY, -40), updated: addDays(TODAY, -1),
    labels: ['Backend'], subtasks: [
      { id: 's1', text: 'Projects endpoint', done: true },
      { id: 's2', text: 'Tasks endpoint', done: true },
      { id: 's3', text: 'Auth scope model', done: false }
    ], comments: [
      { id: 'c1', user: 'u_amin', text: '@John the scope model is the blocker for beta — can we lock it this week?', time: addDays(TODAY, -1) }
    ], attachments: [
      { id: 'a1', name: 'schema-draft.json', type: 'JSON', size: '84 KB', uploader: 'u_john', date: addDays(TODAY, -3) }
    ]
  },
  {
    id: 'tk_011', code: 'APL-08', projectId: 'pr_api', title: 'Rate limiting middleware',
    description: 'Token-bucket limiter with graceful 429 responses and clear headers.',
    status: 'Todo', priority: 'High', assignee: 'u_john', creator: 'u_john',
    due: addDays(TODAY, 7), created: addDays(TODAY, -20), updated: addDays(TODAY, -9),
    labels: ['Backend', 'Infra'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_012', code: 'APL-15', projectId: 'pr_api', title: 'Client SDK — JavaScript',
    description: 'A small, typed client that mirrors the v2 surface.',
    status: 'Backlog', priority: 'Medium', assignee: 'u_alex', creator: 'u_amin',
    due: addDays(TODAY, 16), created: addDays(TODAY, -10), updated: addDays(TODAY, -10),
    labels: ['Frontend', 'Feature'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_013', code: 'APL-19', projectId: 'pr_api', title: 'Migration guide for v1 users',
    description: 'Step-by-step guide plus a codemod where possible.',
    status: 'Review', priority: 'Medium', assignee: 'u_mia', creator: 'u_amin',
    due: addDays(TODAY, 5), created: addDays(TODAY, -15), updated: addDays(TODAY, -3),
    labels: ['Content', 'Docs'], subtasks: [
      { id: 's1', text: 'Outline changes', done: true },
      { id: 's2', text: 'Write examples', done: true }
    ], comments: [], attachments: []
  },
  {
    id: 'tk_014', code: 'APL-01', projectId: 'pr_api', title: 'Project skeleton & CI',
    description: 'Repo scaffolding, linting, and CI pipeline.',
    status: 'Done', priority: 'High', assignee: 'u_alex', creator: 'u_amin',
    due: addDays(TODAY, -18), created: addDays(TODAY, -50), updated: addDays(TODAY, -17),
    labels: ['Infra'], subtasks: [
      { id: 's1', text: 'Repo setup', done: true },
      { id: 's2', text: 'CI green', done: true }
    ], comments: [], attachments: []
  },

  // ---- Mobile Companion ----
  {
    id: 'tk_020', code: 'MOB-02', projectId: 'pr_mobile', title: 'Task capture UX research',
    description: 'Interviews + competitive teardown focused on one-tap capture.',
    status: 'In Progress', priority: 'Medium', assignee: 'u_diego', creator: 'u_amin',
    due: addDays(TODAY, 11), created: addDays(TODAY, -9), updated: addDays(TODAY, -2),
    labels: ['Research'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_021', code: 'MOB-05', projectId: 'pr_mobile', title: 'Offline-first data model',
    description: 'Local-first store with sync queue.',
    status: 'Backlog', priority: 'High', assignee: 'u_alex', creator: 'u_amin',
    due: addDays(TODAY, 28), created: addDays(TODAY, -4), updated: addDays(TODAY, -4),
    labels: ['Frontend', 'Feature'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_022', code: 'MOB-08', projectId: 'pr_mobile', title: 'Push notification strategy',
    description: 'What, when, and how often. Keep it calm.',
    status: 'Todo', priority: 'Low', assignee: 'u_mia', creator: 'u_amin',
    due: addDays(TODAY, 20), created: addDays(TODAY, -3), updated: addDays(TODAY, -3),
    labels: ['Marketing'], subtasks: [], comments: [], attachments: []
  },

  // ---- Brand System ----
  {
    id: 'tk_030', code: 'BRD-04', projectId: 'pr_brand', title: 'Color token specification',
    description: 'Define semantic color tokens and light-mode ratios.',
    status: 'Done', priority: 'Medium', assignee: 'u_sarah', creator: 'u_amin',
    due: addDays(TODAY, -4), created: addDays(TODAY, -20), updated: addDays(TODAY, -4),
    labels: ['Design'], subtasks: [
      { id: 's1', text: 'Palette', done: true },
      { id: 's2', text: 'Semantic mapping', done: true }
    ], comments: [], attachments: [
      { id: 'a1', name: 'color-tokens.fig', type: 'FIG', size: '5.1 MB', uploader: 'u_sarah', date: addDays(TODAY, -5) }
    ]
  },
  {
    id: 'tk_031', code: 'BRD-09', projectId: 'pr_brand', title: 'Voice & tone guide',
    description: 'How Northwind speaks: clear, warm, precise.',
    status: 'In Progress', priority: 'Medium', assignee: 'u_mia', creator: 'u_sarah',
    due: addDays(TODAY, 9), created: addDays(TODAY, -12), updated: addDays(TODAY, -1),
    labels: ['Content', 'Marketing'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_032', code: 'BRD-12', projectId: 'pr_brand', title: 'Reusable component kit',
    description: 'Buttons, inputs, cards, badges aligned to tokens.',
    status: 'Review', priority: 'High', assignee: 'u_diego', creator: 'u_sarah',
    due: addDays(TODAY, 4), created: addDays(TODAY, -10), updated: addDays(TODAY, -2),
    labels: ['Design', 'Frontend'], subtasks: [
      { id: 's1', text: 'Buttons', done: true },
      { id: 's2', text: 'Cards', done: true },
      { id: 's3', text: 'Forms', done: false }
    ], comments: [], attachments: []
  },

  // ---- Q3 Reporting ----
  {
    id: 'tk_040', code: 'Q3R-02', projectId: 'pr_q3', title: 'Aggregate team metrics',
    description: 'Pull completion rate, overdue, and workload per team.',
    status: 'Todo', priority: 'Low', assignee: 'u_john', creator: 'u_amin',
    due: addDays(TODAY, 5), created: addDays(TODAY, -30), updated: addDays(TODAY, -6),
    labels: ['Backend', 'Research'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_041', code: 'Q3R-05', projectId: 'pr_q3', title: 'Quarterly narrative draft',
    description: 'Synthesize metrics into a story for leadership.',
    status: 'Backlog', priority: 'Low', assignee: 'u_amin', creator: 'u_amin',
    due: addDays(TODAY, 8), created: addDays(TODAY, -22), updated: addDays(TODAY, -22),
    labels: ['Research'], subtasks: [], comments: [], attachments: []
  },

  // ---- Onboarding Flow (completed project) ----
  {
    id: 'tk_050', code: 'ONB-01', projectId: 'pr_onboard', title: 'Onboarding wireframes',
    description: 'Five-step guided flow from workspace to first task.',
    status: 'Done', priority: 'High', assignee: 'u_diego', creator: 'u_amin',
    due: addDays(TODAY, -30), created: addDays(TODAY, -70), updated: addDays(TODAY, -28),
    labels: ['Design', 'Feature'], subtasks: [], comments: [], attachments: []
  },
  {
    id: 'tk_051', code: 'ONB-04', projectId: 'pr_onboard', title: 'Implement step engine',
    description: 'Frontend-only step state machine for the welcome flow.',
    status: 'Done', priority: 'High', assignee: 'u_alex', creator: 'u_amin',
    due: addDays(TODAY, -20), created: addDays(TODAY, -60), updated: addDays(TODAY, -19),
    labels: ['Frontend', 'Feature'], subtasks: [], comments: [], attachments: []
  }
]

export function getTask(id) {
  return tasks.find((t) => t.id === id)
}
