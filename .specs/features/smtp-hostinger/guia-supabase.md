# Guia — Configurar SMTP Hostinger no Supabase

**Projeto:** NeuroLearn (`jijlesgsusxyldmwgnbq`)  
**URL do painel:** https://supabase.com/dashboard/project/jijlesgsusxyldmwgnbq

---

## Pré-requisitos

Antes de configurar o Supabase, você precisa:

1. ✅ Ter o domínio `neurolearn.tech` na Hostinger
2. ✅ Criar a conta de e-mail `noreply@neurolearn.tech` no painel da Hostinger
3. ✅ Anotar a senha criada (use um gerenciador de senhas — nunca commite isso)

---

## PARTE 1 — Criar conta de e-mail na Hostinger

1. Acesse: **Hostinger → Hosting → Emails → Gerenciar**
2. Clique em **Criar conta de e-mail**
3. Preencha:
   - **Endereço:** `noreply`
   - **Domínio:** `neurolearn.tech`
   - **Senha:** (crie uma senha forte — mínimo 16 caracteres, com letras, números e símbolos)
4. Anote as configurações SMTP que serão exibidas:
   - **Servidor SMTP:** `smtp.hostinger.com`
   - **Porta SSL:** `465`
   - **Porta TLS:** `587`
5. Guarde a senha em local seguro (ex: 1Password, Bitwarden)

---

## PARTE 2 — Configurar SMTP no Supabase

**Caminho:** Supabase Dashboard → Authentication → Settings → SMTP Settings

### Passo a passo

1. Acesse: https://supabase.com/dashboard/project/jijlesgsusxyldmwgnbq/auth/settings
2. Role até a seção **"Custom SMTP"**
3. Ative o toggle **"Enable Custom SMTP"**
4. Preencha os campos:

| Campo            | Valor exato                        |
| ---------------- | ---------------------------------- |
| **Sender Name**  | `NeuroLearn`                       |
| **Sender Email** | `noreply@neurolearn.tech`          |
| **SMTP Host**    | `smtp.hostinger.com`               |
| **SMTP Port**    | `465`                              |
| **SMTP User**    | `noreply@neurolearn.tech`          |
| **SMTP Pass**    | `[senha criada no passo anterior]` |

> **Se a porta 465 não funcionar:** Tente `587` com STARTTLS habilitado.

5. Clique em **"Save"**
6. Clique em **"Send test email"** para verificar se a configuração está correta

---

## PARTE 3 — Configurar Rate Limiting de E-mail

**Caminho:** Authentication → Settings → Email

| Campo                               | Valor recomendado                  |
| ----------------------------------- | ---------------------------------- |
| **Enable email confirmations**      | ✅ ON (recomendado para segurança) |
| **Secure email change**             | ✅ ON                              |
| **Minimum interval between emails** | `60` segundos                      |
| **OTP Expiry**                      | `3600` segundos (1 hora, padrão)   |

> **Nota:** O `RATE_LIMIT.MIN_INTERVAL_SECONDS` do Supabase controla quantos e-mails podem ser enviados por usuário. O app já tem rate limiting próprio no middleware para proteger contra brute force.

---

## PARTE 4 — Configurar URL de Redirecionamento

**Caminho:** Authentication → URL Configuration

| Campo        | Valor                     |
| ------------ | ------------------------- |
| **Site URL** | `https://neurolearn.tech` |

Em **Redirect URLs**, adicione:

```
https://neurolearn.tech/auth/callback
http://localhost:3003/auth/callback
```

> **Importante:** Sem essas URLs na allowlist, o Supabase pode recusar o `emailRedirectTo` do `signInWithOtp()`.

---

## PARTE 5 — Configurar Templates de E-mail

**Caminho:** Authentication → Email Templates

Para cada template, clique em "Edit" e cole o HTML do arquivo correspondente:

| Template           | Arquivo HTML                    |
| ------------------ | ------------------------------- |
| **Magic Link**     | `templates/magic-link.html`     |
| **Confirm signup** | `templates/confirm-signup.html` |

### Como editar um template

1. Clique no template desejado
2. Clique em **"Edit"**
3. No campo **"Subject"**, preencha conforme especificado abaixo
4. No campo **"Body"**, cole o HTML completo do arquivo de template
5. Clique em **"Save"**
6. Clique em **"Preview"** para verificar a aparência

### Subjects recomendados

| Template       | Subject                                     |
| -------------- | ------------------------------------------- |
| Magic Link     | `🔐 Seu link de acesso ao NeuroLearn`       |
| Confirm signup | `✅ Confirme sua conta no NeuroLearn`       |
| Change email   | `📧 Confirme seu novo e-mail no NeuroLearn` |

---

## PARTE 6 — Variáveis de Template Supabase

Ao editar templates, use estas variáveis (são substituídas automaticamente pelo Supabase):

| Variável                 | Descrição                                               |
| ------------------------ | ------------------------------------------------------- |
| `{{ .ConfirmationURL }}` | Link de acesso/confirmação completo                     |
| `{{ .Email }}`           | E-mail do usuário                                       |
| `{{ .Token }}`           | Token de 6 dígitos (OTP numérico — não usado neste app) |
| `{{ .TokenHash }}`       | Hash do token                                           |
| `{{ .SiteURL }}`         | URL do site (`https://neurolearn.tech`)                 |
| `{{ .RedirectTo }}`      | URL de redirecionamento após auth                       |

---

## PARTE 7 — Verificar Configuração

Após salvar, envie um e-mail de teste:

1. Na seção **Custom SMTP**, clique em **"Send test email"**
2. Digite seu e-mail pessoal
3. Verifique:
   - ✅ E-mail chegou na caixa de entrada (não spam)
   - ✅ Remetente exibe `NeuroLearn <noreply@neurolearn.tech>`
   - ✅ Template HTML aparece corretamente

---

## Troubleshooting

| Problema                          | Causa provável      | Solução                                                          |
| --------------------------------- | ------------------- | ---------------------------------------------------------------- |
| "Authentication failed"           | Senha errada        | Verificar senha da conta Hostinger                               |
| "Connection refused" na porta 465 | Firewall Hostinger  | Tentar porta 587                                                 |
| "TLS negotiation failed"          | Porta errada        | Porta 465 = SSL implícito; 587 = STARTTLS                        |
| E-mail vai para spam              | DNS não configurado | Configurar SPF + DKIM (guia-dns.md)                              |
| "Relay access denied"             | IP não autorizado   | Contatar Hostinger suporte                                       |
| Template em branco                | Variável incorreta  | Verificar `{{ .ConfirmationURL }}` (com pontos, não underscores) |
