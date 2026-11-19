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
| `/01-lp` | LP de restaurantes (migração da `/00-lp/` do WP, ID 3445); lead vai para o CRM | só no domínio final (e só então no sitemap) |
| `/obrigado` | Obrigado da home | noindex |
| `/obrigado-a`, `/obrigado-b`, `/obrigado-c` | Pós-envio da /01-lp (leads A, B, C; a faixa "80 mil até 100 mil" também cai na `/obrigado-a`) | noindex |
| `/agradecimento` | Pós-envio da /01-lp (desqualificado) | noindex |
| `/alphas-pizzaria` | LP VSL da Alpha's Pizzaria (migração da `/alphas-pizzaria-vsl/` do WP, ID 13930); lead vai para o CRM | só no domínio final (e só então no sitemap) |
| `/alphas-pizzaria/obrigado` | Vídeo que libera o PDF na metade. **Não envia lead** (migração da `/obrigado-vsl-alphas-pizzaria/`, ID 13950) | noindex + disallow |
| `/resultado-alphas-pizzaria` | LP de resultado da Alpha's Pizzaria (migração da `/resultado-alphas-pizzaria/` do WP, ID 13526); lead vai para o CRM e depois para `/alphas-pizzaria/obrigado` | só no domínio final (e só então no sitemap) |
| `/lead-magnetic-bastidores-alphas-pizzaria` | LP lead magnet "Bastidores da Alpha's Pizzaria" (migração da página do WP, ID 13210); lead vai para o CRM e depois para o obrigado dela | noindex,nofollow em qualquer domínio (igual ao WP); fora do sitemap |
| `/obrigado-lm-bastidores-alphas-pizzaria` | Obrigado da LP de bastidores (migração da página do WP, ID 13215). **Não envia lead** | noindex + disallow |
| `/lead-magnetic-vsl` | LP lead magnetic VSL (migração da página do WP, ID 11029); lead vai para o CRM e depois para o obrigado dela | só no domínio final (e só então no sitemap) |
| `/obrigado-lm-vsl` | Obrigado da LP lead magnetic VSL (migração da página do WP, ID 11040). **Não envia lead** | noindex + disallow |
| `/pop-producao`, `/pop-expedicao`, `/pop-delivery` | LPs dos POPs da Alpha's Pizzaria (migração das páginas do WP). Form visível no hero; lead vai para o CRM e depois para `/raio-x-do-restaurante` | noindex em qualquer domínio (igual ao WP); fora do sitemap, sem disallow |
| `/ficha-tecnica`, `/cronograma-de-limpeza`, `/cardapio-que-vende`, `/calculadora-de-cmv` | LPs de isca no padrão das POP (migração das páginas do WP, IDs 14305, 14295, 14290, 14285). Form no hero; lead vai para o CRM e o n8n e depois para `/raio-x-do-restaurante` | noindex (igual ao WP); fora do sitemap, sem disallow |
| `/ferramenta-calculadora-cmv` | "Calculadora mágica de CMV" (WP ID 14300). **Sem form** (como no WP); cálculo em `lib/cmv.ts`, visual novo | noindex (igual ao WP); fora do sitemap, sem disallow |
| `/raio-x-do-restaurante` | Obrigado das LPs de isca (mesma rota do WP), estático; barra muda pela isca (`?isca=`, escolhida no navegador). O botão "Quero meu Raio-X" manda o aceite ao n8n | noindex + disallow |

## Variáveis de ambiente

| Variável | Uso | Onde |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Domínio do deploy. Fora de `https://assessorialpha.com` tudo fica noindex | todas |
| `CRM_API_URL`, `CRM_EXTERNAL_LEADS_API_KEY`, `CRM_SDR_EMAIL` | CRM comercial: lead da home e de **todas as LPs** (**Sensitive** na Vercel) | servidor |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit dos forms (sem elas, passa direto) | servidor |
| `LEAD_WEBHOOK_URL_ISCAS` | n8n "leads-iscas": lead das LPs de isca (POP, ficha, cronograma, cardápio, calculadora), **além** do CRM; é quem manda o material por e-mail (**Sensitive**) | servidor |
| `LEAD_WEBHOOK_URL_RAIO_X` | n8n "leads-raio-x": aceite do Raio-X em `/raio-x-do-restaurante` (**Sensitive**) | servidor |

Todo lead vai para o CRM. As LPs de isca também mandam ao n8n (`lib/lead-webhook.ts`), com o mesmo body do WP; a URL fica só nas envs (nunca em código, teste, log ou README). Falha no n8n não bloqueia o lead nem o redirect.

## Leads: todas as LPs enviam para o CRM comercial

A home e as LPs usam o **mesmo código**: `lib/crm.ts` (`buildCrmLeadPayload`, `resolverDestino`, `sendLeadToCrm`: `POST {CRM_API_URL}/external/leads`, com `x-api-key`, timeout de 10 s). O payload e a regra de destino/categoria são os da home:

- `destination: "hq"`, `niche: "food"`, `source: "alpha-home"`, nome, empresa, e-mail, telefone, `document` (CNPJ), faturamento, segmento e as atribuições que a home já manda (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`).
- Categoria: "Até 30 mil" + "Sim" para o investimento vira `lead_category: "D"`; as demais combinações vão sem categoria.
- `gclid`, `fbc`, `gcl_aw` e `utm_id` são lidos no navegador, mas **não vão para o CRM** (a API da home não tem esses campos).

O caminho de envio das LPs é `lib/lead-intake.ts` (`intakeLead`), chamado pela server action de cada LP:

1. Valida o lead (mesmos campos e regras da home; CNPJ e "investiria" só em "Até 30 mil").
2. Rate limit (`lib/rate-limit.ts`) no escopo da LP, para uma LP não gastar a cota da outra: `01lp:`, `pizzaria:`, `pizzaria-resultado:`, `pizzaria-bastidores:` (a home usa `home:`).
3. Envia ao CRM. **Só redireciona se o CRM respondeu ok.**
4. Se falhar, o form mostra "Não conseguimos enviar agora. Tente de novo em instantes." e a cota de e-mail e telefone do rate limit é devolvida (a do IP continua contando). Os logs têm só status e código de erro, nunca a URL, a chave nem dados do lead.

| LP | Server action | Escopo | Depois do envio ok |
|---|---|---|---|
| `/01-lp` | `submit-lead-01lp.ts` | `01lp:` | `rotear01lp` (tabela abaixo) |
| `/alphas-pizzaria` | `submit-lead-pizzaria.ts` | `pizzaria:` | `/alphas-pizzaria/obrigado` |
| `/resultado-alphas-pizzaria` | `submit-lead-resultado-pizzaria.ts` | `pizzaria-resultado:` | `/alphas-pizzaria/obrigado` |
| `/lead-magnetic-bastidores-alphas-pizzaria` | `submit-lead-bastidores-pizzaria.ts` | `pizzaria-bastidores:` | `/obrigado-lm-bastidores-alphas-pizzaria` |
| `/lead-magnetic-vsl` | `submit-lead-magnetic-vsl.ts` | `lead-magnetic-vsl:` | `/obrigado-lm-vsl` |
| `/pop-producao`, `/pop-expedicao`, `/pop-delivery` | `submit-lead-pop.ts` | `pop-producao:`, `pop-expedicao:`, `pop-delivery:` | `/raio-x-do-restaurante?isca=isca-pop-…` |
| `/ficha-tecnica`, `/cronograma-de-limpeza`, `/cardapio-que-vende`, `/calculadora-de-cmv` | `submit-lead-pop.ts` | `ficha-tecnica:`, `cronograma-limpeza:`, `cardapio-que-vende:`, `calculadora-cmv:` | `/raio-x-do-restaurante?isca=…` (calculadora com `&calc=1`) |

**Sem pixel da Meta:** nenhuma página carrega `fbq`, `fbevents.js` nem `connect.facebook.net`, e não há API de Conversões no servidor. O `fbclid` (e o `fbc` montado dele) só é lido da URL como dado de atribuição do lead. Um teste (`tests/lead-intake.test.ts`) falha se alguma dessas referências voltar ao código.

**Origem no CRM:** o payload da home não tem `page_url` nem campo de página, e `source` é fixo em `"alpha-home"`. Por isso o CRM **não distingue** de qual LP o lead veio, a não ser pelas UTMs da campanha (ver Pendências).

### /01-lp: roteamento pós-envio (`rotear01lp` em `lib/lead-01lp.ts`)

Regra literal do script da 00-lp (ramo `pageId` 3445). Só decide a página de obrigado; o destino no CRM segue `resolverDestino`.

| Faturamento | Investiria R$4.000? | Destino |
|---|---|---|
| Até 30 mil | Não | `/agradecimento` |
| Até 30 mil | Sim | `/obrigado-c` |
| 30 mil até 50 mil | – | `/obrigado-c` |
| 50 mil até 80 mil | – | `/obrigado-b` |
| 80 mil até 100 mil | – | `/obrigado-a` (faixa esquecida no WP, que mandava para `/obrigado`) |
| 100 mil até 150 mil … Mais de 1 milhão | – | `/obrigado-a` |

### /alphas-pizzaria

- **Página 1** (`components/pizzaria/lead-form-pizzaria.tsx`, `variant="vsl"`): zod, DDI com bandeiras SVG, honeypot, first-touch. **Envia ao CRM no submit** e vai para `/alphas-pizzaria/obrigado`.
- **Obrigado** (`components/pizzaria/vsl-gate.tsx`): **só o gate do vídeo e o PDF, sem enviar nada** (o lead já foi no submit). O vídeo começa sozinho e mudo, sem pausa e sem avanço. A barra mostra "Libera em m:ss" e aos 50% libera o botão, que abre o PDF. Quem abre o obrigado direto não vira lead (sem dados não há o que enviar). `?preview=liberado` libera o botão na hora.

Diferenças em relação ao WP:
- Novo no obrigado: aviso "Clique para ativar o som" e controle de volume (mudo/som + slider).

### /lead-magnetic-vsl

O form usa `LeadFormPizzaria variant="lead-magnetic-vsl"` com os textos, placeholders e opções literais do WP. Os segmentos são exclusivos desta LP e não há campos condicionais de CNPJ ou "investiria". O schema próprio está em `lib/validation-pizzaria.ts`; o envio usa a server action `app/actions/submit-lead-magnetic-vsl.ts`, o escopo `lead-magnetic-vsl:` e só redireciona para `/obrigado-lm-vsl` após resposta ok do CRM.

O hero e os três prints do carrossel ficam em `public/images/lead-magnetic-vsl/`. A página usa um CSS próprio com escopo `.lmvsl`; reveal simples é aplicado em `data-visible`, sem fixos decorativos ou animações infinitas. No obrigado, o botão fica oculto por 150 s e, ao clicar, apenas mostra "Entraremos em contato em breve!" — não dispara requisições externas.
- O carrossel de depoimentos tem autoplay de 5 s com deslize, loop, arraste e pausa no hover (no WP é só rolagem pelas setas). Os vídeos são locais (`public/videos/depoimento-*.mp4`, com poster) e só carregam no clique.
- A VSL é local (`public/videos/alphas-pizzaria-vsl.mp4`, 720p, 15 MB; a original no WP tem 1080p e 119 MB).
- O PDF é local (`public/files/alphas-pizzaria/playbook-cardapio-digital.pdf`, cópia do `wp-content/uploads/2026/09/Playbook-Cardapio-Digital-Alpha.pdf`).
- A contagem "Libera em" usa a duração real do vídeo (no WP, a constante de 4:52; aqui ela só vale antes de o metadata carregar).
- O envio é no submit da página 1 (no WP era no clique do botão do vídeo).

### /resultado-alphas-pizzaria

O form é o mesmo (`variant="resultado"`). Envia ao CRM no submit e vai para `/alphas-pizzaria/obrigado` em **todas as faixas** (no WP cada faixa ia para `/obrigado-a`, `-b`, `-c`, `/agradecimento` ou `/obrigado`).

**Carrossel de episódios:** 15 episódios na ordem do WP (`lib/content-resultado-pizzaria.ts`); cada card é um link para o reel (`target="_blank"`, `rel="noopener"`). Mesma mecânica do carrossel de depoimentos da /alphas-pizzaria (`components/pizzaria/use-loop-carousel.ts`): autoplay de 5 s deslizando, loop infinito, arraste, setas e pausa no hover. Um arraste nunca abre o reel; só o clique sem arrastar. O reveal fica num wrapper de className fixo e o estado do arraste vai em `data-dragging`, para o React não apagar a classe `visible` que o reveal põe via DOM (bug já corrigido na /alphas-pizzaria).

**Capas:** o card usa `public/images/alphas-pizzaria/episodios/ep-NN.webp` (9/16) quando o arquivo está listado em `episodios.covers`; sem capa, mostra o fundo fosco com degradê para o preto, o ícone do Instagram e "Ver no Instagram". A lista está vazia até as capas serem enviadas (o Instagram não entrega o `og:image` por `curl`). Ao adicionar capas, listar os nomes (`"ep-01.webp"`…) em `covers`: o `check-assets` passa a conferi-las.

### /lead-magnetic-bastidores-alphas-pizzaria e o obrigado

O form é o mesmo das outras LPs da pizzaria (`LeadFormPizzaria variant="bastidores"`). **Envia ao CRM no submit** e, se o CRM respondeu ok, mostra "Recebemos seus dados! Redirecionando..." e vai para `/obrigado-lm-bastidores-alphas-pizzaria`. Antes de redirecionar, deixa o primeiro nome no `sessionStorage` (chave `leadMagnetBastidoresPizzaria`, como no WP) para o obrigado personalizar o aviso do e-mail.

**O que o WP fazia (e o que mudou):** o form do WP não enviava nada: guardava o payload no navegador e redirecionava. Quem enviava era o obrigado, para dois webhooks do n8n: ao carregar, um que adicionava o contato à lista #13 da Brevo (o que dispara o e-mail com o material) e, no clique do botão, outro (`leads-lms`) para o comercial. Agora o lead vai ao CRM no submit e o obrigado **não envia nada**: o botão só mostra a mensagem de agradecimento.

Visual do WP: fundo "mesh" fixo, partículas, cursor personalizado e botão magnético (só com mouse), reveal no scroll e rolagem até o form com 100 px de folga (`components/bastidores/fx.tsx`). O CSS tem escopo `.bastidores` (`app/lead-magnetic-bastidores-alphas-pizzaria/bastidores.css`) e o estado de reveal e de cursor vai em `data-*`, nunca em classe adicionada via DOM. A foto é a do Ailton Cruz (`public/images/bastidores/ailton-cruz.webp`, em webp); a imagem do hero e a do case são as mesmas da `/alphas-pizzaria`.

## Pendências (Max)

- **n8n das iscas:** o e-mail com o material e o aceite do Raio-X dependem de `LEAD_WEBHOOK_URL_ISCAS` e `LEAD_WEBHOOK_URL_RAIO_X` na Vercel. Sem elas, o lead chega ao CRM mas o material não é enviado.
- **Inconsistências do WP (mantidas):** `/calculadora-de-cmv` e `/ferramenta-calculadora-cmv` têm o mesmo título ("Calculadora Mágica de CMV · Alpha"); os chips de segmento da calculadora (12) e a lista da ferramenta (13) têm nomes e quantidades diferentes; a isca do cronograma é `isca-pop-higienizacao`.
- **Origem POP no CRM:** o form do WP não pede empresa; o lead chega sem `company` e com `source` "alpha-home" (sem indicar qual POP). Só as UTMs ajudam a distinguir.

- **E-mail com o material (Brevo):** o obrigado do WP dispara, ao carregar, o webhook que adiciona o contato à lista #13 da Brevo e manda o e-mail com o material, e a página diz "Mandamos o material pro seu e-mail". Sem webhook, **esse e-mail deixou de ser disparado**. É preciso que o CRM (ou outra integração) faça esse envio para a LP continuar entregando o que promete.

- **Origem do lead no CRM:** a API da home não tem campo de página/LP e `source` é fixo em `"alpha-home"`. Para o comercial distinguir `/01-lp`, `/alphas-pizzaria` e `/resultado-alphas-pizzaria`, o CRM precisa aceitar um valor distinto em `source` (ou um campo novo, como `page_url`). Hoje só as UTMs da campanha ajudam.
- Faixa "80 mil até 100 mil" não está em nenhuma faixa do script do WP (cairia em `/obrigado`); a /01-lp manda para `/obrigado-a`.
- `/agradecimento`: texto provisório ("Cadastro Concluído!" + botão). A página do WP está quebrada.
- Textos copiados do WP que falam do envio no clique do vídeo (ex.: "Ao clicar, o time da Alpha recebe seus dados…" no obrigado da VSL e a resposta "O que acontece depois que eu envio?" do FAQ) ficaram literais, mas agora o envio é no submit.
