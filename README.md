# Alpha Home

Site institucional da Assessoria Alpha (Next 15, SSG, Tailwind v4).

```bash
npm run dev        # desenvolvimento
npm run lint       # eslint
npm run typecheck  # tsc
npm test           # testes (node:test + tsx)
npm run build      # confere as mídias (scripts/check-assets.ts) e gera o build
```

## Rotas

| Rota | O que é | Indexação |
|---|---|---|
| `/` | Home; lead vai para o CRM (`lib/crm.ts`) | só no domínio final |
| `/depoimentos` | Vídeos de clientes | só no domínio final |
| `/01-lp` | LP de restaurantes (migração da `/00-lp/` do WP, ID 3445); lead vai para o webhook do n8n | só no domínio final (e só então no sitemap) |
| `/obrigado` | Obrigado da home; também recebe a faixa "80 mil até 100 mil" da /01-lp | noindex |
| `/obrigado-a`, `/obrigado-b`, `/obrigado-c` | Pós-envio da /01-lp (leads A, B, C) | noindex |
| `/agradecimento` | Pós-envio da /01-lp (desqualificado) | noindex |

## Variáveis de ambiente

| Variável | Uso | Onde |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Domínio do deploy. Fora de `https://assessorialpha.com` tudo fica noindex | todas |
| `CRM_API_URL`, `CRM_EXTERNAL_LEADS_API_KEY`, `CRM_SDR_EMAIL` | Lead da home | servidor |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit dos forms (sem elas, passa direto) | servidor |
| `LEAD_WEBHOOK_URL_01LP` | Webhook do n8n que recebe o lead da /01-lp (**Sensitive** na Vercel) | servidor |

## /01-lp: envio do lead

`app/actions/submit-lead-01lp.ts` (server action):

1. Valida com o mesmo `leadSchema` da home (CNPJ e "investiria" só em "Até 30 mil").
2. Rate limit com `lib/rate-limit.ts` no escopo `01lp:` (cota separada da home).
3. Monta o payload (`lib/webhook-01lp.ts`) e faz `POST` para `LEAD_WEBHOOK_URL_01LP` com timeout de 10 s. Os logs têm só status e motivo, nunca a URL nem dados do lead.
4. Se falhar, devolve a cota do rate limit e o form pede para tentar de novo. Se der certo, redireciona conforme a regra abaixo.

### Roteamento pós-envio (`rotear01lp` em `lib/lead-01lp.ts`)

Regra literal do script da 00-lp (ramo `pageId` 3445):

| Faturamento | Investiria R$4.000? | Destino | `tipo_lead` |
|---|---|---|---|
| Até 30 mil | Não | `/agradecimento` | `desqualificado` |
| Até 30 mil | Sim | `/obrigado-c` | `c` |
| 30 mil até 50 mil | – | `/obrigado-c` | `c` |
| 50 mil até 80 mil | – | `/obrigado-b` | `b` |
| 80 mil até 100 mil | – | `/obrigado` | `qualificado-geral` (pendência: faixa esquecida no WP) |
| 100 mil até 150 mil … Mais de 1 milhão | – | `/obrigado-a` | `a` |

### Payload do webhook

Mesmo formato da ação Webhook do Elementor com "advanced data" (form `Formulario_Qualificacao`, id `e1b938c`): `application/x-www-form-urlencoded`, com chaves aninhadas no padrão PHP.

> **Provisório:** os títulos dos campos ocultos, as chaves e títulos de `meta` e o content-type ainda precisam ser conferidos com uma execução real do nó Webhook do n8n. Tudo isso fica nas tabelas `FIELDS` e `meta` de `lib/webhook-01lp.ts`.

```
form[id]=e1b938c
form[name]=Formulario_Qualificacao
fields[<id>][id]=<id>
fields[<id>][type]=text|email|tel|select|hidden
fields[<id>][title]=<rótulo do campo no WP>
fields[<id>][value]=<valor>
fields[<id>][raw_value]=<valor>
fields[<id>][required]=1|0
meta[date|time|page_url|user_agent|remote_ip][title]=…
meta[date|time|page_url|user_agent|remote_ip][value]=…
origem=alpha-home-01-lp
```

Campos (ids reais do form do WP, na mesma ordem):

| id | tipo | título | valor |
|---|---|---|---|
| `name` | text | Nome | nome |
| `email` | email | Email | e-mail |
| `field_bb2d15f` | tel | Telefone | telefone em E.164 (`+5511…`) |
| `field_4169f50` | text | Nome da Empresa | empresa |
| `field_13a1e79` | select | Qual o seu segmento? | segmento |
| `faturamento` | select | Faturamento | faixa (ex.: `50 mil até 80 mil`) |
| `cnpj` | text | Seu CNPJ | CNPJ com máscara (só em "Até 30 mil") |
| `disposto_investir` | select | Você investiria R$4.000,00 por mês para vender mais? | `obrigado` (Sim) / `agradecimento` (Não), como no WP |
| `utm_source`, `utm_campaign`, `utm_medium`, `utm_id`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `fbc`, `gcl_aw` | hidden | (o próprio id) | first-touch lido no navegador (30 dias em `localStorage`). `fbc`/`gcl_aw` vêm dos cookies `_fbc`/`_gcl_aw`; sem cookie, o `fbc` é montado do `fbclid` (`fb.1.<ms>.<fbclid>`) |
| `creation_time` | hidden | creation_time | Unix (segundos) no envio |
| `debug_full_url` | hidden | debug_full_url | URL completa da página no envio |
| `redirect_url` | hidden | redirect_url | URL de destino (ex.: `https://assessorialpha.com/obrigado-a`) |
| `tipo_lead` | hidden | tipo_lead | `a`, `b`, `c`, `desqualificado` ou `qualificado-geral` |

Diferença intencional em relação ao WP: as UTMs vêm do navegador do próprio visitante. No WP, o cache do LiteSpeed servia o HTML com UTMs de outro visitante já preenchidas nos campos ocultos.

## Pendências (Max)

- Faixa "80 mil até 100 mil" não está em nenhuma faixa do script do WP e cai em `/obrigado` (`qualificado-geral`).
- `/agradecimento`: texto provisório ("Cadastro Concluído!" + botão). A página do WP está quebrada.
