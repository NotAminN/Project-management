// data/notifications.js — notification + activity feed demo data.
import { TODAY, addDays } from '../utils/format.js'

export const notifications = [
  {
    id: 'nt_1', type: 'mention', user: 'u_amin', title: 'Amin mentioned you',
    text: 'in "Design typed schema for v2" — can we lock the scope model this week?',
    time: addDays(TODAY, -1), read: false, projectId: 'pr_api', taskId: 'tk_010'
  },
  {
    id: 'nt_2', type: 'comment', user: 'u_sarah', title: 'Sarah commented',
    text: 'on "Build hero section component" — could we review the layout before Friday?',
    time: addDays(TODAY, -2), read: false, projectId: 'pr_aurora', taskId: 'tk_002'
  },
  {
    id: 'nt_3', type: 'assigned', user: 'u_mia', title: 'New task assigned',
    text: 'Mia assigned you "Write launch announcement" in Aurora Redesign.',
    time: addDays(TODAY, -3), read: false, projectId: 'pr_aurora', taskId: 'tk_003'
  },
  {
    id: 'nt_4', type: 'deadline', user: 'system', title: 'Deadline approaching',
    text: 'Schema freeze for API Platform v2 is due in 2 days.',
    time: addDays(TODAY, -1), read: true, projectId: 'pr_api', taskId: 'tk_010'
  },
  {
    id: 'nt_5', type: 'update', user: 'u_alex', title: 'Project updated',
    text: 'Alex moved "Project skeleton & CI" to Done in API Platform v2.',
    time: addDays(TODAY, -17), read: true, projectId: 'pr_api', taskId: 'tk_014'
  },
  {
    id: 'nt_6', type: 'invite', user: 'u_amin', title: 'Team invitation',
    text: 'Amin invited Nina Petrova to the Development Team workspace.',
    time: addDays(TODAY, -5), read: true, projectId: null, taskId: null
  }
]

// Activity feed — chronological, for the dashboard + project activity tab.
export const activities = [
  { id: 'ac_1', type: 'status', user: 'u_alex', verb: 'moved', target: 'Project skeleton & CI', meta: 'to Done', projectId: 'pr_api', time: addDays(TODAY, -17) },
  { id: 'ac_2', type: 'comment', user: 'u_sarah', verb: 'commented on', target: 'Build hero section component', meta: 'could we review before Friday?', projectId: 'pr_aurora', time: addDays(TODAY, -2) },
  { id: 'ac_3', type: 'mention', user: 'u_amin', verb: 'mentioned', target: 'John', meta: 'in Design typed schema for v2', projectId: 'pr_api', time: addDays(TODAY, -1) },
  { id: 'ac_4', type: 'create', user: 'u_amin', verb: 'created', target: 'Push notification strategy', meta: 'in Mobile Companion', projectId: 'pr_mobile', time: addDays(TODAY, -3) },
  { id: 'ac_5', type: 'complete', user: 'u_sarah', verb: 'completed', target: 'Color token specification', meta: 'in Brand System', projectId: 'pr_brand', time: addDays(TODAY, -4) },
  { id: 'ac_6', type: 'invite', user: 'u_amin', verb: 'invited', target: 'Nina Petrova', meta: 'to Development Team', projectId: null, time: addDays(TODAY, -5) }
]

export const NOTIF_ICONS = {
  mention: 'mention', comment: 'comment', assigned: 'assign', deadline: 'clock',
  update: 'refresh', invite: 'user', status: 'move', create: 'plus', complete: 'check'
}
