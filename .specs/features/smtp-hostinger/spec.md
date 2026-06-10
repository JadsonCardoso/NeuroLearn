# SMTP-01 — Configurar SMTP Hostinger para Autenticação Supabase

**ID:** SMTP-01  
**Status:** In Progress  
**Complexidade:** Large  
**Data:** 2026-06-07  
**Prioridade:** P1 — Entregabilidade e branding

---

## Problem Statement

O NeuroLearn usa Supabase Auth com Magic Link. Os e-mails de autenticação são enviados pelo SMTP padrão do Supabase (`no-reply@mail.supabase.io`), o que gera três problemas:

1. **Entregabilidade ruim**: Sem SPF/DKIM/DMARC do domínio próprio, e-mails caem no spam
2. **Sem branding**: O remetente aparece como Supabase, não como NeuroLearn
3. **Confiança do usuário**: E-mails de domínio desconhecido geram desconfiança no Magic Link

## Goals

- [x] Analisar configuração atual de Auth e identificar todos os fluxos de e-mail
- [ ] Configurar SMTP da Hostinger no painel do Supabase
- [ ] Configurar DNS: SPF + DKIM + DMARC para `neurolearn.tech`
- [ ] Criar templates de e-mail com branding NeuroLearn
- [ ] Validar que Supabase continua gerenciando tokens, sessões e validação
- [ ] Produzir relatório completo de configuração

## Out of Scope

| Item                                                   | Razão                              |
| ------------------------------------------------------ | ---------------------------------- |
| Implementar auth própria                               | Proibido — Supabase Auth permanece |
| Gerar tokens manualmente                               | Proibido                           |
| OTP numérico                                           | Não usado — app usa Magic Link     |
| Recuperação de senha                                   | App não usa senhas (passwordless)  |
| OAuth Google/GitHub                                    | Fase posterior                     |
| Sistema de e-mail transacional (pedidos, notificações) | Escopo separado                    |

---

## Configuração Atual (Resultado da Análise)

### Fluxo de Autenticação

```
[Login page]
  └─► supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin/auth/callback }})
        └─► Supabase gera token PKCE
              └─► Supabase envia e-mail (SMTP atual: mail.supabase.io)
                    └─► Usuário clica no link
                          └─► /auth/callback?code=<pkce_code>
                                └─► exchangeCodeForSession(code) → sessão criada
                                      └─► redirect /dashboard
```

### Arquivos Relevantes

| Arquivo                          | Papel                                                           |
| -------------------------------- | --------------------------------------------------------------- |
| `src/app/auth/login/page.tsx`    | Chama `signInWithOtp()` — fluxo Magic Link                      |
| `src/app/auth/signup/page.tsx`   | Chama `signInWithOtp({ shouldCreateUser: true })` — mesmo fluxo |
| `src/app/auth/callback/route.ts` | Recebe `?code=` e troca por sessão (PKCE)                       |
| `middleware.ts`                  | Protege rotas; redireciona unauthenticated para `/auth/login`   |
| `src/lib/supabase/server.ts`     | Client SSR com cookie management                                |
| `src/lib/auth/errors.ts`         | Mapeamento de erros de auth para PT-BR                          |

### Templates de E-mail Usados pelo Supabase

| Template           | Trigger                                                               | Status atual                   |
| ------------------ | --------------------------------------------------------------------- | ------------------------------ |
| **Magic Link**     | `signInWithOtp()` (login + signup)                                    | Supabase padrão — sem branding |
| **Confirm signup** | `signInWithOtp({ shouldCreateUser: true })` se confirmação habilitada | Supabase padrão                |
| **Change email**   | Futuro uso                                                            | Supabase padrão                |
| **Reset password** | Não usado (app passwordless)                                          | N/A                            |

---

## User Stories

### SM-01-A: Remetente com domínio próprio

**Como** usuário do NeuroLearn,  
**Quero** receber e-mails de `noreply@neurolearn.tech`,  
**Para que** eu reconheça o remetente como confiável e o link não caia no spam.

**Critérios:**

1. E-mails enviados com `From: NeuroLearn <noreply@neurolearn.tech>`
2. SPF, DKIM e DMARC configurados para `neurolearn.tech`
3. E-mail não cai em spam no Gmail, Outlook e Yahoo

---

### SM-01-B: Templates com branding NeuroLearn

**Como** usuário recebendo o Magic Link,  
**Quero** ver o logo, nome e cores do NeuroLearn no e-mail,  
**Para que** o e-mail pareça legítimo e profissional.

**Critérios:**

1. Template inclui: logo texto "NeuroLearn", gradiente primário (#7c3aed → #06b6d4)
2. Mensagem clara com CTA: "Acessar NeuroLearn"
3. Expiração do link indicada (5 minutos — padrão Supabase)
4. Footer com link para `/politica-de-privacidade`
5. Fallback texto puro disponível (acessibilidade)

---

### SM-01-C: Supabase continua gerenciando autenticação

**Como** desenvolvedor,  
**Quero** que apenas o transporte SMTP seja alterado,  
**Para que** toda a lógica de token, sessão e segurança permaneça no Supabase.

**Critérios:**

1. Nenhum código de auth alterado no app
2. `signInWithOtp()` continua sendo a única chamada de auth do frontend
3. `/auth/callback` continua usando `exchangeCodeForSession()`
4. Supabase continua gerando e validando todos os tokens
5. `SERVICE_ROLE_KEY` nunca exposta ao frontend

---

## Configurações Necessárias

### Supabase Dashboard

**Localização:** Authentication → Settings → SMTP Settings

| Campo                           | Valor                           |
| ------------------------------- | ------------------------------- |
| Enable Custom SMTP              | ✅ ON                           |
| Sender Name                     | `NeuroLearn`                    |
| Sender Email                    | `noreply@neurolearn.tech`       |
| SMTP Host                       | `smtp.hostinger.com`            |
| SMTP Port                       | `465` (SSL) ou `587` (STARTTLS) |
| SMTP User                       | `noreply@neurolearn.tech`       |
| SMTP Pass                       | `[senha da conta de e-mail]`    |
| Minimum interval between emails | `60` segundos (recomendado)     |

**Localização:** Authentication → Email Templates

| Template       | Deve ser atualizado        |
| -------------- | -------------------------- |
| Magic Link     | ✅ Sim — branding completo |
| Confirm signup | ✅ Sim — branding básico   |
| Change email   | ⚠️ Opcional                |
| Reset password | ⚠️ Opcional (app não usa)  |

**Localização:** Authentication → URL Configuration

| Campo                     | Valor                                                   |
| ------------------------- | ------------------------------------------------------- |
| Site URL                  | `https://neurolearn.tech`                               |
| Redirect URLs (adicionar) | `http://localhost:3003/auth/callback` (desenvolvimento) |
| Redirect URLs (adicionar) | `https://neurolearn.tech/auth/callback` (produção)      |

---

### Hostinger — Conta de E-mail

**Pré-requisito:** Domínio `neurolearn.tech` deve estar no Hostinger (ou DNS apontado para lá)

| Configuração          | Valor                                |
| --------------------- | ------------------------------------ |
| Criar conta de e-mail | `noreply@neurolearn.tech`            |
| Senha                 | Forte e única (mínimo 16 caracteres) |
| SMTP habilitado       | ✅                                   |
| Limite de envio       | Verificar plano atual                |

---

### DNS — Registros Obrigatórios

**Localização:** Hostinger → DNS Zone ou registrador do domínio

#### SPF (Sender Policy Framework)

```
Tipo: TXT
Nome: @  (ou neurolearn.tech.)
Valor: v=spf1 include:_spf.hostinger.com ~all
TTL: 3600
```

> ⚠️ Se já existe um registro SPF, adicionar `include:_spf.hostinger.com` ao existente.
> Nunca duplicar a diretiva `v=spf1`.

#### DKIM (DomainKeys Identified Mail)

O DKIM é gerado automaticamente pelo Hostinger ao configurar o domínio de e-mail.

**Como obter:**

1. Hostinger → Hosting → Email → Configurações avançadas
2. Ou: Hostinger → Gerenciar e-mail → Autenticação → DKIM
3. Copiar o par chave pública gerado

```
Tipo: TXT
Nome: default._domainkey.neurolearn.tech  (ou o prefixo indicado pelo Hostinger)
Valor: v=DKIM1; k=rsa; p=<CHAVE_PÚBLICA_GERADA_PELO_HOSTINGER>
TTL: 3600
```

#### DMARC (Domain-based Message Authentication)

```
Tipo: TXT
Nome: _dmarc.neurolearn.tech
Valor: v=DMARC1; p=quarantine; pct=100; rua=mailto:privacidade@neurolearn.tech; aspf=r; adkim=r
TTL: 3600
```

> **Política progressiva recomendada:**
>
> - Fase 1 (primeiras 2 semanas): `p=none` — apenas monitorar
> - Fase 2 (semana 3+): `p=quarantine` — mover falhas para spam
> - Fase 3 (1+ mês): `p=reject` — rejeitar falhas

---

## Riscos

| Risco                              | Probabilidade | Impacto | Mitigação                                                       |
| ---------------------------------- | ------------- | ------- | --------------------------------------------------------------- |
| DNS propagação lenta (até 48h)     | Alta          | Médio   | Configurar com antecedência; manter SMTP Supabase como fallback |
| Limite de envio Hostinger excedido | Baixa         | Alto    | Verificar plano; considerar upgrade se escalar                  |
| E-mails em spam durante transição  | Média         | Alto    | Testar antes de publicar; implementar DMARC `p=none` primeiro   |
| Senha SMTP exposta                 | Baixa         | Crítico | Nunca commitar; usar apenas painel Supabase                     |
| DKIM chave inválida                | Baixa         | Alto    | Verificar formato exato; usar ferramenta online de validação    |
| Supabase não aceita porta 465      | Baixa         | Médio   | Fallback para porta 587 com STARTTLS                            |

---

## Requirement Traceability

| Req ID    | Story                               | Configuração                 | Status  |
| --------- | ----------------------------------- | ---------------------------- | ------- |
| SM-01-A-1 | Remetente domínio próprio           | Supabase: Sender Email       | Pending |
| SM-01-A-2 | SPF configurado                     | DNS: TXT @neurolearn.tech    | Pending |
| SM-01-A-3 | DKIM configurado                    | DNS: TXT default.\_domainkey | Pending |
| SM-01-A-4 | DMARC configurado                   | DNS: TXT \_dmarc             | Pending |
| SM-01-B-1 | Template com branding               | Supabase: Email Templates    | Pending |
| SM-01-B-2 | CTA claro                           | Template HTML                | Pending |
| SM-01-B-3 | Expiração indicada                  | Template HTML                | Pending |
| SM-01-B-4 | Footer com política                 | Template HTML                | Pending |
| SM-01-C-1 | Zero código alterado                | Verificação                  | Pending |
| SM-01-C-2 | signInWithOtp() inalterado          | Verificação                  | Pending |
| SM-01-C-3 | exchangeCodeForSession() inalterado | Verificação                  | Pending |

---

## Success Criteria

- [ ] E-mails chegam na caixa de entrada (não spam) em Gmail, Outlook
- [ ] Remetente exibe `NeuroLearn <noreply@neurolearn.tech>`
- [ ] Magic Link funciona: clicar → `/auth/callback` → `/dashboard`
- [ ] SPF: `pass` verificado via mxtoolbox.com
- [ ] DKIM: `pass` verificado via mxtoolbox.com
- [ ] DMARC: `p=quarantine` ativo após período de monitoramento
- [ ] Templates exibem branding correto
- [ ] Nenhuma linha de código de auth foi alterada
- [ ] Testes E2E continuam 83/83 passando
