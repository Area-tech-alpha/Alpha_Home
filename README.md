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
| `/obrigado` | Obrigado da home | noindex |
| `/obrigado-a`, `/obrigado-b`, `/obrigado-c` | Pós-envio da /01-lp (leads A, B, C; a faixa "80 mil até 100 mil" também cai na `/obrigado-a`) | noindex |
| `/agradecimento` | Pós-envio da /01-lp (desqualificado) | noindex |
| `/alphas-pizzaria` | LP VSL da Alpha's Pizzaria (migração da `/alphas-pizzaria-vsl/` do WP, ID 13930) | só no domínio final (e só então no sitemap) |
| `/alphas-pizzaria/obrigado` | Vídeo que libera o PDF na metade; o lead vai para o webhook do n8n no clique, a não ser que já tenha sido enviado pela `/resultado-alphas-pizzaria` (migração da `/obrigado-vsl-alphas-pizzaria/`, ID 13950) | noindex + disallow |
| `/resultado-alphas-pizzaria` | LP de resultado da Alpha's Pizzaria (migração da `/resultado-alphas-pizzaria/` do WP, ID 13526); lead enviado no submit e depois vai para `/alphas-pizzaria/obrigado` | só no domínio final (e só então no sitemap) |

## Variáveis de ambiente

| Variável | Uso | Onde |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Domínio do deploy. Fora de `https://assessorialpha.com` tudo fica noindex | todas |
| `CRM_API_URL`, `CRM_EXTERNAL_LEADS_API_KEY`, `CRM_SDR_EMAIL` | Lead da home | servidor |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit dos forms (sem elas, passa direto) | servidor |
| `LEAD_WEBHOOK_URL_01LP` | Webhook do n8n que recebe o lead da /01-lp (**Sensitive** na Vercel) | servidor |
| `LEAD_WEBHOOK_URL_PIZZARIA` | Webhook do n8n que recebe o lead da /alphas-pizzaria e da /resultado-alphas-pizzaria, o mesmo das páginas do WP (**Sensitive** na Vercel) | servidor |

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
| 80 mil até 100 mil | – | `/obrigado-a` | `qualificado-geral` (pendência: faixa esquecida no WP; o `redirect_url` do payload segue o WP: `.../obrigado/`) |
| 100 mil até 150 mil … Mais de 1 milhão | – | `/obrigado-a` | `a` |

### Payload do webhook

Mesmo formato que o form nativo do Elementor manda pela ação Webhook. A referência é a função `montarPayloadElementor` da página WP `obrigado-seja-um-franqueado-c`. Os metadados dela foram copiados byte a byte de um payload real que o n8n recebeu.

- `POST`, `Content-Type: application/x-www-form-urlencoded`
- Chaves na ordem: `form[id]`, `form[name]` e, para cada campo do form (inclusive os do tipo `html`, com valor vazio), `fields[<id>][id|type|title|value|raw_value|required]`
- Sem `meta[...]` e sem `post_id`, como na referência
- `origem=alpha-home-01-lp` no fim (chave extra pedida para a /01-lp)

```
form[id]=e1b938c
form[name]=Formulario_Qualificacao
fields[<id>][id]=<id>
fields[<id>][type]=text|email|tel|select|hidden|html
fields[<id>][title]=<rótulo do campo no WP>
fields[<id>][value]=<valor>
fields[<id>][raw_value]=<valor>
fields[<id>][required]=1|0
origem=alpha-home-01-lp
```

Campos (ids reais do form do WP, na mesma ordem):

| id | tipo | título | valor |
|---|---|---|---|
| `name` | text | Nome | nome |
| `email` | email | Email | e-mail |
| `field_bb2d15f` | tel | Telefone | telefone em E.164 (`+5511…`) |
| `field_4169f50` | text | Nome da Empresa | empresa |
| `field_b47b91e` | html | (vazio) | vazio |
| `field_13a1e79` | select | Qual o seu segmento? | segmento |
| `field_5cf7e87` | html | (vazio) | vazio |
| `faturamento` | select | Faturamento | faixa (ex.: `50 mil até 80 mil`) |
| `cnpj` | text | Seu CNPJ | CNPJ com máscara (só em "Até 30 mil") |
| `field_4e810df` | html | (vazio) | vazio |
| `disposto_investir` | select | Você investiria R$4.000,00 por mês para vender mais? | `obrigado` (Sim) / `agradecimento` (Não), como no WP |
| `utm_source`, `utm_campaign`, `utm_medium`, `utm_id`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `fbc`, `gcl_aw` | hidden | (o próprio id) | first-touch lido no navegador (30 dias em `localStorage`). `fbc`/`gcl_aw` vêm dos cookies `_fbc`/`_gcl_aw`; sem cookie, o `fbc` é montado do `fbclid` (`fb.1.<ms>.<fbclid>`) |
| `creation_time` | hidden | creation_time | Unix (segundos) no envio |
| `debug_full_url` | hidden | debug_full_url | URL completa da página no envio |
| `redirect_url` | hidden | redirect_url | URL de destino com barra no fim, como no WP (ex.: `https://assessorialpha.com/obrigado-a/`) |
| `tipo_lead` | hidden | tipo_lead | `a`, `b`, `c`, `desqualificado` ou `qualificado-geral` |
| `field_a8828d3` | html | (vazio) | vazio |

Obrigatórios (`required=1`): `name`, `email`, `field_bb2d15f`, `field_4169f50`, `field_13a1e79` e `faturamento`, como no HTML do form. Os títulos dos ocultos são o próprio id, como na referência. Os rótulos dos 4 campos `html` só existem no editor do Elementor e não aparecem no HTML público, então vão vazios.

Diferença intencional em relação ao WP: as UTMs vêm do navegador do próprio visitante. No WP, o cache do LiteSpeed servia o HTML com UTMs de outro visitante já preenchidas nos campos ocultos.

## /alphas-pizzaria: envio do lead

Mesmo fluxo da página do WP, em duas etapas:

1. **Página 1** (`components/pizzaria/lead-form-pizzaria.tsx`): valida com zod (`lib/validation-pizzaria.ts`), guarda o lead no navegador (`sessionStorage` + `localStorage` com validade de 2h, chave `alpha_vsl_lead`, como no WP) e vai para `/alphas-pizzaria/obrigado`. **Não envia nada.**
2. **Página 2** (`components/pizzaria/vsl-gate.tsx`): o vídeo começa sozinho e mudo, sem pausa e sem avanço. Aos 50% libera o botão. No clique, a server action `app/actions/submit-lead-pizzaria.ts` valida o lead de novo, aplica o rate limit (escopo `pizzaria:`) e faz `POST` JSON para `LEAD_WEBHOOK_URL_PIZZARIA` (timeout de 10 s). Em qualquer resultado o navegador segue para o PDF, como no WP.

Quem abre a página 2 sem passar pelo form também é enviado, com `tipo_lead: "sem-form"` e `lead_sem_form: true` (igual ao WP). `?preview=liberado` libera o botão na hora.

O payload (`lib/webhook-pizzaria.ts`) tem as mesmas chaves e a mesma ordem do objeto que o WP manda: `nome, email, telefone, empresa, segmento, faturamento, disposto_investir, cnpj, tipo_lead, redirect_url`, as 10 UTMs, `origem_form, page_url, referrer, form_preenchido_em, lead_sem_form, video_progresso, origem_confirmacao, confirmado_em`. O telefone vai no formato do WP (`+55 (11) 91111-0001`) e o segmento vai no `value` do select (`pizzarias`, `comida-brasileira`…). Sem UTM de origem/mídia, `utm_source`/`utm_medium` saem do referrer (`classificarOrigemOrganica`, igual ao WP).

Diferenças intencionais:
- Novo no obrigado: aviso "Clique para ativar o som" e controle de volume (mudo/som + slider).
- O carrossel de depoimentos tem autoplay de 5 s com deslize, loop, arraste e pausa no hover (no WP é só rolagem pelas setas). Os vídeos são locais (`public/videos/depoimento-*.mp4`, com poster) e só carregam no clique.
- A VSL é local (`public/videos/alphas-pizzaria-vsl.mp4`, 720p, 15 MB; a original no WP tem 1080p e 119 MB).
- O PDF é local (`public/files/alphas-pizzaria/playbook-cardapio-digital.pdf`, cópia do `wp-content/uploads/2026/09/Playbook-Cardapio-Digital-Alpha.pdf`).
- A contagem "Libera em" usa a duração real do vídeo (no WP, a constante de 4:52; aqui ela só vale antes de o metadata carregar).

## /resultado-alphas-pizzaria: envio do lead

O form é o mesmo da /alphas-pizzaria (`LeadFormPizzaria variant="resultado"`: zod, DDI com bandeiras SVG, honeypot, first-touch), mas o envio acontece **no submit**, como no WP:

1. A server action `app/actions/submit-lead-resultado-pizzaria.ts` valida o lead, aplica o rate limit (escopo `pizzaria-resultado:`) e faz `POST` JSON para `LEAD_WEBHOOK_URL_PIZZARIA` (`lib/webhook-resultado-pizzaria.ts`).
2. **Só redireciona se o envio deu certo.** Se o webhook falhar, o form mostra "Não conseguimos enviar agora. Tente de novo em instantes." e a cota de e-mail e telefone do rate limit é devolvida (no WP o envio é "fire and forget"; aqui falha de envio não perde lead sem aviso).
3. Depois do envio, **todas as faixas** vão para `/alphas-pizzaria/obrigado` (no WP cada faixa ia para `/obrigado-a`, `-b`, `-c`, `/agradecimento` ou `/obrigado`). O `tipo_lead` e o `redirect_url` do payload continuam calculados pela regra de faturamento do WP.

Payload (mesmas chaves e ordem do WP): `nome, email, telefone, empresa, segmento, faturamento, disposto_investir, cnpj, tipo_lead, redirect_url`, as 10 UTMs, `page_url, referrer, submitted_at`. Não tem `origem_form` (só a VSL tem).

### Sem lead duplicado no n8n

Antes de redirecionar, o navegador grava a marca **"lead já enviado pela resultado"** (`alpha_resultado_enviado`: o lead e a data, em `sessionStorage` + `localStorage`, validade de 2h). O `components/pizzaria/vsl-gate.tsx` lê a marca (regra em `lib/obrigado-pizzaria.ts`):

- **Com marca válida:** o botão liberado aos 50% só abre o PDF. Não chama o webhook e não manda "sem-form". A marca é apagada no clique.
- **Sem marca:** tudo como antes. Quem vem da VSL é enviado uma vez no botão, e quem abre o obrigado direto é enviado como `sem-form`.

Marca vencida (mais de 2h), de data futura ou malformada é ignorada.

### Carrossel de episódios

15 episódios na ordem do WP (`lib/content-resultado-pizzaria.ts`); cada card é um link para o reel (`target="_blank"`, `rel="noopener"`). Mesma mecânica do carrossel de depoimentos da /alphas-pizzaria (`components/pizzaria/use-loop-carousel.ts`): autoplay de 5 s deslizando, loop infinito, arraste, setas e pausa no hover. Um arraste nunca abre o reel; só o clique sem arrastar. O reveal fica num wrapper de className fixo e o estado do arraste vai em `data-dragging`, para o React não apagar a classe `visible` que o reveal põe via DOM (bug já corrigido na /alphas-pizzaria).

**Capas:** o card usa `public/images/alphas-pizzaria/episodios/ep-NN.webp` (9/16) quando o arquivo está listado em `episodios.covers`; sem capa, mostra o fundo fosco com degradê para o preto, o ícone do Instagram e "Ver no Instagram". A lista está vazia até as capas serem enviadas (o Instagram não entrega o `og:image` por `curl`). Ao adicionar capas, listar os nomes (`"ep-01.webp"`…) em `covers`: o `check-assets` passa a conferi-las.

Diferenças em relação ao WP: carrossel com autoplay, deslize, loop e arraste (no WP é só rolagem pelas setas); fundo do card fosco em vez de transparente; logo do rodapé com a proporção correta (no WP ele sai esticado).

## Pendências (Max)

- Faixa "80 mil até 100 mil" não está em nenhuma faixa do script do WP e cai em `/obrigado` (`qualificado-geral`).
- Rótulos dos 4 campos `html` do form da 00-lp no editor do Elementor (`field_b47b91e`, `field_5cf7e87`, `field_4e810df`, `field_a8828d3`), se o n8n precisar de `title` idêntico. Hoje vão vazios.
- `/agradecimento`: texto provisório ("Cadastro Concluído!" + botão). A página do WP está quebrada.
