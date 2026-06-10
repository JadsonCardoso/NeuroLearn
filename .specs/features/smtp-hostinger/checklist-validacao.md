# Checklist de Validação — SMTP Hostinger + DNS NeuroLearn

**Domínio:** `neurolearn.tech`  
**Projeto Supabase:** `jijlesgsusxyldmwgnbq`  
**Data de configuração:** _preencher ao executar_

Use este checklist após seguir os guias `guia-supabase.md` e `guia-dns.md`. Marque cada item ao validar.

---

## PRÉ-REQUISITO — Antes de Iniciar

- [ ] Conta de e-mail `noreply@neurolearn.tech` criada no Hostinger
- [ ] Senha forte anotada em gerenciador de senhas (nunca em código)
- [ ] Domínio `neurolearn.tech` ativo e acessível via browser

---

## BLOCO 1 — Supabase SMTP

### 1.1 Configuração Salva

- [ ] Toggle "Enable Custom SMTP" está **ON**
- [ ] **Sender Name**: `NeuroLearn`
- [ ] **Sender Email**: `noreply@neurolearn.tech`
- [ ] **SMTP Host**: `smtp.hostinger.com`
- [ ] **SMTP Port**: `465` (ou `587` se 465 não funcionar)
- [ ] **SMTP User**: `noreply@neurolearn.tech`
- [ ] **SMTP Pass**: preenchida (verificar que não está em branco)

### 1.2 E-mail de Teste Supabase

- [ ] Clicar em **"Send test email"** no painel
- [ ] E-mail chegou na caixa de entrada (não spam)
- [ ] Remetente exibe: `NeuroLearn <noreply@neurolearn.tech>`
- [ ] Assunto e corpo apareceram corretamente

---

## BLOCO 2 — DNS

### 2.1 SPF

- [ ] Registro TXT no host `@` criado
- [ ] Valor contém `v=spf1 include:_spf.hostinger.com`
- [ ] Não existe mais de um registro `v=spf1` no domínio

**Verificar via:** https://mxtoolbox.com/spf.aspx → domínio: `neurolearn.tech`

- [ ] Resultado: **SPF Pass** ✅

### 2.2 DKIM

- [ ] Chave DKIM obtida do painel Hostinger (seção Autenticação)
- [ ] Registro TXT adicionado com nome `default._domainkey` (ou o prefixo indicado)
- [ ] Valor começa com `v=DKIM1; k=rsa; p=` e chave completa

**Verificar via:** https://mxtoolbox.com/dkim.aspx → domínio: `neurolearn.tech`, seletor: `default`

- [ ] Resultado: **DKIM Valid** ✅

### 2.3 DMARC

- [ ] Registro TXT adicionado com nome `_dmarc`
- [ ] Política inicial: `p=none` (fase de monitoramento)
- [ ] Endereço `rua=` configurado para receber relatórios

**Verificar via:** https://mxtoolbox.com/dmarc.aspx → domínio: `neurolearn.tech`

- [ ] Resultado: **DMARC Policy Found** ✅

---

## BLOCO 3 — Templates de E-mail

### 3.1 Template Magic Link

- [ ] Template HTML de `templates/magic-link.html` colado no painel Supabase
- [ ] Subject configurado: `🔐 Seu link de acesso ao NeuroLearn`
- [ ] Preview exibe: logo, gradiente roxo/cyan, CTA "🚀 Acessar NeuroLearn"
- [ ] Link de fallback (texto puro) visível abaixo do botão
- [ ] Aviso de expiração (1 hora) visível
- [ ] Footer com link para `/politica-de-privacidade`

### 3.2 Template Confirm Signup

- [ ] Template HTML de `templates/confirm-signup.html` colado no painel Supabase
- [ ] Subject configurado: `✅ Confirme sua conta no NeuroLearn`
- [ ] Preview exibe: badge "🎉 Bem-vindo(a)!", CTA "✅ Confirmar e-mail e entrar"
- [ ] Features preview (🧠 SM-2, ⚡ Aprendizado Ativo, 📈 Métricas) visíveis

---

## BLOCO 4 — URL Configuration

- [ ] **Site URL**: `https://neurolearn.tech`
- [ ] Redirect URL adicionada: `https://neurolearn.tech/auth/callback`
- [ ] Redirect URL adicionada: `http://localhost:3003/auth/callback`

---

## BLOCO 5 — Fluxo de Autenticação End-to-End

Execute este teste completo com uma conta de e-mail real.

### 5.1 Teste de Login (Magic Link)

- [ ] Acessar `http://localhost:3003/auth/login` (ou URL de produção)
- [ ] Preencher e-mail e clicar em "Entrar com Magic Link"
- [ ] E-mail recebido em **menos de 2 minutos**
- [ ] Remetente: `NeuroLearn <noreply@neurolearn.tech>`
- [ ] Template com branding correto
- [ ] Clicar no link do e-mail
- [ ] Redirecionado para `/auth/callback` → `/dashboard` ✅
- [ ] Sessão válida (usuário autenticado no dashboard)

### 5.2 Teste de Cadastro (Confirm Signup)

> Aplicável apenas se "Enable email confirmations" estiver ON no Supabase

- [ ] Acessar `http://localhost:3003/auth/signup`
- [ ] Preencher e-mail novo e clicar em "Criar conta"
- [ ] E-mail de confirmação recebido
- [ ] Remetente: `NeuroLearn <noreply@neurolearn.tech>`
- [ ] Template de boas-vindas com branding
- [ ] Clicar em "✅ Confirmar e-mail e entrar"
- [ ] Redirecionado para `/dashboard` ✅

### 5.3 Verificação de Entregabilidade

- [ ] Acessar https://www.mail-tester.com
- [ ] Copiar o endereço de teste fornecido
- [ ] Enviar um e-mail de autenticação real para esse endereço
- [ ] Pontuação ≥ **9/10** ✅

---

## BLOCO 6 — Segurança e Integridade

- [ ] Senha SMTP **não** está em nenhum arquivo do repositório
- [ ] `.env.local` **não** foi commitado (`.gitignore` protege)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` presente apenas em `.env.local` ou variáveis de ambiente do servidor
- [ ] Nenhuma linha de código de autenticação foi alterada nesta configuração
- [ ] `signInWithOtp()` permanece a única chamada de auth do frontend
- [ ] `/auth/callback` permanece usando `exchangeCodeForSession()`

---

## BLOCO 7 — Testes Automatizados (Regressão)

Execute após qualquer alteração de configuração:

```bash
npm run test:unit
npm run test:e2e
```

- [ ] `npm run test:unit` — todos os testes passando (target: 83/83 ou mais)
- [ ] `npm run test:e2e` — todos os testes E2E passando
- [ ] Nenhuma regressão introduzida

---

## BLOCO 8 — Rate Limiting

- [ ] **Minimum interval between emails**: `60` segundos configurado no Supabase
- [ ] **OTP Expiry**: `3600` segundos (1 hora)
- [ ] Testar: solicitar 2 links em menos de 60s → segundo deve ser bloqueado com mensagem de erro

---

## Resultado Final

Após completar todos os blocos:

| Bloco                          | Status                          |
| ------------------------------ | ------------------------------- |
| BLOCO 1 — Supabase SMTP        | ⬜ Pendente / ✅ OK / ❌ Falhou |
| BLOCO 2 — DNS                  | ⬜ Pendente / ✅ OK / ❌ Falhou |
| BLOCO 3 — Templates            | ⬜ Pendente / ✅ OK / ❌ Falhou |
| BLOCO 4 — URL Configuration    | ⬜ Pendente / ✅ OK / ❌ Falhou |
| BLOCO 5 — Fluxo End-to-End     | ⬜ Pendente / ✅ OK / ❌ Falhou |
| BLOCO 6 — Segurança            | ⬜ Pendente / ✅ OK / ❌ Falhou |
| BLOCO 7 — Testes Automatizados | ⬜ Pendente / ✅ OK / ❌ Falhou |
| BLOCO 8 — Rate Limiting        | ⬜ Pendente / ✅ OK / ❌ Falhou |

**Configuração aprovada para produção:** ⬜ SIM / ⬜ NÃO

---

## Próximos Passos (Após Validação)

1. **Após 2 semanas:** Verificar relatórios DMARC recebidos, atualizar `p=none` → `p=quarantine`
2. **Após 1 mês:** Atualizar DMARC para `p=reject` se sem falsos positivos
3. **Monitoramento contínuo:** Verificar logs de e-mail no Supabase Dashboard → Logs → Auth
