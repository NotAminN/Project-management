// data/projects.js — structured demo projects.
import { TODAY, addDays } from '../utils/format.js'

export const projects = [
  {
    id: 'pr_aurora', code: 'AUR', name: 'Aurora Redesign', workspace: 'ws_amin',
    description: 'Reimagining the marketing site around an editorial, calm design language.',
    status: 'Active', priority: 'High', health: 'Healthy',
    deadline: addDays(TODAY, 21), start: addDays(TODAY, -34),
    progress: 72, memberIds: ['u_amin', 'u_sarah', 'u_diego', 'u_mia'],
    labels: ['Design', 'Marketing'], color: '#b99a5b'
  },
  {
    id: 'pr_api', code: 'APL', name: 'API Platform v2', workspace: 'ws_amin',
    description: 'Next generation of the public API: faster, typed, and well-documented.',
    status: 'Active', priority: 'Urgent', health: 'At Risk',
    deadline: addDays(TODAY, 12), start: addDays(TODAY, -50),
    progress: 48, memberIds: ['u_amin', 'u_john', 'u_alex'],
    labels: ['Backend', 'Feature'], color: '#7186a3'
  },
  {
    id: 'pr_mobile', code: 'MOB', name: 'Mobile Companion', workspace: 'ws_amin',
    description: 'A focused mobile app for on-the-go task capture and review.',
    status: 'Planning', priority: 'Medium', health: 'Healthy',
    deadline: addDays(TODAY, 58), start: addDays(TODAY, -9),
    progress: 14, memberIds: ['u_amin', 'u_alex', 'u_diego'],
    labels: ['Feature', 'Research'], color: '#879887'
  },
  {
    id: 'pr_brand', code: 'BRD', name: 'Brand System', workspace: 'ws_mkt',
    description: 'A unified brand kit: type, color, voice, and reusable components.',
    status: 'Active', priority: 'Medium', health: 'Healthy',
    deadline: addDays(TODAY, 33), start: addDays(TODAY, -20),
    progress: 61, memberIds: ['u_sarah', 'u_mia', 'u_amin'],
    labels: ['Design', 'Marketing'], color: '#a07d9e'
  },
  {
    id: 'pr_q3', code: 'Q3R', name: 'Q3 Reporting', workspace: 'ws_dev',
    description: 'Quarterly analytics and team performance reporting.',
    status: 'On Hold', priority: 'Low', health: 'Critical',
    deadline: addDays(TODAY, 5), start: addDays(TODAY, -40),
    progress: 30, memberIds: ['u_john', 'u_amin'],
    labels: ['Research', 'Backend'], color: '#5f8a8b'
  },
  {
    id: 'pr_onboard', code: 'ONB', name: 'Onboarding Flow', workspace: 'ws_amin',
    description: 'A guided first-run experience that gets teams to value in minutes.',
    status: 'Completed', priority: 'High', health: 'Healthy',
    deadline: addDays(TODAY, -12), start: addDays(TODAY, -70),
    progress: 100, memberIds: ['u_amin', 'u_alex', 'u_mia'],
    labels: ['Feature', 'Design'], color: '#6e9b7c'
  }
]

export const milestones = [
  { id: 'ms_1', projectId: 'pr_aurora', name: 'Editorial concept approved', date: addDays(TODAY, -8), done: true },
  { id: 'ms_2', projectId: 'pr_aurora', name: 'Component library shipped', date: addDays(TODAY, 6), done: false },
  { id: 'ms_3', projectId: 'pr_aurora', name: 'Public launch', date: addDays(TODAY, 21), done: false },
  { id: 'ms_4', projectId: 'pr_api', name: 'Schema freeze', date: addDays(TODAY, 2), done: false },
  { id: 'ms_5', projectId: 'pr_api', name: 'Beta release', date: addDays(TODAY, 12), done: false },
  { id: 'ms_6', projectId: 'pr_brand', name: 'Voice & tone guide', date: addDays(TODAY, 9), done: false }
]

export function getProject(id) {
  return projects.find((p) => p.id === id)
}
