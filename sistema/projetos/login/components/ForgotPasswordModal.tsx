'use client'

import { useState } from 'react'
import { UserIcon, SendIcon } from './Icons'

interface ForgotPasswordModalProps {
  onClose: () => void
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('https://api.stamflow.com.br/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      alert('Solicitação recebida! Se o e-mail/login estiver cadastrado, enviaremos o link de recuperação.')
      onClose()
      setEmail('')
    } catch {
      alert('Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="password-reminder-popup" onClick={handleBackdropClick}>
      <div className="popup-pass">
        <div className="rec-info">
          <div className="title-close">
            <h2>Recuperar Senha</h2>
            <button className="close-popup-pass" onClick={onClose} aria-label="Fechar">
              &times;
            </button>
          </div>
          <p>Digite seu e-mail abaixo para receber as instruções de recuperação de acesso.</p>
        </div>

        <form className="formData" onSubmit={handleSubmit}>
          <div className="input-field">
            <UserIcon />
            <input
              className="input-campo"
              type="email"
              placeholder="Seu e-mail cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
            {!loading && <SendIcon />}
          </button>
        </form>
      </div>
    </div>
  )
}
