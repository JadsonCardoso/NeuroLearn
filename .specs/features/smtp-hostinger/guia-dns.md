# Guia — Configurar DNS para E-mail NeuroLearn

**Domínio:** `neurolearn.tech`  
**Objetivo:** Garantir entregabilidade e autenticidade dos e-mails enviados via Hostinger SMTP  
**Registros obrigatórios:** SPF · DKIM · DMARC

---

## Por que configurar DNS para e-mail?

Sem SPF/DKIM/DMARC, os e-mails enviados de `noreply@neurolearn.tech` via Hostinger SMTP:

- Caem em spam no Gmail, Outlook e Yahoo
- Podem ser rejeitados silenciosamente
- Aparecem como "não verificado" no cliente de e-mail
- Ficam vulneráveis a spoofing (alguém fingir ser seu domínio)

Os três registros trabalham em camadas:

```
SPF   → "Quais servidores podem enviar e-mail por mim?"
DKIM  → "O Hostinger assina as mensagens com minha chave privada"
DMARC → "O que fazer quando SPF ou DKIM falham?"
```

---

## Onde Configurar

**Painel Hostinger → Domínios → `neurolearn.tech` → DNS Zone**

URL direta: https://hpanel.hostinger.com/domain/neurolearn.tech/dns

> Se o domínio está em outro registrador (GoDaddy, Namecheap, etc.), os registros devem ser adicionados naquele painel, mas os valores são os mesmos.

---

## REGISTRO 1 — SPF (Sender Policy Framework)

O SPF autoriza o Hostinger a enviar e-mails em nome do seu domínio.

### Valores

| Campo           | Valor                                                 |
| --------------- | ----------------------------------------------------- |
| **Tipo**        | `TXT`                                                 |
| **Nome / Host** | `@` (ou deixar em branco — representa o domínio raiz) |
| **Valor**       | `v=spf1 include:_spf.hostinger.com ~all`              |
| **TTL**         | `3600` (1 hora)                                       |

### Instruções Hostinger

1. Acesse: **Hostinger → DNS Zone → Adicionar registro**
2. Selecione tipo **TXT**
3. No campo **Nome**: digite `@`
4. No campo **Valor/Conteúdo**: cole exatamente:
   ```
   v=spf1 include:_spf.hostinger.com ~all
   ```
5. Clique em **Salvar**

### Regras importantes

> ⚠️ **Só pode existir UM registro SPF por domínio.** Se já existe um registro TXT iniciando com `v=spf1`, edite-o para adicionar `include:_spf.hostinger.com` antes do `-all` ou `~all`.

**Errado (dois registros SPF):**

```
v=spf1 include:google.com ~all
v=spf1 include:_spf.hostinger.com ~all  ← segundo registro — INVÁLIDO
```

**Correto (um registro, múltiplos includes):**

```
v=spf1 include:google.com include:_spf.hostinger.com ~all
```

### Diferença entre `~all` e `-all`

| Sufixo | Significado                                                     | Recomendação                        |
| ------ | --------------------------------------------------------------- | ----------------------------------- |
| `~all` | SoftFail — e-mails de IPs não listados são aceitos mas marcados | **Recomendado no início**           |
| `-all` | HardFail — e-mails de IPs não listados são rejeitados           | Usar após validar que tudo funciona |

---

## REGISTRO 2 — DKIM (DomainKeys Identified Mail)

O DKIM adiciona uma assinatura criptográfica em cada e-mail. O Hostinger gera o par de chaves automaticamente.

### Como obter a chave DKIM do Hostinger

**Método 1 — Via painel de e-mail:**

1. Acesse: **Hostinger → Emails → Gerenciar → Autenticação de e-mail**
2. Na seção **DKIM**, clique em **Gerar** (se não existir) ou copie a chave existente
3. O Hostinger exibirá o registro DNS completo para copiar

**Método 2 — Via configurações avançadas:**

1. Acesse: **Hostinger → Emails → `noreply@neurolearn.tech` → Configurações**
2. Role até **Autenticação / DKIM**
3. Ative o DKIM se estiver desativado
4. Copie o registro DNS gerado

### Valores (após obter a chave do Hostinger)

| Campo           | Valor                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Tipo**        | `TXT`                                                                                          |
| **Nome / Host** | `default._domainkey` (ou o prefixo fornecido pelo Hostinger — pode ser `hostinger._domainkey`) |
| **Valor**       | `v=DKIM1; k=rsa; p=<CHAVE_PÚBLICA_GERADA_PELO_HOSTINGER>`                                      |
| **TTL**         | `3600`                                                                                         |

> **Nota:** O valor da chave `p=` será uma string longa em Base64, começando com `MIIBIjANBg...` ou similar. Nunca truncar — deve ser copiado integralmente.

### Exemplo de registro DKIM completo

```
Nome:  default._domainkey.neurolearn.tech
Tipo:  TXT
Valor: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
       [continua — não quebrar a string]
TTL:   3600
```

> ⚠️ Alguns painéis de DNS limitam o tamanho de um valor TXT. Se a chave for muito longa, o Hostinger pode fornecer o registro em duas partes — siga as instruções do painel nesse caso.

---

## REGISTRO 3 — DMARC (Domain-based Message Authentication)

O DMARC instrui os servidores receptores o que fazer quando SPF ou DKIM falham, e envia relatórios de auditoria.

### Estratégia Progressiva (Recomendada)

Não ative `p=reject` imediatamente — isso pode bloquear e-mails legítimos durante a transição.

#### Fase 1 — Monitoramento (primeiras 2 semanas)

| Campo           | Valor                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| **Tipo**        | `TXT`                                                                       |
| **Nome / Host** | `_dmarc`                                                                    |
| **Valor**       | `v=DMARC1; p=none; rua=mailto:privacidade@neurolearn.tech; aspf=r; adkim=r` |
| **TTL**         | `3600`                                                                      |

`p=none` — apenas coleta relatórios, não bloqueia nada. Ideal para verificar se tudo está funcionando antes de ativar proteção.

#### Fase 2 — Quarentena (após validar entregabilidade — semana 3+)

Edite o registro DMARC existente para:

```
v=DMARC1; p=quarantine; pct=100; rua=mailto:privacidade@neurolearn.tech; aspf=r; adkim=r
```

`p=quarantine` — e-mails que falham nos testes são movidos para spam, não rejeitados.

#### Fase 3 — Rejeição (após 1 mês sem falsos positivos)

```
v=DMARC1; p=reject; pct=100; rua=mailto:privacidade@neurolearn.tech; aspf=r; adkim=r
```

`p=reject` — proteção máxima. E-mails não autenticados são rejeitados pelo servidor destinatário.

### Parâmetros DMARC explicados

| Parâmetro                  | Significado                                      |
| -------------------------- | ------------------------------------------------ |
| `p=none/quarantine/reject` | Política de tratamento de falhas                 |
| `pct=100`                  | Aplica a 100% das mensagens (padrão — omissível) |
| `rua=mailto:...`           | Endereço que recebe relatórios agregados diários |
| `aspf=r`                   | Alinhamento SPF relaxado (`r`) ou estrito (`s`)  |
| `adkim=r`                  | Alinhamento DKIM relaxado (`r`) ou estrito (`s`) |

> **Relatórios DMARC (rua):** Serão enviados por grandes provedores (Google, Yahoo, Outlook) com estatísticas de e-mails autenticados vs. falhos. Use um serviço como [dmarcian.com](https://dmarcian.com) ou [postmarkapp.com/dmarc](https://postmarkapp.com/dmarc-tools/dmarc-inspector) para interpretar os XMLs.

---

## Resumo — Todos os Registros DNS

| Tipo  | Nome                 | Valor                                                      | TTL  | Fase     |
| ----- | -------------------- | ---------------------------------------------------------- | ---- | -------- |
| `TXT` | `@`                  | `v=spf1 include:_spf.hostinger.com ~all`                   | 3600 | Imediato |
| `TXT` | `default._domainkey` | `v=DKIM1; k=rsa; p=<chave-hostinger>`                      | 3600 | Imediato |
| `TXT` | `_dmarc`             | `v=DMARC1; p=none; rua=mailto:privacidade@neurolearn.tech` | 3600 | Fase 1   |

---

## Verificação — Após Configurar

### Propagação DNS

Os registros DNS levam de **5 minutos a 48 horas** para propagar globalmente. Use TTL=3600 (1 hora) para acelerar.

### Ferramentas de Verificação

| Ferramenta           | URL                                          | O que verificar                                       |
| -------------------- | -------------------------------------------- | ----------------------------------------------------- |
| MXToolbox SPF        | https://mxtoolbox.com/spf.aspx               | SPF válido e `pass`                                   |
| MXToolbox DKIM       | https://mxtoolbox.com/dkim.aspx              | DKIM válido e assinatura verificada                   |
| MXToolbox DMARC      | https://mxtoolbox.com/dmarc.aspx             | Política DMARC configurada                            |
| Google Admin Toolbox | https://toolbox.googleapps.com/apps/checkmx/ | Todos os registros de uma vez                         |
| mail-tester.com      | https://www.mail-tester.com                  | Pontuação de entregabilidade (enviar e-mail de teste) |

### Resultado esperado após configuração completa

```
✅ SPF:   "v=spf1 include:_spf.hostinger.com ~all" → Pass
✅ DKIM:  Signature verified (selector: default)
✅ DMARC: Policy found (p=none initially, upgrade to p=quarantine)
✅ Score: ≥ 9/10 no mail-tester.com
```

---

## Troubleshooting DNS

| Problema                | Diagnóstico                            | Solução                                                          |
| ----------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| SPF `neutral` ou `none` | Registro não propagou ainda            | Aguardar até 48h; verificar novamente                            |
| SPF `fail`              | IP do Hostinger não está no SPF        | Verificar se `include:_spf.hostinger.com` está correto           |
| Dois registros SPF      | Erro de configuração                   | Mesclar em um único registro `v=spf1`                            |
| DKIM `no key`           | Registro não adicionado ou nome errado | Verificar o prefixo exato (`default` vs. `hostinger`)            |
| DKIM `invalid`          | Chave cortada/truncada                 | Re-copiar chave completa do painel Hostinger                     |
| DMARC `not found`       | Registro `_dmarc` não adicionado       | Adicionar registro TXT `_dmarc`                                  |
| E-mail ainda no spam    | SPF/DKIM ok mas reputação baixa        | Aguardar warm-up de domínio (1-2 semanas de envios consistentes) |

---

## Cronograma Recomendado

```
Dia 1:   Criar conta noreply@neurolearn.tech no Hostinger
         Configurar SPF + DKIM + DMARC p=none
         Ativar SMTP no Supabase
         Enviar e-mail de teste

Dia 2-3: Verificar propagação DNS via mxtoolbox.com
         Corrigir eventuais erros
         Testar fluxo Magic Link completo

Semana 2: Verificar relatórios DMARC recebidos (rua)
          Confirmar que SPF+DKIM passam consistentemente

Semana 3: Atualizar DMARC: p=none → p=quarantine

Mês 2+:  Atualizar DMARC: p=quarantine → p=reject
```
