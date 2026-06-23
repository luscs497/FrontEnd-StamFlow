'use client'

import { useState } from 'react'
import { ZapIcon, UserIcon, PasswordIcon, ChevronRightIcon, EyeToggle } from '@/components/Icons'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    try {
      const res = await fetch('https://api.stamflow.com.br/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        const user = data.user

        if (user.user_type === 'manager') {
          window.location.href = 'https://gestor.stamflow.com.br/'
        } else if (user.user_type === 'client') {
          if (user.company_id !== null && user.company_id !== undefined) {
            window.location.href = 'https://user.stamflow.com.br/'
          } else {
            window.location.href = 'https://painel.stamflow.com.br/'
          }
        } else {
          window.location.href = 'https://painel.stamflow.com.br/'
        }
      } else {
        alert('Falha no login: ' + (data.detail || 'Credenciais inválidas'))
      }
    } catch {
      alert('Servidor indisponível no momento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main>
        <section className="login">
          <div className="gap-32">
            {/* Header */}
            <div className="gap-24">
              <div className="login-svg-container">
                <ZapIcon />
              </div>
              <div className="bem-vindo">
                <h1>Bem-vindo</h1>
                <p>Otimize sua energia produtiva e bem-estar.</p>
              </div>
            </div>

            {/* Form */}
            <form className="formData" onSubmit={handleSubmit}>
              <div className="inputs">
                {/* Username */}
                <div className="input-field">
                  <UserIcon />
                  <input
                    className="input-campo"
                    type="text"
                    placeholder="Usuário ou Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div className="input-field">
                  <PasswordIcon />
                  <input
                    className="input-campo"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <EyeToggle
                    visible={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                  />
                </div>

                <p className="forgot-pass" onClick={() => setShowModal(true)}>
                  Esqueci minha senha
                </p>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
                {!loading && <ChevronRightIcon />}
              </button>
            </form>

            {/* Footer */}
            <div className="gap-24">
              <div className="lines">
                <div className="line" />
                <div className="line" />
              </div>
              <p className="version">Versão 2.5.0 • StamFlow</p>
            </div>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      {showModal && <ForgotPasswordModal onClose={() => setShowModal(false)} />}
    </>
  )
}
