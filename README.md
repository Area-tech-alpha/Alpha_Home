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
| `/` | Home; lead vai para o CRM (`food/lp`, `lib/crm.ts`) | só no domínio final |
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
| `/pop-producao`, `/pop-expedicao`, `/pop-delivery` | LPs dos POPs da Alpha's Pizzaria (migração das páginas do WP). Form visível no hero; lead vai para o CRM (`food/isca`) e depois para `/raio-x-do-restaurante` | noindex em qualquer domínio (igual ao WP); fora do sitemap, sem disallow |
| `/ficha-tecnica`, `/cronograma-de-limpeza`, `/cardapio-que-vende`, `/calculadora-de-cmv` | LPs de isca no padrão das POP (migração das páginas do WP, IDs 14305, 14295, 14290, 14285). Form no hero; lead vai para o CRM (`food/isca`) e depois para `/raio-x-do-restaurante` | noindex (igual ao WP); fora do sitemap, sem disallow |
| `/ferramenta-calculadora-cmv` | "Calculadora mágica de CMV" (WP ID 14300). **Sem form** (como no WP); cálculo em `lib/cmv.ts`, visual novo | noindex (igual ao WP); fora do sitemap, sem disallow |
| `/nao-dependa-de-sorte` | Carta de vendas (migração da página do WP, ID 14248). Form da /01-lp no hero; lead vai para o CRM (`food/lp`) e segue a régua da /01-lp (`/obrigado-a`, `-b`, `-c`, `/agradecimento`) | só no domínio final (e só então no sitemap) |
| `/raio-x-do-restaurante` | Obrigado das LPs de isca (mesma rota do WP), estático; barra muda pela isca (`?isca=`, escolhida no navegador). O botão "Quero meu Raio-X" manda o aceite ao CRM (`food/raio-x`) | noindex + disallow |

## Variáveis de ambiente

| Variável | Uso | Onde |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Domínio do deploy. Fora de `https://assessorialpha.com` tudo fica noindex | todas |
| `CRM_API_URL`, `CRM_LEAD_INTAKE_FOOD_KEY` | Entrada de leads do CRM comercial (`food/*`): lead da home, de **todas as LPs** e o aceite do Raio-X. A chave é a `LEAD_INTAKE_FOOD_KEY` do CRM (**Sensitive** na Vercel) | servidor |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit dos forms (sem elas, passa direto) | servidor |

Nada vai mais ao n8n nem à rota genérica antiga do CRM: cada form chama **uma** rota da entrada de leads, uma vez.

## Leads: todas as páginas enviam para a entrada de leads do CRM

`lib/crm.ts` (`sendToLeadIntake`): `POST {CRM_API_URL}/external/lead-intake/food/<rota>`, header `x-api-key` = `CRM_LEAD_INTAKE_FOOD_KEY`, timeout de 25 s (o `food/lp` pode esperar o Growth Hub). Contrato completo: `docs/modules/lead-intake.md` do CRM. **Quem decide destino e categoria é o CRM**, nunca a LP.

| Rota | Quem manda | Corpo | O que o CRM faz |
|---|---|---|---|
| `food/lp` | home e LPs de restaurante (tabela abaixo) | `origem` (página), `nome`, `email`, `telefone` (E.164), `empresa`, `segmento`, `faturamento`, `investiria` e `cnpj` ("Até 30 mil"), `utm_source/medium/campaign/content/term/id`, `fbclid`, `fbc`, `fbp`, `page_url` | Régua A–E. **Pago** (tem UTM): lead novo vai primeiro pro Growth Hub (E entra como oportunidade); já conhecido volta pra Matriz. **Orgânico** (sem UTM): entra na Matriz; E vira oportunidade no GH. Planilha e aviso no WhatsApp |
| `food/isca` | LPs de isca (`submit-lead-pop.ts`) | o lead da isca (`isca`, `origem_pagina`, `page_url`, `nome`, `telefone`, `email`, rótulos de `segmento`/`faturamento`, `enviado_em`, UTMs) | Régua das iscas (piso D), Matriz, e-mail do material (Brevo), aba "Leads (Iscas LPs)" e aviso. Repetido em 24 h não manda nada de novo |
| `food/raio-x` | botão do `/raio-x-do-restaurante` (`submitRaioXAceite`) | o lead da isca salvo no navegador (`tzLead`) + a isca do obrigado + `page_url` | Marca "Aceitou Raio-X" na planilha, nota no lead da Matriz ou lead novo |
| `food/lm` | `/lead-magnetic-vsl` | `lead_magnet: "lead-magnetic-vsl"`, os campos do form, UTMs, `fbclid/fbc/fbp`, `page_url` | Régua v3 pelo faturamento: E vira oportunidade no GH, o resto entra na Matriz. Aba "Leads (Leadmagnetic)" e e-mail da Brevo da LM |

Respostas: 2xx = recebido (inclusive `ignored`/`duplicate`: segue o redirect). **400** = o CRM recusou o conteúdo (filtro de segurança: link, script ou fórmula no texto; telefone inválido): o form mostra "Dados inválidos. Verifique o formulário.". 401/403 (chave), 5xx e rede: "Não conseguimos enviar agora. Tente de novo em instantes.".

O caminho de envio é `lib/lead-intake.ts` (`intakeLead`), chamado pela server action de cada página com o destino dela (`foodLp(origem, rota)`, `foodLm(lm, rota)` ou `{ route: "isca", ... }`):

1. Valida o lead (CNPJ e "investiria" só em "Até 30 mil").
2. Rate limit (`lib/rate-limit.ts`) no escopo da página, para uma não gastar a cota da outra (`home:`, `01lp:`, `pizzaria:`…).
3. Envia ao CRM, uma vez. **Só redireciona se o CRM respondeu ok.**
4. Se falhar, mostra o erro acima e devolve a cota de e-mail e telefone do rate limit (a do IP continua contando). Os logs têm só status, código e motivos do CRM (nomes de campo), nunca a URL, a chave nem dados do lead.

| Página | Server action | Rota / origem no CRM | Escopo | Depois do envio ok |
|---|---|---|---|---|
| `/` | `submit-lead.ts` | `food/lp` · `alpha-home` | `home:` | `/obrigado` |
| `/01-lp` | `submit-lead-01lp.ts` | `food/lp` · `01-lp` | `01lp:` | `rotear01lp` (tabela abaixo) |
| `/alphas-pizzaria` | `submit-lead-pizzaria.ts` | `food/lp` · `alphas-pizzaria` | `pizzaria:` | `/alphas-pizzaria/obrigado` |
| `/resultado-alphas-pizzaria` | `submit-lead-resultado-pizzaria.ts` | `food/lp` · `resultado-alphas-pizzaria` | `pizzaria-resultado:` | `/alphas-pizzaria/obrigado` |
| `/lead-magnetic-bastidores-alphas-pizzaria` | `submit-lead-bastidores-pizzaria.ts` | `food/lp` · `lead-magnetic-bastidores-alphas-pizzaria` | `pizzaria-bastidores:` | `/obrigado-lm-bastidores-alphas-pizzaria` |
| `/nao-dependa-de-sorte` | `submit-lead-nds.ts` | `food/lp` · `nao-dependa-de-sorte` | `nao-dependa-de-sorte:` | `rotear01lp` |
| `/lead-magnetic-vsl` | `submit-lead-magnetic-vsl.ts` | `food/lm` · `lead-magnetic-vsl` | `lead-magnetic-vsl:` | `/obrigado-lm-vsl` |
| `/pop-producao`, `/pop-expedicao`, `/pop-delivery` | `submit-lead-pop.ts` | `food/isca` · `isca-pop-…` | `pop-producao:`, `pop-expedicao:`, `pop-delivery:` | `/raio-x-do-restaurante?isca=isca-pop-…` |
| `/ficha-tecnica`, `/cronograma-de-limpeza`, `/cardapio-que-vende`, `/calculadora-de-cmv` | `submit-lead-pop.ts` | `food/isca` · `isca-…` | `ficha-tecnica:`, `cronograma-limpeza:`, `cardapio-que-vende:`, `calculadora-cmv:` | `/raio-x-do-restaurante?isca=…` (calculadora com `&calc=1`) |

**Sem pixel da Meta:** nenhuma página carrega `fbq`, `fbevents.js` nem `connect.facebook.net`, e não há API de Conversões no servidor. O `fbclid` (e o `fbc` montado dele) é lido da URL, e `fbc`/`fbp` dos cookies `_fbc`/`_fbp` quando existem (o WordPress no mesmo domínio tem o pixel), só como dado de atribuição do lead. Testes (`tests/lead-intake.test.ts`) falham se alguma dessas referências, uma env do n8n ou a rota/chave antiga do CRM voltar ao código.

**Origem no CRM:** cada página manda a sua `origem` (coluna da tabela acima), que vira o `source` do lead no CRM, e o `page_url`. As iscas são identificadas pelo slug da isca.

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

- **Virada pro CRM (`food/*`):** configurar `CRM_LEAD_INTAKE_FOOD_KEY` na Vercel antes do deploy (sem ela, todo form mostra "tente de novo"). Depois de testar, desligar os fluxos n8n "Alpha · Iscas", "Alpha · Raio-X" e o "wordpress-geral" (este só quando nenhuma outra origem mandar pra ele) e apagar as envs antigas (`CRM_EXTERNAL_LEADS_API_KEY`, `CRM_SDR_EMAIL`, `LEAD_WEBHOOK_URL_*`).
- **Inconsistências do WP (mantidas):** `/calculadora-de-cmv` e `/ferramenta-calculadora-cmv` têm o mesmo título ("Calculadora Mágica de CMV · Alpha"); os chips de segmento da calculadora (12) e a lista da ferramenta (13) têm nomes e quantidades diferentes; a isca do cronograma é `isca-pop-higienizacao`.
- **Empresa nas iscas:** o form do WP não pede empresa; o CRM usa o nome da isca no lugar.

- **E-mail do material da LP de bastidores (Brevo):** o obrigado do WP dispara, ao carregar, o webhook que adiciona o contato à lista #13 da Brevo e manda o e-mail com o material, e a página diz "Mandamos o material pro seu e-mail". Aqui o lead vai a `food/lp`, que não manda e-mail; o catálogo de LMs do CRM também não tem a Brevo da bastidores. **Esse e-mail continua sem ser disparado.**
- Faixa "80 mil até 100 mil" não está em nenhuma faixa do script do WP (cairia em `/obrigado`); a /01-lp manda para `/obrigado-a`.
- `/agradecimento`: texto provisório ("Cadastro Concluído!" + botão). A página do WP está quebrada.
- Textos copiados do WP que falam do envio no clique do vídeo (ex.: "Ao clicar, o time da Alpha recebe seus dados…" no obrigado da VSL e a resposta "O que acontece depois que eu envio?" do FAQ) ficaram literais, mas agora o envio é no submit.
