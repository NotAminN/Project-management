// dom.js — tiny DOM helpers (no framework). Keeps component code terse & safe.
export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue
    if (k === 'class') node.className = v
    else if (k === 'html') node.innerHTML = v
    else if (k === 'text') node.textContent = v
    else if (k === 'dataset') Object.assign(node.dataset, v)
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v)
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(node.style, v)
    } else {
      node.setAttribute(k, v)
    }
  }
  for (const c of flatten(children)) {
    if (c == null) continue
    node.append(c.nodeType ? c : document.createTextNode(String(c)))
  }
  return node
}

// Escape user-supplied text before inserting as HTML.
export function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function mount(parent, node) {
  parent.append(node)
  return node
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild)
  return node
}

// Recursively flatten nested arrays so el(tag, attrs, [a, [b, c], d]) works.
function flatten(arr) {
  const out = []
  const walk = (x) => {
    if (Array.isArray(x)) x.forEach(walk)
    else out.push(x)
  }
  walk(arr)
  return out
}

// Delegated event binding (avoids listener leaks across re-renders).
export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const match = e.target.closest(selector)
    if (match && root.contains(match)) handler(e, match)
  })
}
