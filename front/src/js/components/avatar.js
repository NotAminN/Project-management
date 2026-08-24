// components/avatar.js — avatar rendering (initials, deterministic color).
import { el } from '../utils/dom.js'
import { getUser } from '../state/app-state.js'

const AVATAR_COLORS = ['#7186a3', '#879887', '#b99a5b', '#b5615e', '#6e9b7c', '#a07d9e', '#5f8a8b', '#c08a5e', '#7a7f9c']

function colorFor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function avatar(userOrId, size = 32, opts = {}) {
  const user = typeof userOrId === 'string' ? getUser(userOrId) : userOrId
  const name = user?.name || 'Unknown'
  const init = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'
  const node = el('span', {
    class: `avatar ${opts.ring ? 'avatar-ring' : ''}`,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.round(size * 0.38)}px`,
      background: colorFor(name)
    },
    title: name,
    'aria-label': name
  }, [init])
  if (opts.status && user) {
    node.style.position = 'relative'
    // status dot appended via class on wrapper instead; kept simple here
  }
  return node
}

export function avatarStack(ids, size = 28, max = 4) {
  const wrap = el('span', { class: 'avatar-stack' })
  const shown = ids.slice(0, max)
  shown.forEach((id) => wrap.append(avatar(id, size)))
  if (ids.length > max) {
    wrap.append(
      el('span', {
        class: 'avatar',
        style: { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.34)}px`, background: 'var(--color-beige-deep)', color: 'var(--color-warmgray)' }
      }, [`+${ids.length - max}`])
    )
  }
  return wrap
}
