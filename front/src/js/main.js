import '../style.css'
import { initSmoothScroll } from './animations/scroll.js'
import { startRouter, registerRoute, setRouteChangeHandler, navigate } from './router.js'
import { renderMarketing } from './pages/marketing.js'
import { renderLogin, renderRegister } from './pages/login.js'
import { renderCheckout } from './pages/checkout.js'
import { renderSelectPlan } from './pages/select-plan.js'
import { renderSubpage } from './pages/subpage.js'
import { ensureShell, renderAppPage, destroyShell } from './app/shell.js'
import { initGlobalUI } from './app/global-ui.js'
import { getTokens } from './api/api.js'

document.documentElement.classList.add('js')
initSmoothScroll()
initGlobalUI()

registerRoute('/', () => ({ type: 'marketing' }))
registerRoute('/features', () => ({ type: 'marketing', scroll: 'features' }))
registerRoute('/pricing', () => ({ type: 'marketing', scroll: 'pricing' }))
registerRoute('/about', () => ({ type: 'marketing', scroll: 'about' }))

registerRoute('/login', () => ({ type: 'login' }))
registerRoute('/register', () => ({ type: 'register' }))
registerRoute('/checkout', () => ({ type: 'checkout' }))
registerRoute('/select-plan', () => ({ type: 'select-plan' }))
registerRoute('/p/:id', (params) => ({ type: 'subpage', id: params.id }))

registerRoute('/app', () => ({ type: 'app', page: 'dashboard' }))
registerRoute('/app/dashboard', () => ({ type: 'app', page: 'dashboard' }))
registerRoute('/app/projects', () => ({ type: 'app', page: 'projects' }))
registerRoute('/app/project/:id', (params) => ({ type: 'app', page: 'project', id: params.id }))
registerRoute('/app/tasks', () => ({ type: 'app', page: 'tasks' }))
registerRoute('/app/calendar', () => ({ type: 'app', page: 'calendar' }))
registerRoute('/app/timeline', () => ({ type: 'app', page: 'timeline' }))
registerRoute('/app/team', () => ({ type: 'app', page: 'team' }))
registerRoute('/app/analytics', () => ({ type: 'app', page: 'analytics' }))
registerRoute('/app/activity', () => ({ type: 'app', page: 'activity' }))
registerRoute('/app/settings', () => ({ type: 'app', page: 'settings' }))
registerRoute('/app/profile', () => ({ type: 'app', page: 'profile' }))

let lastType = null

setRouteChangeHandler((_route, _params, isApp) => {
  const info = routerInfo()
  
  // Guard app routes
  if (info.type === 'app' && !getTokens().access) {
    location.hash = '#/login'
    return
  }

  if (info.type === 'marketing') {
    destroyShell()
    lastType = 'marketing'
    renderMarketing(document.getElementById('app'), info)
  } else if (info.type === 'subpage') {
    destroyShell()
    lastType = 'subpage'
    renderSubpage(document.getElementById('app'), info.id)
  } else if (info.type === 'login' || info.type === 'register') {
    destroyShell()
    lastType = 'auth'
    if (info.type === 'login') renderLogin(document.getElementById('app'))
    else renderRegister(document.getElementById('app'))
  } else if (info.type === 'checkout') {
    destroyShell()
    lastType = 'checkout'
    renderCheckout(document.getElementById('app'))
  } else if (info.type === 'select-plan') {
    destroyShell()
    lastType = 'select-plan'
    renderSelectPlan(document.getElementById('app'))
  } else {
    lastType = 'app'
    ensureShell(document.getElementById('app'))
    renderAppPage(info)
  }
})

function routerInfo() {
  const path = location.hash.replace(/^#/, '') || '/'
  if (path === '/login') return { type: 'login' }
  if (path === '/register') return { type: 'register' }
  if (path === '/checkout') return { type: 'checkout' }
  if (path === '/select-plan') return { type: 'select-plan' }
  if (path.startsWith('/p/')) {
    return { type: 'subpage', id: path.replace('/p/', '') }
  }
  if (path.startsWith('/app')) {
    const parts = path.split('/').filter(Boolean)
    if (parts.length === 2) return { type: 'app', page: parts[1] }
    if (parts[1] === 'project') return { type: 'app', page: 'project', id: parts[2] }
    return { type: 'app', page: 'dashboard' }
  }
  const map = { '/features': 'features', '/pricing': 'pricing', '/about': 'about' }
  return { type: 'marketing', scroll: map[path] }
}

startRouter()
window.Northwind = { navigate }
