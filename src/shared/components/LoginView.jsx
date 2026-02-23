import { useState, useEffect } from 'react'

const OTP_COOLDOWN = 60

export default function LoginView({ auth }) {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.sendOtp(email.trim())
      setStep('otp')
      setCountdown(OTP_COOLDOWN)
    } catch {
      setError("Couldn't send code — check your email address")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.verifyOtp(email.trim(), otp.trim())
    } catch {
      setError("Couldn't verify code — please try again")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (countdown > 0 || loading) return
    setError('')
    setLoading(true)
    try {
      await auth.sendOtp(email.trim())
      setCountdown(OTP_COOLDOWN)
      setOtp('')
    } catch {
      setError("Couldn't resend code — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[var(--surface-0)]">
      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-1">HomeOS</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">Sign in to your household</p>

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="w-full max-w-sm flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            autoFocus
            inputMode="email"
            autoComplete="email"
            className="h-12 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
          />
          {error && <p className="text-need text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="h-12 bg-[var(--text-primary)] text-[var(--surface-0)] rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="w-full max-w-sm flex flex-col gap-3">
          <p className="text-[var(--text-muted)] text-sm text-center">
            Enter the 6-digit code sent to{' '}
            <strong className="text-[var(--text-heading)]">{email}</strong>
          </p>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="h-12 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-primary)] text-xl text-center tracking-widest font-mono focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
          />
          {error && <p className="text-need text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || otp.trim().length < 6}
            className="h-12 bg-[var(--text-primary)] text-[var(--surface-0)] rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
              className="text-[var(--text-muted)] text-sm underline"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              className="text-[var(--text-muted)] text-sm disabled:opacity-50"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
