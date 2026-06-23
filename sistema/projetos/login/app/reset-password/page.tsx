'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LockIcon, PasswordIcon, CheckIcon, EyeToggle, SaveIcon } from '@/components/Icons'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      alert('Link inválido ou expirado. Por favor, solicite a redefinição novamente.')
      window.location.href = '/login'
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPass !== confirmPass) {
      alert('As senhas não coincidem!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('https://api.stamflow.com.br/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPass }),
      })

      if (response.ok) {
        alert('Senha redefinida com sucesso! Você será redirecionado para o login.')
        window.location.href = '/login'
      } else {
        const data = await response.json()
        alert('Erro: ' + (data.detail || 'O link expirou ou é inválido.'))
      }
    } catch {
      alert('Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section className="login">
        <div className="gap-32">
          {/* Header */}
          <div className="gap-24">
            <div className="login-svg-container">
              <LockIcon />
            </div>
            <div className="bem-vindo">
              <h1>Nova Senha</h1>
              <p>Crie uma nova senha segura para acessar sua conta.</p>
            </div>
          </div>

          {/* Form */}
          <form className="formData" onSubmit={handleSubmit}>
            <div className="inputs">
              {/* New password */}
              <div className="input-field">
                <PasswordIcon />
                <input
                  className="input-campo"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Nova Senha"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  minLength={6}
                />
                <EyeToggle visible={showNew} onClick={() => setShowNew((v) => !v)} />
              </div>

              {/* Confirm password */}
              <div className="input-field">
                <CheckIcon />
                <input
                  className="input-campo"
                  type="password"
                  placeholder="Confirmar Senha"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Atualizando...' : 'Redefinir Senha'}
              {!loading && <SaveIcon />}
            </button>
          </form>

          {/* Footer */}
          <div className="gap-24">
            <div className="lines">
              <div className="line" />
              <div className="line" />
            </div>
            <Link href="/login" className="forgot-pass" style={{ fontSize: '14px', textDecoration: 'none' }}>
              ← Voltar para Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main><p style={{ color: 'white' }}>Carregando...</p></main>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
