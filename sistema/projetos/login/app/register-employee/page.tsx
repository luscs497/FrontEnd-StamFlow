'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { UserIcon, EmailIcon, PasswordIcon, CheckIcon, EyeToggle, SaveIcon } from '@/components/Icons'

type InvitePreview = {
  email: string
  role: 'manager' | 'employee'
  expires_at: string
}

function RegisterEmployeeForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loadingInvite, setLoadingInvite] = useState(true)
  const [invite, setInvite] = useState<InvitePreview | null>(null)

  const [nome, setNome] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      alert('Link inválido. Verifique se você copiou o link completo do e-mail de convite.')
      window.location.href = '/login'
      return
    }

    async function fetchInvite() {
      try {
        const res = await fetch(`https://api.stamflow.com.br/invite/by-token/${token}`)
        if (res.ok) {
          const data = await res.json()
          setInvite(data)
        } else {
          const data = await res.json().catch(() => ({}))
          alert(
            'Não foi possível validar seu convite: ' +
              (data.detail || 'o link expirou ou é inválido.') +
              '\nPeça para quem te convidou enviar um novo convite.'
          )
          window.location.href = '/login'
        }
      } catch {
        alert('Erro ao conectar com o servidor.')
        window.location.href = '/login'
      } finally {
        setLoadingInvite(false)
      }
    }

    fetchInvite()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPass !== confirmPass) {
      alert('As senhas não coincidem!')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('https://api.stamflow.com.br/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nome_completo: nome || null,
          senha: newPass,
        }),
      })

      if (response.ok) {
        alert('Conta criada com sucesso! Você já pode fazer login.')
        window.location.href = '/login'
      } else {
        const data = await response.json().catch(() => ({}))
        alert('Erro: ' + (data.detail || 'O link expirou ou é inválido.'))
      }
    } catch {
      alert('Erro ao conectar com o servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInvite) {
    return (
      <main>
        <section className="login">
          <div className="gap-32">
            <p style={{ color: 'white' }}>Validando seu convite...</p>
          </div>
        </section>
      </main>
    )
  }

  if (!invite) {
    // useEffect já redirecionou para /login nesse caso; isto é só uma
    // tela de fallback para o instante antes do redirect acontecer.
    return null
  }

  return (
    <main>
      <section className="login">
        <div className="gap-32">
          {/* Header */}
          <div className="gap-24">
            <div className="login-svg-container">
              <UserIcon />
            </div>
            <div className="bem-vindo">
              <h1>Criar Conta</h1>
              <p>Você foi convidado(a) para o StamFlow. Defina sua senha para começar.</p>
            </div>
          </div>

          {/* Form */}
          <form className="formData" onSubmit={handleSubmit}>
            <div className="inputs">
              {/* E-mail (vindo do convite, somente leitura) */}
              <div className="input-field">
                <EmailIcon />
                <input
                  className="input-campo"
                  type="email"
                  value={invite.email}
                  disabled
                  readOnly
                />
              </div>

              {/* Nome (opcional) */}
              <div className="input-field">
                <UserIcon />
                <input
                  className="input-campo"
                  type="text"
                  placeholder="Seu nome (opcional)"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              {/* Nova senha */}
              <div className="input-field">
                <PasswordIcon />
                <input
                  className="input-campo"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Crie uma senha"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  minLength={6}
                />
                <EyeToggle visible={showNew} onClick={() => setShowNew((v) => !v)} />
              </div>

              {/* Confirmar senha */}
              <div className="input-field">
                <CheckIcon />
                <input
                  className="input-campo"
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={submitting}>
              {submitting ? 'Criando conta...' : 'Criar minha conta'}
              {!submitting && <SaveIcon />}
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

export default function RegisterEmployeePage() {
  return (
    <Suspense fallback={<main><p style={{ color: 'white' }}>Carregando...</p></main>}>
      <RegisterEmployeeForm />
    </Suspense>
  )
}
