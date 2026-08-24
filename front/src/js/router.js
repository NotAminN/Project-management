// router.js — minimal hash router (no framework).
// Routes look like: #/  (marketing) and #/app, #/app/projects, #/app/project/:id ...
const routes = []
let current = null
let onChange = null

export function registerRoute(pattern, handler) {
  // pattern like '/app/project/:id' -> regex
  const keys = []
  const rx = new RegExp(
    '^' +
      pattern.replace(/:[^/]+/g, (m) => {
        keys.push(m.slice(1))
        return '([^/]+)'
      }) +
      '$'
  )
  routes.push({ rx, keys, handler, pattern })
}

export function setRouteChangeHandler(fn) {
  onChange = fn
}

export function navigate(path) {
  if (location.hash === '#' + path) {
    handle()
  } else {
    location.hash = path
  }
}

export function getParams() {
  return current?.params || {}
}

export function getCurrentPath() {
  return location.hash.replace(/^#/, '') || '/'
}

function parse() {
  const path = getCurrentPath()
  for (const r of routes) {
    const m = path.match(r.rx)
    if (m) {
      const params = {}
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])))
      return { route: r, params }
    }
  }
  return null
}

export function handle() {
  const matched = parse()
  if (!matched) {
    location.hash = '#/'
    return
  }
  const isApp = matched.route.pattern.startsWith('/app')
  current = matched
  if (onChange) onChange(matched.route, matched.params, isApp)
}

export function startRouter() {
  window.addEventListener('hashchange', handle)
  if (!location.hash) location.hash = '#/'
  handle()
}

export function getRoute() {
  return current?.route?.pattern || '/'
}
