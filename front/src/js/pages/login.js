import { el } from '../utils/dom.js'
import { authService } from '../services/auth.js'
import { toast } from '../components/toast.js'

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

export function renderLogin(root) {
  root.innerHTML = ''

  const errorBanner = el('div', {
    id: 'login-error-banner',
    style: {
      color: '#b5615e',
      background: 'rgba(181, 97, 94, 0.1)',
      border: '1px solid rgba(181, 97, 94, 0.3)',
      borderRadius: '6px',
      padding: '10px 14px',
      fontSize: '13px',
      textAlign: 'center',
      display: 'none',
      marginBottom: '12px'
    }
  })

  const usernameErr = el('div', { class: 'field-err-text', style: { color: '#b5615e', fontSize: '12px', marginTop: '-10px', display: 'none' } })
  const passwordErr = el('div', { class: 'field-err-text', style: { color: '#b5615e', fontSize: '12px', marginTop: '-10px', display: 'none' } })

  const usernameInput = el('input', { type: 'text', id: 'l-username', placeholder: 'Username', class: 'field' })
  const passwordInput = el('input', { type: 'password', id: 'l-password', placeholder: 'Password', class: 'field' })
  const submitBtn = el('button', { type: 'submit', class: 'btn btn-primary btn-block' }, ['Sign In'])

  const form = el('form', {
    class: 'card card-pad',
    style: {
      width: '100%',
      maxWidth: '420px',
      margin: '100px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, [
    el('h2', { class: 'font-display', style: { textAlign: 'center', marginBottom: '4px' } }, ['Sign in to Northwind']),
    el('p', { class: 'text-secondary', style: { textAlign: 'center', fontSize: '13px', marginBottom: '12px' } }, ['Enter your credentials to access your account']),
    errorBanner,
    usernameInput,
    usernameErr,
    passwordInput,
    passwordErr,
    submitBtn,
    el('div', { style: { textAlign: 'center', fontSize: '14px', marginTop: '12px' } }, [
      "Don't have an account? ",
      el('a', { href: '#/register', style: { color: 'var(--color-gold-deep)', fontWeight: 'bold' } }, ['Register'])
    ])
  ])

  // Clear errors on input
  usernameInput.addEventListener('input', () => hideFieldErr(usernameInput, usernameErr))
  passwordInput.addEventListener('input', () => hideFieldErr(passwordInput, passwordErr))

  form.onsubmit = async (e) => {
    e.preventDefault()
    clearAllErrors()

    const username = usernameInput.value.trim()
    const password = passwordInput.value

    let hasError = false

    if (!username) {
      showFieldErr(usernameInput, usernameErr, 'Please enter your username.')
      hasError = true
    }

    if (!password) {
      showFieldErr(passwordInput, passwordErr, 'Please enter your password.')
      hasError = true
    }

    if (hasError) return

    setSubmitting(true)

    try {
      await authService.login(username, password)
      toast(`Welcome back, ${username}!`, { type: 'success' })
      let plan = null
      try {
        const raw = sessionStorage.getItem('selected_plan')
        if (raw) plan = JSON.parse(raw)
      } catch (e) {}

      if (plan && plan.name !== 'Free') {
        location.hash = '#/checkout'
      } else {
        location.hash = '#/app'
      }
    } catch (errObj) {
      setSubmitting(false)
      handleLoginError(errObj)
    }
  }

  function handleLoginError(errObj) {
    if (errObj.network) {
      showBanner(errObj.message)
      return
    }

    const status = errObj.status
    const data = errObj.data || {}

    if (status === 401 || data.detail) {
      showBanner('Invalid username or password.')
      showFieldErr(usernameInput, usernameErr, '')
      showFieldErr(passwordInput, passwordErr, '')
    } else if (data.username) {
      showFieldErr(usernameInput, usernameErr, Array.isArray(data.username) ? data.username[0] : data.username)
    } else if (data.password) {
      showFieldErr(passwordInput, passwordErr, Array.isArray(data.password) ? data.password[0] : data.password)
    } else {
      showBanner('Sign in failed. Please try again.')
    }
  }

  function showBanner(msg) {
    errorBanner.textContent = msg
    errorBanner.style.display = 'block'
  }

  function clearAllErrors() {
    errorBanner.style.display = 'none'
    hideFieldErr(usernameInput, usernameErr)
    hideFieldErr(passwordInput, passwordErr)
  }

  function setSubmitting(isPending) {
    submitBtn.disabled = isPending
    submitBtn.textContent = isPending ? 'Authenticating...' : 'Sign In'
  }

  root.appendChild(form)
}

export function renderRegister(root) {
  root.innerHTML = ''

  const errorBanner = el('div', {
    id: 'reg-error-banner',
    style: {
      color: '#b5615e',
      background: 'rgba(181, 97, 94, 0.1)',
      border: '1px solid rgba(181, 97, 94, 0.3)',
      borderRadius: '6px',
      padding: '10px 14px',
      fontSize: '13px',
      textAlign: 'center',
      display: 'none',
      marginBottom: '12px'
    }
  })

  const usernameErr = el('div', { class: 'field-err-text', style: { color: '#b5615e', fontSize: '12px', marginTop: '-10px', display: 'none' } })
  const emailErr = el('div', { class: 'field-err-text', style: { color: '#b5615e', fontSize: '12px', marginTop: '-10px', display: 'none' } })
  const passwordErr = el('div', { class: 'field-err-text', style: { color: '#b5615e', fontSize: '12px', marginTop: '-10px', display: 'none' } })

  const usernameInput = el('input', { type: 'text', id: 'r-username', placeholder: 'Username', class: 'field' })
  const emailInput = el('input', { type: 'email', id: 'r-email', placeholder: 'Email address', class: 'field' })
  const passwordInput = el('input', { type: 'password', id: 'r-password', placeholder: 'Password (min. 6 characters)', class: 'field' })
  const submitBtn = el('button', { type: 'submit', class: 'btn btn-primary btn-block' }, ['Create Account'])

  const form = el('form', {
    class: 'card card-pad',
    style: {
      width: '100%',
      maxWidth: '420px',
      margin: '100px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, [
    el('h2', { class: 'font-display', style: { textAlign: 'center', marginBottom: '4px' } }, ['Create an Account']),
    el('p', { class: 'text-secondary', style: { textAlign: 'center', fontSize: '13px', marginBottom: '12px' } }, ['Enter your details to register a new account']),
    errorBanner,
    usernameInput,
    usernameErr,
    emailInput,
    emailErr,
    passwordInput,
    passwordErr,
    submitBtn,
    el('div', { style: { textAlign: 'center', fontSize: '14px', marginTop: '12px' } }, [
      'Already have an account? ',
      el('a', { href: '#/login', style: { color: 'var(--color-gold-deep)', fontWeight: 'bold' } }, ['Sign In'])
    ])
  ])

  // Clear field errors on input
  usernameInput.addEventListener('input', () => hideFieldErr(usernameInput, usernameErr))
  emailInput.addEventListener('input', () => hideFieldErr(emailInput, emailErr))
  passwordInput.addEventListener('input', () => hideFieldErr(passwordInput, passwordErr))

  form.onsubmit = async (e) => {
    e.preventDefault()
    clearAllErrors()

    const username = usernameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value

    let hasError = false

    if (!username) {
      showFieldErr(usernameInput, usernameErr, 'Please enter a username.')
      hasError = true
    } else if (username.length < 3) {
      showFieldErr(usernameInput, usernameErr, 'Username must be at least 3 characters.')
      hasError = true
    }

    if (!email) {
      showFieldErr(emailInput, emailErr, 'Please enter your email.')
      hasError = true
    } else if (!validateEmail(email)) {
      showFieldErr(emailInput, emailErr, 'Please enter a valid email address.')
      hasError = true
    }

    if (!password) {
      showFieldErr(passwordInput, passwordErr, 'Please enter a password.')
      hasError = true
    } else if (password.length < 6) {
      showFieldErr(passwordInput, passwordErr, 'Password must be at least 6 characters.')
      hasError = true
    }

    if (hasError) return

    setSubmitting(true)

    try {
      await authService.register({ username, email, password })
      toast(`Welcome to Northwind, ${username}! Your account is ready.`, { type: 'success' })
      let plan = null
      try {
        const raw = sessionStorage.getItem('selected_plan')
        if (raw) plan = JSON.parse(raw)
      } catch (e) {}

      if (plan && plan.name !== 'Free') {
        location.hash = '#/checkout'
      } else {
        location.hash = '#/select-plan'
      }
    } catch (errObj) {
      setSubmitting(false)
      handleRegisterError(errObj)
    }
  }

  function handleRegisterError(errObj) {
    if (errObj.network) {
      showBanner(errObj.message)
      return
    }

    const data = errObj.data || {}

    if (data.username) {
      const msg = Array.isArray(data.username) ? data.username[0] : data.username
      if (msg.includes('already exists')) {
        showFieldErr(usernameInput, usernameErr, 'A user with that username already exists.')
      } else {
        showFieldErr(usernameInput, usernameErr, msg)
      }
    }

    if (data.email) {
      const msg = Array.isArray(data.email) ? data.email[0] : data.email
      if (msg.includes('already exists')) {
        showFieldErr(emailInput, emailErr, 'A user with that email already exists.')
      } else {
        showFieldErr(emailInput, emailErr, msg)
      }
    }

    if (data.password) {
      const msg = Array.isArray(data.password) ? data.password[0] : data.password
      showFieldErr(passwordInput, passwordErr, msg)
    }

    if (data.detail && !data.username && !data.email && !data.password) {
      showBanner(data.detail)
    } else if (!data.username && !data.email && !data.password) {
      showBanner('Registration failed. Please check your information.')
    }
  }

  function showBanner(msg) {
    errorBanner.textContent = msg
    errorBanner.style.display = 'block'
  }

  function clearAllErrors() {
    errorBanner.style.display = 'none'
    hideFieldErr(usernameInput, usernameErr)
    hideFieldErr(emailInput, emailErr)
    hideFieldErr(passwordInput, passwordErr)
  }

  function setSubmitting(isPending) {
    submitBtn.disabled = isPending
    submitBtn.textContent = isPending ? 'Creating Account...' : 'Create Account'
  }

  root.appendChild(form)
}

function showFieldErr(inputEl, errEl, text) {
  inputEl.style.borderColor = '#b5615e'
  inputEl.style.boxShadow = '0 0 0 1px rgba(181, 97, 94, 0.3)'
  if (text) {
    errEl.textContent = text
    errEl.style.display = 'block'
  }
}

function hideFieldErr(inputEl, errEl) {
  inputEl.style.borderColor = ''
  inputEl.style.boxShadow = ''
  errEl.textContent = ''
  errEl.style.display = 'none'
}
