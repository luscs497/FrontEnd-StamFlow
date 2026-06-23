# StamFlow — Portal de Acesso (Next.js)

Versão Next.js 14 (App Router) do sistema de login StamFlow.

## Estrutura

```
stamflow/
├── app/
│   ├── layout.tsx          # Layout raiz (fonts, metadata)
│   ├── page.tsx            # Redireciona para /login
│   ├── login/
│   │   └── page.tsx        # Tela de login principal
│   ├── register/
│   │   └── page.tsx        # Cadastro de usuário (tema dark)
│   └── reset-password/
│       └── page.tsx        # Redefinição de senha via token na URL
├── components/
│   ├── Icons.tsx           # Todos os SVGs reutilizáveis
│   └── ForgotPasswordModal.tsx  # Modal de recuperação de senha
├── styles/
│   └── globals.css         # Todos os estilos (baseado no login.css original)
├── next.config.js
├── tsconfig.json
└── package.json
```

## Como rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

## Rotas

| Rota              | Descrição                                      |
|-------------------|------------------------------------------------|
| `/login`          | Tela principal de login                        |
| `/register`       | Cadastro (requer token de admin no header)     |
| `/reset-password` | Redefinição de senha (requer `?token=` na URL) |

## Endpoints da API

| Ação              | Método | URL                                              |
|-------------------|--------|--------------------------------------------------|
| Login             | POST   | `https://api.stamflow.com.br/auth/login`         |
| Esqueci senha     | POST   | `https://api.stamflow.com.br/auth/forgot-password` |
| Redefinir senha   | POST   | `https://api.stamflow.com.br/auth/reset-password` |
| Cadastrar usuário | POST   | `https://api.stamflow.com.br/auth/register`      |

## Redirecionamento pós-login

| Tipo de usuário         | Destino                                    |
|-------------------------|--------------------------------------------|
| `manager`               | `https://gestor.stamflow.com.br/`          |
| `client` com empresa    | `https://painel-empregado.stamflow.com.br/`|
| `client` sem empresa    | `https://painel.stamflow.com.br/`          |
