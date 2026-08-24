// data/users.js — centralized demo people + workspaces (structured, reusable).
// This is the single source of truth for people across the app.

export const workspaces = [
  { id: 'ws_amin', name: 'Amin Studio', kind: 'Studio', color: '#b99a5b', role: 'Owner' },
  { id: 'ws_mkt', name: 'Marketing Team', kind: 'Team', color: '#7186a3', role: 'Admin' },
  { id: 'ws_dev', name: 'Development Team', kind: 'Team', color: '#879887', role: 'Manager' },
  { id: 'ws_personal', name: 'Personal', kind: 'Private', color: '#6e9b7c', role: 'Owner' }
]

export const users = [
  {
    id: 'u_amin', name: 'Amin Reyes', firstName: 'Amin', role: 'Owner',
    title: 'Founder & Product Lead', email: 'amin@northwind.app',
    bio: 'Building calm software for busy teams. Coffee, typography, and quiet mornings.',
    availability: 'Available', workload: 64, status: 'online',
    skills: ['Product', 'Strategy', 'Design']
  },
  {
    id: 'u_alex', name: 'Alex Chen', firstName: 'Alex', role: 'Member',
    title: 'Senior Frontend Engineer', email: 'alex@northwind.app',
    bio: 'I make interfaces feel effortless. TypeScript, motion, and accessibility.',
    availability: 'Focusing', workload: 88, status: 'busy',
    skills: ['Frontend', 'Motion', 'A11y']
  },
  {
    id: 'u_sarah', name: 'Sarah Okonkwo', firstName: 'Sarah', role: 'Manager',
    title: 'Design Director', email: 'sarah@northwind.app',
    bio: 'Editorial design, brand systems, and the pursuit of whitespace.',
    availability: 'Available', workload: 52, status: 'online',
    skills: ['Design', 'Brand', 'Research']
  },
  {
    id: 'u_john', name: 'John Mercer', firstName: 'John', role: 'Member',
    title: 'Backend Engineer', email: 'john@northwind.app',
    bio: 'APIs, data models, and making things reliable.',
    availability: 'In a meeting', workload: 71, status: 'away',
    skills: ['Backend', 'Infra', 'Data']
  },
  {
    id: 'u_mia', name: 'Mia Lindqvist', firstName: 'Mia', role: 'Member',
    title: 'Content Strategist', email: 'mia@northwind.app',
    bio: 'Words that ship. Messaging, lifecycle, and docs.',
    availability: 'Available', workload: 38, status: 'online',
    skills: ['Content', 'Comms', 'SEO']
  },
  {
    id: 'u_diego', name: 'Diego Santos', firstName: 'Diego', role: 'Member',
    title: 'Product Designer', email: 'diego@northwind.app',
    bio: 'Prototyping at the speed of thought.',
    availability: 'Off today', workload: 22, status: 'offline',
    skills: ['Product', 'Prototyping']
  },
  {
    id: 'u_nina', name: 'Nina Petrova', firstName: 'Nina', role: 'Viewer',
    title: 'Client Partner', email: 'nina@northwind.app',
    bio: 'Keeping clients in the loop and projects on track.',
    availability: 'Available', workload: 0, status: 'online',
    skills: ['Client', 'Ops']
  }
]

export const currentUserId = 'u_amin'

export function getUser(id) {
  return users.find((u) => u.id === id)
}

export function avatarFor(user) {
  return { initials: (user.firstName[0] + (user.name.split(' ')[1]?.[0] || '')).toUpperCase(), color: '' }
}

// Role hierarchy for UI-level permission simulation (frontend only).
export const roleRank = { Owner: 4, Admin: 3, Manager: 2, Member: 1, Viewer: 0 }
