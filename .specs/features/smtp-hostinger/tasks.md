# SMTP-01 — Tasks

**Última atualização:** 2026-06-07  
**Responsável:** JadsonCardoso  
**Paralelismo:** T1 + T2 em paralelo; T3 depende de T1; T4 depende de T1+T2; T5 depende de T3+T4

---

## Dependências

```
T1 ──────────────────────────────────────► T3 ──► T5
T2 ──────────────────────────────────────► T4 ──► T5
```

---

## T1 — Guia de Configuração Supabase SMTP [P]

**Status:** Done ✅  
**O que:** Produzir guia passo a passo para configurar SMTP Hostinger no painel do Supabase  
**Onde:** `.specs/features/smtp-hostinger/guia-supabase.md`  
**Requer:** Análise da spec.md  
**Done when:** Guia cobre todos os campos de configuração com valores exatos

---

## T2 — Templates HTML de E-mail [P]

**Status:** Done ✅  
**O que:** Escrever templates HTML responsivos com branding NeuroLearn para Magic Link e Confirm Signup  
**Onde:** `.specs/features/smtp-hostinger/templates/`  
**Requer:** Análise de branding da login page (cores, logo, tom)  
**Done when:** 2 templates HTML prontos para colar no Supabase dashboard

---

## T3 — Guia de Configuração DNS

**Status:** Done ✅  
**O que:** Produzir guia detalhado de DNS: SPF, DKIM, DMARC para `neurolearn.tech`  
**Onde:** `.specs/features/smtp-hostinger/guia-dns.md`  
**Requer:** T1 (entender qual SMTP está sendo usado)  
**Done when:** Registros DNS completos com sintaxe exata + instruções de onde configurar na Hostinger  
**Entregue:** `guia-dns.md` — SPF/DKIM/DMARC com valores exatos, estratégia progressiva, cronograma, troubleshooting

---

## T4 — Checklist de Validação

**Status:** Done ✅  
**O que:** Produzir checklist completo para o usuário validar a configuração após aplicar  
**Onde:** `.specs/features/smtp-hostinger/checklist-validacao.md`  
**Requer:** T1 + T2 (para saber o que validar)  
**Done when:** Checklist cobre todos os success criteria da spec  
**Entregue:** `checklist-validacao.md` — 8 blocos: SMTP, DNS (SPF/DKIM/DMARC), Templates, URLs, E2E, Segurança, Testes automatizados, Rate limiting

---

## T5 — Relatório Final

**Status:** Done ✅  
**O que:** Consolidar configuração atual encontrada, alterações realizadas, vars necessárias e resultados  
**Onde:** `.specs/features/smtp-hostinger/relatorio-final.md`  
**Requer:** T1 + T2 + T3 + T4  
**Done when:** Relatório responde a todos os 10 itens do brief original  
**Entregue:** `relatorio-final.md` — 10 seções: config atual, alterações, variáveis, Supabase, Hostinger, DNS, resultados de teste, restrições de segurança, riscos, próximos passos
