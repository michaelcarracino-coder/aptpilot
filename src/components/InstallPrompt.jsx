import { useEffect, useState } from 'react'

/* Install affordance.
 *
 * Two very different platforms hide behind one button:
 *   - Chrome/Edge/Android fire `beforeinstallprompt`, which we capture and
 *     replay on click for a real one-tap install.
 *   - iOS Safari fires nothing and has no programmatic install at all, so the
 *     only honest thing to do is show the Share → Add to Home Screen steps.
 *
 * Nothing renders if the app is already installed, if the visitor dismissed
 * it, or on a desktop browser that can't install.
 */

const DISMISS_KEY = 'aptpilot:install-dismissed'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)
  const [showIosSteps, setShowIosSteps] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY)) return

    const onPrompt = e => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // iOS gets no event, so decide from the platform instead. Delayed so it
    // doesn't collide with the page's first paint.
    let timer
    if (isIos()) timer = setTimeout(() => setShow(true), 4000)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      if (timer) clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setShow(false)
  }

  async function install() {
    if (!deferred) { setShowIosSteps(true); return }
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') dismiss()
    setDeferred(null)
  }

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-label="Install AptPilot"
      style={{
        position: 'fixed', left: '1rem', right: '1rem', bottom: '1rem',
        zIndex: 900, maxWidth: 420, margin: '0 auto',
        background: 'var(--forest)', color: 'var(--paper)',
        borderRadius: 6, padding: '1.1rem 1.2rem',
        boxShadow: '0 18px 50px rgba(31,26,20,0.28)',
        animation: 'fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
        <img src="/icon-192.png" alt="" width={38} height={38} style={{ borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            Add AptPilot to your home screen
          </div>
          <div style={{ fontSize: '0.84rem', color: 'rgba(250,246,239,0.68)', lineHeight: 1.55 }}>
            {showIosSteps
              ? 'Tap the Share button, then choose “Add to Home Screen”.'
              : 'Open it like an app, and get alerts the moment a listing matches.'}
          </div>

          {!showIosSteps && (
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.9rem' }}>
              <button className="btn btn-cream btn-sm" onClick={install}>
                {deferred ? 'Install' : 'Show me how'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={dismiss}>Not now</button>
            </div>
          )}
          {showIosSteps && (
            <button className="btn btn-ghost btn-sm" onClick={dismiss} style={{ marginTop: '0.9rem' }}>
              Got it
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{ background: 'none', border: 'none', color: 'rgba(250,246,239,0.5)', fontSize: '1.1rem', lineHeight: 1, cursor: 'pointer', padding: 0 }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
