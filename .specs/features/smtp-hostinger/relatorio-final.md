# Relatório Final — SMTP-01: Configuração SMTP Hostinger para NeuroLearn

**Projeto:** NeuroLearn  
**Feature ID:** SMTP-01  
**Data:** 2026-06-07  
**Status:** Documentação completa — Pronto para execução pelo desenvolvedor  
**Executado por:** Claude Code (tlc-spec-driven pipeline)

---

## Resumo Executivo

A configuração de SMTP personalizado da Hostinger para o NeuroLearn é uma **alteração 100% no painel do Supabase e no DNS** — zero linhas de código foram modificadas no aplicativo. O fluxo de autenticação (Magic Link via `signInWithOtp()`, callback PKCE, sessão via `exchangeCodeForSession()`) permanece intacto e gerenciado exclusivamente pelo Supabase Auth.

**Resultado esperado após configuração:**

- E-mails enviados de `NeuroLearn <noreply@neurolearn.tech>` em vez de `no-reply@mail.supabase.io`
- Templates com branding completo (logo, gradiente #7c3aed → #06b6d4, CTA claro)
- Entregabilidade máxima via SPF + DKIM + DMARC configurados

---

## 1. Configuração Atual Encontrada

### Fluxo de Autenticação

O NeuroLearn usa exclusivamente **Supabase Auth com Magic Link (passwordless)**. Não há senhas de usuário.

```
[Usuário]
  └─► src/app/auth/login/page.tsx
        └─► supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin + '/auth/callback' }})
              └─► Supabase gera token PKCE (code_verifier + code_challenge)
                    └─► Supabase envia e-mail via SMTP padrão (mail.supabase.io)
                          └─► Usuário clica no link → /auth/callback?code=<pkce_code>
                                └─► src/app/auth/callback/route.ts
                                      └─► supabase.auth.exchangeCodeForSession(code)
                                            └─► Sessão criada → redirect /dashboard
```

### Arquivos de Autenticação (Inalterados)

| Arquivo                                                          | Papel                                              |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [src/app/auth/login/page.tsx](src/app/auth/login/page.tsx)       | Formulário de login — chama `signInWithOtp()`      |
| [src/app/auth/signup/page.tsx](src/app/auth/signup/page.tsx)     | Formulário de cadastro — mesmo fluxo Magic Link    |
| [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) | Route handler — troca `?code=` por sessão (PKCE)   |
| [middleware.ts](middleware.ts)                                   | Proteção de rotas — redireciona para `/auth/login` |
| [src/lib/supabase/server.ts](src/lib/supabase/server.ts)         | Client SSR com chunked cookie management           |
| [src/lib/auth/errors.ts](src/lib/auth/errors.ts)                 | Mapeamento de erros para PT-BR                     |

### SMTP Atual (Antes da Configuração)

| Campo           | Valor atual                                 |
| --------------- | ------------------------------------------- |
| SMTP Provider   | Supabase padrão (`mail.supabase.io`)        |
| Remetente       | `no-reply@mail.supabase.io`                 |
| SPF/DKIM/DMARC  | Supabase — não do domínio neurolearn.tech   |
| Templates       | Supabase padrão (sem branding)              |
| Entregabilidade | Média (sem autenticação de domínio próprio) |

---

## 2. Alterações Realizadas

### Código da Aplicação

**Zero linhas de código modificadas.** Esta configuração é exclusivamente no painel do Supabase e no DNS.

### Artefatos Produzidos

| Arquivo                                                        | Tipo          | Finalidade                                                                        |
| -------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------- |
| `.specs/features/smtp-hostinger/spec.md`                       | Especificação | Requisitos, fluxos, user stories, traceability                                    |
| `.specs/features/smtp-hostinger/tasks.md`                      | Tarefas       | Pipeline de execução T1-T5                                                        |
| `.specs/features/smtp-hostinger/guia-supabase.md`              | Guia          | 7 partes: conta email → SMTP → rate limit → URLs → templates → vars → verificação |
| `.specs/features/smtp-hostinger/guia-dns.md`                   | Guia          | SPF + DKIM + DMARC com sintaxe exata, estratégia progressiva e cronograma         |
| `.specs/features/smtp-hostinger/checklist-validacao.md`        | Checklist     | 8 blocos de validação pós-configuração                                            |
| `.specs/features/smtp-hostinger/templates/magic-link.html`     | Template HTML | E-mail de login (Magic Link) com branding NeuroLearn                              |
| `.specs/features/smtp-hostinger/templates/confirm-signup.html` | Template HTML | E-mail de cadastro com branding + preview de features                             |

---

## 3. Variáveis Necessárias

### Variáveis de Ambiente (Existentes — Sem Alteração)

Nenhuma variável nova no código. O SMTP é configurado diretamente no painel do Supabase.

| Variável                        | Localização                      | Status    |
| ------------------------------- | -------------------------------- | --------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `.env.local`                     | Já existe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local`                     | Já existe |
| `SUPABASE_SERVICE_ROLE_KEY`     | `.env.local` (nunca no frontend) | Já existe |

### Credenciais SMTP (Fora do Código)

| Dado                                | Onde guardar                                | Status     |
| ----------------------------------- | ------------------------------------------- | ---------- |
| `noreply@neurolearn.tech` (usuário) | Painel Supabase → Auth → SMTP Settings      | Configurar |
| Senha da conta de e-mail Hostinger  | Gerenciador de senhas (1Password/Bitwarden) | Criar      |

> ⚠️ A senha SMTP **nunca** deve aparecer em código, commits, variáveis de ambiente do servidor de CI/CD públicas, ou qualquer arquivo versionado.

---

## 4. Configurações Necessárias no Painel do Supabase

**URL:** https://supabase.com/dashboard/project/jijlesgsusxyldmwgnbq/auth/settings

### SMTP Settings

| Campo              | Valor                        |
| ------------------ | ---------------------------- |
| Enable Custom SMTP | ✅ ON                        |
| Sender Name        | `NeuroLearn`                 |
| Sender Email       | `noreply@neurolearn.tech`    |
| SMTP Host          | `smtp.hostinger.com`         |
| SMTP Port          | `465` (fallback: `587`)      |
| SMTP User          | `noreply@neurolearn.tech`    |
| SMTP Pass          | `[senha da conta Hostinger]` |

### Email Settings

| Campo                           | Valor               |
| ------------------------------- | ------------------- |
| Enable email confirmations      | ✅ ON (recomendado) |
| Secure email change             | ✅ ON               |
| Minimum interval between emails | `60` segundos       |
| OTP Expiry                      | `3600` segundos     |

### URL Configuration

| Campo         | Valor                                   |
| ------------- | --------------------------------------- |
| Site URL      | `https://neurolearn.tech`               |
| Redirect URLs | `https://neurolearn.tech/auth/callback` |
| Redirect URLs | `http://localhost:3003/auth/callback`   |

### Email Templates

| Template       | Subject                               | HTML                            |
| -------------- | ------------------------------------- | ------------------------------- |
| Magic Link     | `🔐 Seu link de acesso ao NeuroLearn` | `templates/magic-link.html`     |
| Confirm signup | `✅ Confirme sua conta no NeuroLearn` | `templates/confirm-signup.html` |

---

## 5. Configurações Necessárias no Painel da Hostinger

### Criação de Conta de E-mail

**URL:** https://hpanel.hostinger.com → Emails → Gerenciar

| Campo           | Valor                            |
| --------------- | -------------------------------- |
| Endereço        | `noreply@neurolearn.tech`        |
| Tipo            | Caixa de entrada (não alias)     |
| Senha           | Forte, única, ≥16 caracteres     |
| SMTP habilitado | ✅ (padrão nas contas Hostinger) |

### Configurações SMTP do Hostinger

| Parâmetro      | Valor                                  |
| -------------- | -------------------------------------- |
| Servidor SMTP  | `smtp.hostinger.com`                   |
| Porta SSL      | `465`                                  |
| Porta STARTTLS | `587`                                  |
| Autenticação   | Usuário e senha (credenciais da conta) |

### Autenticação DKIM

**URL:** Hostinger → Emails → `noreply@neurolearn.tech` → Configurações → Autenticação

- [ ] Ativar DKIM (se não estiver ativo)
- [ ] Copiar o valor do registro DNS DKIM gerado
- [ ] Adicionar ao DNS Zone (ver guia-dns.md)

---

## 6. Configurações de DNS Necessárias

**URL:** https://hpanel.hostinger.com/domain/neurolearn.tech/dns

| Tipo  | Nome                 | Valor                                                      |
| ----- | -------------------- | ---------------------------------------------------------- |
| `TXT` | `@`                  | `v=spf1 include:_spf.hostinger.com ~all`                   |
| `TXT` | `default._domainkey` | `v=DKIM1; k=rsa; p=<chave-gerada-hostinger>`               |
| `TXT` | `_dmarc`             | `v=DMARC1; p=none; rua=mailto:privacidade@neurolearn.tech` |

**Cronograma de evolução DMARC:**

- Semana 1-2: `p=none` (monitoramento)
- Semana 3+: `p=quarantine`
- Mês 2+: `p=reject`

---

## 7. Resultados dos Testes

### Resultados Esperados Após Configuração Completa

| Teste                | Método                                     | Resultado Esperado                     |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| E-mail de teste SMTP | Supabase → "Send test email"               | Chega em <2min na caixa de entrada     |
| Remetente correto    | Verificação manual                         | `NeuroLearn <noreply@neurolearn.tech>` |
| SPF Pass             | mxtoolbox.com/spf.aspx                     | `Pass`                                 |
| DKIM Valid           | mxtoolbox.com/dkim.aspx                    | `Valid` / `Signature verified`         |
| DMARC Found          | mxtoolbox.com/dmarc.aspx                   | `Policy found`                         |
| Entregabilidade      | mail-tester.com                            | Score ≥ 9/10                           |
| Magic Link Login     | Teste manual end-to-end                    | E-mail → link → `/dashboard` ✅        |
| Confirm Signup       | Teste manual (se email confirm habilitado) | E-mail → link → `/dashboard` ✅        |

### Status Atual dos Testes Automatizados

> Os testes automatizados validam o fluxo de auth no app — eles continuam válidos pois **nenhum código foi alterado**.

```bash
npm run test:unit   # Todos os testes unitários devem passar sem alteração
npm run test:e2e    # Testes E2E de auth continuam válidos
```

**Baseline (antes desta configuração):** 83 testes passando  
**Esperado (após configuração):** 83 testes passando (sem regressão)

---

## 8. Restrições de Segurança Respeitadas

| Restrição                                 | Status                                                |
| ----------------------------------------- | ----------------------------------------------------- |
| Não implementar autenticação própria      | ✅ Respeitado — Supabase Auth intacto                 |
| Não substituir Supabase Auth              | ✅ Respeitado — zero código alterado                  |
| Não gerar tokens manualmente              | ✅ Respeitado — tokens gerenciados pelo Supabase      |
| Não criar sistema próprio de OTP          | ✅ Respeitado — app usa Magic Link Supabase           |
| Não criar sistema próprio de sessão       | ✅ Respeitado — sessão via `exchangeCodeForSession()` |
| Não expor chaves privadas                 | ✅ Respeitado — SMTP Pass nunca no código             |
| Não utilizar SERVICE_ROLE_KEY no frontend | ✅ Respeitado — permanece apenas em `.env.local`      |
| `.env.local` nunca commitado              | ✅ Protegido por `.gitignore`                         |

---

## 9. Riscos e Mitigações

| Risco                             | Probabilidade | Impacto | Mitigação                                                                 |
| --------------------------------- | ------------- | ------- | ------------------------------------------------------------------------- |
| DNS propagação lenta              | Alta          | Médio   | Testar com antecedência; manter SMTP Supabase como fallback até confirmar |
| E-mails em spam durante transição | Média         | Alto    | Implementar DMARC `p=none` primeiro; verificar via mail-tester.com        |
| Porta 465 bloqueada               | Baixa         | Médio   | Fallback imediato para porta 587 (STARTTLS)                               |
| Limite de envio Hostinger         | Baixa         | Alto    | Verificar plano atual; upgrade se necessário ao escalar                   |
| Senha SMTP comprometida           | Muito baixa   | Crítico | Rotacionar senha imediatamente; atualizar no painel Supabase              |
| DKIM chave inválida               | Baixa         | Alto    | Copiar chave completa; verificar via mxtoolbox antes de ativar DMARC      |

---

## 10. Próximos Passos — Ordem de Execução

Execute nesta sequência para minimizar risco de downtime:

```
PASSO 1: Hostinger
  a) Criar conta noreply@neurolearn.tech
  b) Anotar senha em gerenciador de senhas
  c) Ativar DKIM e copiar registro DNS

PASSO 2: DNS (aguardar propagação após cada adição)
  a) Adicionar registro SPF (TXT @)
  b) Adicionar registro DKIM (TXT default._domainkey)
  c) Adicionar registro DMARC p=none (TXT _dmarc)

PASSO 3: Supabase Dashboard
  a) Ativar Custom SMTP com credenciais Hostinger
  b) Configurar URL configuration + redirect URLs
  c) Colar templates HTML (Magic Link + Confirm Signup)
  d) Enviar e-mail de teste via "Send test email"

PASSO 4: Validação
  a) Verificar SPF/DKIM/DMARC via mxtoolbox.com
  b) Testar fluxo Magic Link completo (login → e-mail → dashboard)
  c) Testar fluxo Signup (se email confirmations ativo)
  d) Verificar pontuação mail-tester.com ≥ 9/10
  e) Executar npm run test:e2e para confirmar sem regressão

PASSO 5: Monitoramento (semana 2+)
  a) Verificar relatórios DMARC recebidos
  b) Atualizar DMARC p=none → p=quarantine
  c) Após 1 mês sem falsos positivos → p=reject
```

---

## Referências

| Documento               | Localização                                                    |
| ----------------------- | -------------------------------------------------------------- |
| Especificação           | `.specs/features/smtp-hostinger/spec.md`                       |
| Guia Supabase           | `.specs/features/smtp-hostinger/guia-supabase.md`              |
| Guia DNS                | `.specs/features/smtp-hostinger/guia-dns.md`                   |
| Checklist Validação     | `.specs/features/smtp-hostinger/checklist-validacao.md`        |
| Template Magic Link     | `.specs/features/smtp-hostinger/templates/magic-link.html`     |
| Template Confirm Signup | `.specs/features/smtp-hostinger/templates/confirm-signup.html` |
