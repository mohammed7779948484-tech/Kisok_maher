'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button, Checkbox, Input, Label } from '@/shared/ui'

import { verifyPassword } from '../actions/verify-password.action'
import { GateError } from './_components/GateError'

export function GateForm(): React.ReactElement {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)

    const result = await verifyPassword({
      password: formData.get('password') as string,
      rememberMe: formData.get('rememberMe') === 'on',
    })

    if (result.success) {
      router.push('/')
      router.refresh()
    } else {
      setError(result.error || 'Authentication failed')
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && <GateError message={error} />}

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            aria-describedby={error ? 'gate-error' : undefined}
            autoFocus
            className="pr-14 font-semibold tracking-wider text-primary"
            disabled={loading}
            id="password"
            name="password"
            placeholder="Enter store password"
            required
            type={showPassword ? 'text' : 'password'}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1 top-1/2 flex h-touch w-touch -translate-y-1/2 items-center justify-center rounded-medium text-on-surface-variant transition-colors duration-fast hover:bg-surface-container hover:text-on-surface"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox disabled={loading} id="rememberMe" name="rememberMe" />
        <Label className="cursor-pointer text-on-surface-variant" htmlFor="rememberMe">Remember me for 30 days</Label>
      </div>

      <Button className="w-full" disabled={loading} size="lg" type="submit">
        {loading ? (
          <span className="flex items-center gap-2" role="status">
            <Loader2 aria-hidden="true" className="animate-spin" />
            Verifying...
          </span>
        ) : 'Enter Store'}
      </Button>
    </form>
  )
}
