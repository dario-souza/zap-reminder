# ZapReminder - Landing Page

Landing page moderna para serviço de agendamento de mensagens no WhatsApp.

## Estrutura do Projeto

```
app/
├── page.tsx                 # Página principal com todos os componentes
├── layout.tsx              # Layout raiz com metadados
├── globals.css             # Estilos globais
components/
├── landing/                # Componentes da landing page
│   ├── header.tsx          # Navegação fixa
│   ├── hero.tsx            # Seção principal
│   ├── features.tsx        # Recursos do serviço
│   ├── how-it-works.tsx    # Como funciona
│   ├── pricing.tsx         # Planos e preços
│   ├── footer.tsx          # Rodapé
│   └── login-modal.tsx     # Modal de login/cadastro
└── ui/                     # Componentes shadcn/ui
```

## Integração com Backend

Para conectar com o backend, modifique os seguintes arquivos:

### 1. LoginModal (`components/landing/login-modal.tsx`)

Atualize a função `handleSubmit` para fazer chamadas à API:

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);
  
  const formData = new FormData(e.currentTarget);
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    onOpenChange(false);
    // Redirecionar para dashboard
  } catch (error) {
    // Mostrar erro
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Rotas da API (Next.js App Router)

Crie os endpoints em `app/api/`:

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── logout/route.ts
├── messages/
│   ├── route.ts           # CRUD mensagens
│   └── send/route.ts      # Envio imediato
└── contacts/
    └── route.ts           # CRUD contatos
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=
JWT_SECRET=
WHATSAPP_API_KEY=
```

## Componentes shadcn/ui Utilizados

- `button` - Botões
- `card` - Cards de conteúdo
- `input` - Campos de formulário
- `label` - Rótulos
- `dialog` - Modal de login
- `tabs` - Abas login/cadastro
- `separator` - Divisores
- `badge` - Badges de status
- `avatar` - Avatares de usuário
- `sheet` - Menu mobile
- `progress` - Barras de progresso

## Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Próximos Passos

1. [ ] Criar página de dashboard
2. [ ] Implementar autenticação JWT
3. [ ] Integrar API WhatsApp Business
4. [ ] Criar sistema de agendamento (cron jobs)
5. [ ] Adicionar notificações push
6. [ ] Implementar relatórios e analytics
