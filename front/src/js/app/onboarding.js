// app/onboarding.js — app-level onboarding gate (wraps the component).
import { getUI, updateUI, getState } from '../state/app-state.js'
import { startOnboarding } from '../components/onboarding.js'

// Check if onboarding is needed (first run or no workspace selected)
export function needsOnboarding() {
  const ui = getUI()
  // Show onboarding if never completed AND no real workspace selected
  return !ui.onboardingDone
}

export function runOnboarding() {
  if (getUI().onboardingDone) return
  startOnboarding()
}

// Called from onboarding component when finished
export function onOnboardingComplete() {
  updateUI({ onboardingDone: true })
}
