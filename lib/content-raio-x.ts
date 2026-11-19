// /raio-x-do-restaurante: obrigado das LPs de POP. Textos literais da página do WP
// (https://assessorialpha.com/raio-x-do-restaurante/), que é comum a várias iscas e
// troca a barra de confirmação e a etiqueta do hero conforme a isca.

export type RaioXVariacao = { barra: string; etq: string };

// Variações do WP para as iscas migradas aqui (as outras iscas do WP não chegam a esta rota).
export const RAIO_X_VARIACOES: Record<string, RaioXVariacao> = {
  "isca-pop-producao": {
    barra: "Seu POP de produção já está no seu e-mail. Não chegou em 5 minutos? Olhe o spam ou a aba Promoções.",
    etq: "Mas o seu problema não é só a pizza fora do padrão.",
  },
  "isca-pop-expedicao": {
    barra: "Seu POP de expedição já está no seu e-mail. Não chegou em 5 minutos? Olhe o spam ou a aba Promoções.",
    etq: "Mas o seu problema não é só o estoque.",
  },
  "isca-pop-delivery": {
    barra: "Seu POP de delivery já está no seu e-mail. Não chegou em 5 minutos? Olhe o spam ou a aba Promoções.",
    etq: "Mas o seu problema não é só a operação.",
  },
};

// Texto padrão do WP (sem isca reconhecida).
export const RAIO_X_PADRAO: RaioXVariacao = {
  barra: "O Cardápio que Vende em 10 Segundos já está no seu e-mail. Não chegou em 5 minutos? Olhe o spam ou a aba Promoções.",
  etq: "Mas o seu problema não é só o cardápio.",
};

export function raioXVariacao(isca: string | undefined): RaioXVariacao {
  return (isca && Object.hasOwn(RAIO_X_VARIACOES, isca) && RAIO_X_VARIACOES[isca]) || RAIO_X_PADRAO;
}

export const contentRaioX = {
  meta: {
    title: "Raio-X do Restaurante · Alpha",
    description:
      "Em 45 minutos, um especialista da Alpha analisa a sua demanda, a sua operação e a sua margem e entrega o seu plano de ação.",
  },
  topTag: "Raio-X do Restaurante",
  cta: "QUERO MEU RAIO-X GRATUITO",
  hero: {
    image: "/images/pop/hero-raio-x.webp",
    title: ["", "Raio-X do Restaurante gratuito:", " descubra quanto o seu restaurante pode vender a mais sem perder margem"] as const,
    sub: "Em 45 minutos, um especialista da Alpha analisa a sua demanda, a sua operação e a sua margem e entrega o seu plano de ação. Você só precisa aparecer.",
    umClique: "Um clique. Você não preenche mais nada.",
    prova: "O método que levou a Alpha's Pizzaria a R$ 450 mil por mês em 8 meses de operação, com 27% de margem.",
    exemplo: "Um Raio-X de exemplo · números desfocados",
    rx: {
      titulo: "Raio-X",
      tag: "Exemplo",
      demanda: ["Demanda", "+ 1.240 pedidos"],
      margem: ["Margem", "CMV 31,4%"],
      operacao: ["Operação", "18 min de saída"],
      plano: "Plano de ação",
    },
  },
  limite: {
    title: ["Arrumar a casa tem limite. ", "Vender não."] as const,
    paras: [
      "Acertar o CMV, o cardápio e os processos devolve dinheiro. Mas chega uma hora em que não há mais o que ajustar.",
      "E vender mais sem estrutura só aumenta o vazamento. É por isso que tanto restaurante fatura mais e continua sem sobrar.",
      "Cada mês assim é um mês trabalhando para pagar fornecedor, aplicativo e funcionário. Não para você.",
      "O lucro cresce quando três coisas andam juntas: pedido chegando todo dia, uma operação que dá conta e cada venda deixando dinheiro.",
    ],
    tres: ["Pedido chegando todo dia", "Uma operação que dá conta", "Cada venda deixando dinheiro"],
    virada: "Descubra em qual das três o seu restaurante está travando.",
  },
  analisa: {
    title: ["O que a gente analisa ", "em 45 minutos"] as const,
    destaque: {
      n: "01 · O centro do Raio-X",
      titulo: "A sua demanda",
      texto:
        "De onde vêm os seus clientes hoje e o caminho mais rápido para trazer mais pedidos com tráfego pago. Inclui o que o seu Instagram está deixando passar.",
      print: { src: "/images/pop/relatorio-anuncios.webp", alt: "Relatório semanal de anúncios de um cliente da Alpha", legenda: "Relatório real de anúncios de um cliente" },
    },
    itens: [
      ["02", "A sua margem", "Se você conhece o seu CMV e quanto sobra de cada venda."],
      ["03", "A sua operação", "O tempo de saída dos pedidos e o que trava quando o movimento aumenta."],
      ["04", "Um restaurante como o seu", "O caso de um cliente da Alpha do seu segmento e, se possível, da sua cidade. E os bastidores da Alpha's Pizzaria."],
      ["05", "O seu plano de ação", "O que fazer em cada área, na ordem, para vender mais sem perder margem."],
    ],
    fim: "Você só precisa aparecer. A análise é com a gente. É gratuito, e o plano fica com você mesmo que não contrate nada.",
  },
  testado: {
    title: ["Testado num restaurante ", "de verdade."] as const,
    paras: [
      "A Alpha's Pizzaria chegou a R$ 450 mil por mês em 8 meses de operação, com 27% de margem de lucro. Vendeu mais sem deixar a margem cair.",
      "É o laboratório da Alpha: todo o marketing e o operacional são testados lá primeiro e depois levados para os clientes. Um método validado em mais de 2.000 restaurantes, de vários segmentos, em todo o Brasil.",
      "Por isso, na call, você vê o caso de um restaurante parecido com o seu: mesmo segmento e, se possível, a mesma cidade.",
    ],
    hint: "Clientes da Alpha · deslize",
    videos: [
      { slug: "kallebe-pizzaria-kallebe", nome: "Kallebe · Pizzaria Kallebe", tipo: "Pizzaria · cliente Alpha" },
      { slug: "leo-pizzaria-gra-fina", nome: "Léo · Pizzaria Grã Fina", tipo: "Pizzaria · cliente Alpha" },
      { slug: "trumans-burguers", nome: "Truman's Burguers", tipo: "Hamburgueria · cliente Alpha" },
    ],
  },
  funciona: {
    title: ["Como ", "funciona"] as const,
    passos: [
      "Você clica no botão.",
      "Um especialista da Alpha chama você no WhatsApp em até 1 minuto para marcar o horário.",
      "A conversa é por vídeo, dura cerca de 45 minutos e usa os seus números.",
    ],
    cnpj: "O Raio-X é para restaurantes em operação, com CNPJ.",
    faq: [
      ["É uma call de vendas?", "Se o diagnóstico mostrar que a Alpha pode resolver, a gente apresenta como. Se não fizer sentido, você sai com o Raio-X na mão."],
      ["Vai ser só sobre Instagram?", "Não. O Instagram entra, mas o foco é o que traz pedido mais rápido: tráfego pago, com a operação e a margem prontas para receber esse volume."],
      ["45 minutos é muito para mim.", "Você escolhe o horário que funciona para você e não precisa preparar nada. É só aparecer. Em 45 minutos você sai com o seu plano de ação."],
      ["Já me queimei com agência. Por que seria diferente?", "Porque a Alpha não recomenda nada que não tenha rodado antes no próprio restaurante."],
      ["Preciso saber o meu CMV?", "Se souber, ajuda. Se não souber, a gente descobre junto, junto com o tempo de saída dos seus pedidos."],
    ],
    virada: "Você já sabe onde mexer dentro de casa. Agora descubra quanto você pode vender.",
  },
  footer: "Alpha Assessoria · marketing e gestão para restaurantes · 2026",
  ok: {
    title: "Seu Raio-X do Restaurante está reservado.",
    texto:
      "Em até 1 minuto, um especialista da Alpha chama você no WhatsApp para marcar o horário. Enquanto isso, abra o material que chegou no seu e-mail.",
  },
};
