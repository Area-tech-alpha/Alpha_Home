// /nao-dependa-de-sorte: textos literais da página do WP
// (https://assessorialpha.com/nao-dependa-de-sorte/, ID 14248). Arrays de trechos:
// os destaques do WP (itálico, negrito ou marca-texto) ficam no componente.
// Mudanças pedidas: topo preto, form no hero (no lugar da comanda), seções
// alternando preto e branco, time só com Athos e Pedro.

export const NDS_PATH = "/nao-dependa-de-sorte";
export const NDS_FORM_ID = "diagnostico";

export const contentNds = {
  meta: {
    title: "Alpha Assessoria · Seu restaurante vendendo todo dia",
    description:
      "O método que levou a Alpha's Pizzaria do zero a R$400 mil em 8 meses e hoje roda em mais de 2.000 restaurantes. Comece pelo diagnóstico gratuito.",
    ogDescription: "O método da Alpha em mais de 2.000 restaurantes. Comece pelo diagnóstico gratuito.",
  },
  topo: { meta: ["Leitura de 5 minutos ·", " Para donos de restaurante"] },
  hero: {
    kick: ["Para donos de restaurante", " · Diagnóstico gratuito"],
    h1: { antes: "Pare de depender da ", depois: "Seu restaurante pode vender ", mk: "todo dia." },
    // Palavra riscada que troca a cada 2,6 s (PALAVRAS do script do WP).
    palavras: ["sorte do mês.", "taxa do iFood.", "promoção pra girar.", "sexta-feira lotada."],
    deck: ["O método que levou a ", "Alpha's Pizzaria do zero a R$400 mil em 8 meses", ". Hoje ele roda em mais de 2.000 restaurantes pelo Brasil."],
    cta: "Quero meu diagnóstico gratuito",
    micro: ["Menos de 1 minuto pra pedir", "Sem compromisso"],
    strip: [
      ["+2.000", "restaurantes atendidos"],
      ["R$500M+", "em vendas geradas"],
      ["+80", "especialistas no time"],
      ["+70", "franqueados"],
      ["R$0", "pelo diagnóstico"],
    ],
  },
  form: {
    titulo: "Solicite seu diagnóstico gratuito",
    sub: "Preencha e um especialista da Alpha entra em contato.",
    passos: [
      ["1", "Você preenche"],
      ["2", "A gente liga"],
      ["3", "Diagnóstico gratuito"],
    ],
    labels: {
      nome: "Nome",
      email: "E-mail",
      telefone: "Telefone",
      empresa: "Empresa",
      segmento: "Segmento",
      faturamento: "Faturamento atual",
      cnpj: "CNPJ",
      investiria: "Você investiria R$4.000 por mês para vender mais?",
    },
    placeholders: {
      nome: "Seu nome",
      email: "Seu melhor e-mail",
      telefone: "(00) 00000-0000",
      empresa: "Nome do restaurante",
      segmento: "Selecionar",
      faturamento: "Selecionar",
      cnpj: "00.000.000/0000-00",
    },
    submit: "Quero meu diagnóstico gratuito",
    nota: "Diagnóstico gratuito e sem compromisso.",
  },
  semana: {
    de: ["De", "Time Alpha Assessoria"],
    para: ["Para", "Quem tem restaurante e cansou de depender da sorte do mês"],
    lbl: "Se você tem restaurante",
    h2: ["Provavelmente conhece ", "essa semana."],
    dias: [
      ["Segunda", "Salão vazio. A equipe parada, o custo rodando."],
      ["Quarta", "Você solta mais um desconto no iFood pra ver se gira."],
      ["Sexta", "Lota. Falta mesa, falta gente, o pedido atrasa."],
      ["Fim do mês", "Faturou. Mas a margem sumiu entre taxa, desconto e anúncio."],
    ],
    p: ["E o pior não é o mês fraco. O pior é que, quando o mês é bom, ", "ninguém sabe dizer exatamente por quê.", " Então não dá pra repetir. Você volta pro zero todo dia 1º."],
    pull: ["Isso não é azar. É o sinal de um restaurante que vende ", "sem método."],
  },
  porque: {
    lbl: "O problema real",
    h2: ["Não é falta de esforço. Você já trabalha ", "mais do que todo mundo."],
    p1: ["O problema é que o marketing do seu restaurante funciona em pedaços. Alguém roda anúncio. Alguém posta. O iFood faz o dele. E ninguém conecta isso ao que importa: ", "o pedido no caixa e o cliente que volta."],
    p2: "Por isso mais desconto, mais post ou mais anúncio, sozinhos, só aumentam o custo. Falta o que liga uma coisa na outra.",
    pedacos: {
      titulo: "Como está hoje: em pedaços",
      itens: ["Anúncio solto", "Post sem objetivo", "Desconto no iFood", "Cardápio parado", "Cliente que some"],
      p: "Cada parte puxa pra um lado. O resultado depende da sorte do mês.",
    },
    sistema: {
      titulo: "Como fica com a Alpha: em sistema",
      itens: ["Anúncio que leva até o pedido", "iFood vendendo com margem", "Redes sociais gerando visita", "Cliente que volta e indica", "Metas e números acompanhados"],
      p: "Uma mesma equipe olhando o caminho inteiro, do primeiro clique ao pedido.",
    },
  },
  prova: {
    lbl: "A prova",
    h2: ["Antes de vender pra você, ", "testamos em nós mesmos."],
    big: ["R$400 mil", "de faturamento em 8 meses, saindo do zero."],
    p: ["A Alpha abriu o próprio restaurante, a ", "Alpha's Pizzaria", ", e aplicou o método inteiro lá dentro. No vídeo abaixo, ", "Renan Garcia, diretor de marketing da Alpha", ", mostra a estratégia por dentro. São menos de 5 minutos."],
    // Mesmo vídeo do WP (mesma duração, 4:54,7), já em public/videos.
    video: { src: "/videos/alphas-pizzaria-vsl.mp4", poster: "/videos/alphas-pizzaria-vsl-poster.jpg" },
    play: "Assistir com som · 4:55",
    playAria: "Assistir ao vídeo",
    cap: ["Alpha's Pizzaria", " · o método aplicado na nossa própria operação", "Duração: 4 minutos e 55 segundos"],
    cta: "Quero esse método no meu restaurante",
    micro: ["Diagnóstico gratuito", "Sem compromisso"],
  },
  metodo: {
    lbl: "O método Alpha",
    h2: ["Quatro movimentos. ", "Nenhuma fórmula genérica."],
    p: "Cada restaurante passa pelo mesmo caminho, mas as prioridades seguem o momento do seu negócio. É assim que o método roda em pizzaria, hamburgueria, japonês ou cafeteria.",
    movimentos: [
      ["01", "Diagnóstico", "Entender como o restaurante vende hoje e onde o faturamento está travando."],
      ["02", "Estratégia", "Definir prioridades e metas claras de pedidos, faturamento e recorrência."],
      ["03", "Implementação", "A equipe da Alpha coloca a mão na massa em cada canal, junto com você."],
      ["04", "Escala", "O que funciona é medido, ajustado e multiplicado mês a mês."],
    ],
    pilaresTitulo: "O que entra no seu restaurante",
    pilares: [
      ["Atração", "Tráfego pago acompanhado até virar pedido."],
      ["Delivery", "iFood e apps vendendo com margem."],
      ["Desejo", "Redes sociais feitas para gerar visita."],
      ["Recorrência", "CRM e campanhas para o cliente voltar."],
      ["Gestão", "Atendimento, metas e indicadores."],
    ],
  },
  depoimentos: {
    lbl: "Quem já passou pela Alpha",
    h2: ["Não acredite só em nós. ", "Ouça quem viveu."],
    anterior: "Anterior",
    proximo: "Próximo",
    tipo: "Cliente Alpha",
    // Mesmos vídeos do WP, já em public/videos.
    videos: [
      ["pizzaria-cheffao", "Pizzaria Cheffão"],
      ["menu-confianca", "Menu Confiança"],
      ["kallebe-pizzaria-kallebe", "Kallebe · Pizzaria Kallebe"],
      ["madruga-lanches", "Madruga Lanches"],
      ["joao-brasa-burguer", "João · Brasa Burguer"],
      ["trumans-burguers", "Truman's Burguers"],
    ],
  },
  historia: {
    lbl: "Quem está por trás",
    h2: ["Tudo começou com ", "119 “nãos”."],
    p1: "Em 2022, Athos Vilarins, com 18 anos, visitou 120 restaurantes porta a porta oferecendo marketing. Ouviu 119 “nãos”. O único “sim” virou a Alpha.",
    p2: ["Hoje a Alpha é ", "a maior assessoria de marketing gastronômico da América Latina", ", com mais de 80 especialistas, mais de 70 franqueados e um restaurante próprio pra provar que o método funciona."],
    p3: "A gente conhece a rotina de restaurante porque começou dentro dela.",
    // Só Athos e Pedro (pedido). Fotos que já estão no projeto.
    time: [
      { nome: "Athos Vilarins", cargo: "CEO & Founder", foto: "/images/lideranca/athos-vilarins.webp" },
      { nome: "Pedro Dias", cargo: "COO", foto: "/images/lideranca/pedro-dias.webp" },
    ],
  },
  oferta: {
    lbl: "O primeiro passo",
    h2: ["Um diagnóstico do seu restaurante, ", "feito pelo time que construiu a Alpha's."],
    titulo: "O que acontece no diagnóstico",
    itens: [
      ["Raio-x dos seus canais.", " Salão, delivery, iFood, redes e anúncios: de onde vêm os pedidos hoje."],
      ["Onde o dinheiro fica na mesa.", " Margem perdida em desconto, dia de semana parado, cliente que não volta."],
      ["Por onde começar.", " Quais prioridades fazem sentido para o momento do seu restaurante."],
      ["Como a Alpha entra na operação.", " Se fizer sentido seguir juntos, você vê como a assessoria trabalha no seu caso."],
    ],
    investimento: "Investimento",
    valor: "R$0",
    side: "Gratuito e sem compromisso. Você preenche, o nosso time liga e marca a conversa.",
    cta: "Quero o meu",
    porque: [
      ["Por que é gratuito?", "Porque é na conversa que a gente mostra, com a realidade do seu restaurante, o que dá pra melhorar. Se fizer sentido seguir juntos, ótimo."],
      ["E se não fizer sentido?", "Você sai da conversa sabendo onde estão os gargalos do seu restaurante. Sem custo, sem amarra, sem pressão."],
    ],
  },
  caminhos: {
    lbl: "A decisão é sua",
    h2: ["Daqui você tem ", "dois caminhos."],
    a: {
      small: "Caminho 1",
      h3: "Fechar esta página e continuar como está.",
      itens: ["O próximo mês depende da sorte, de novo.", "Mais desconto pra girar, menos margem no fim.", "Salão vazio na segunda, correria na sexta.", "Você segurando tudo sozinho."],
    },
    b: {
      small: "Caminho 2",
      h3: "Pedir o diagnóstico gratuito hoje.",
      itens: ["Clareza de onde o seu faturamento está travando.", "Um plano com prioridades pro seu momento.", "O método que roda em mais de 2.000 restaurantes.", "Uma equipe inteira olhando pro seu caixa."],
      cta: "Escolho o caminho 2",
    },
  },
  faq: {
    lbl: "Dúvidas",
    h2: ["Antes de você ", "pedir o seu."],
    itens: [
      ["Como funciona a assessoria da Alpha?", "Nossa equipe assume o marketing do seu restaurante de ponta a ponta: tráfego pago, iFood, redes sociais, CRM e estruturação comercial, tudo com base num diagnóstico inicial do seu negócio."],
      ["Preciso ter site ou equipe de marketing pronta?", "Não. A Alpha assume a operação de marketing do zero, com sua própria equipe e estrutura."],
      ["Em quanto tempo eu vejo resultado?", "A maioria dos restaurantes começa a ver impacto real entre 30 e 60 dias após o início da parceria."],
      ["A Alpha atende só pizzarias?", "Não. Atendemos hamburguerias, churrascarias, restaurantes japoneses, cafeterias, docerias e praticamente qualquer segmento gastronômico."],
      ["Vocês atendem a minha cidade?", "A Alpha está presente em diversos estados do Brasil, com equipe própria em cada unidade, e segue em expansão. Fale com a gente para confirmar sua região."],
      ["O diagnóstico tem algum custo?", "Não. O diagnóstico é gratuito e sem compromisso. Preencha o formulário e nosso time entra em contato para marcar a conversa."],
    ],
  },
  final: {
    h2: ["O próximo mês do seu restaurante pode depender de ", "método,", "não de sorte."],
    p: "Leva menos de 1 minuto pra pedir. O nosso time liga, entende o seu restaurante e mostra por onde começar.",
    cta: "Quero meu diagnóstico gratuito",
    micro: ["Dados protegidos", "O time liga pra você", "Sem compromisso"],
    abraco: "Um abraço,",
    assinatura: "Time Alpha",
    ps: ["P.S.", " Se você pulou direto pra cá: a Alpha's Pizzaria saiu do zero para R$400 mil de faturamento em 8 meses com o mesmo método que hoje roda em mais de 2.000 restaurantes. O primeiro passo é um diagnóstico gratuito e sem compromisso. ", "Peça o seu aqui."],
  },
  rodape: "2026 © Alpha Assessoria. Todos os direitos reservados.",
  barra: { titulo: "Diagnóstico gratuito do seu restaurante", sub: "O time liga pra você. Sem compromisso.", cta: "Quero o meu" },
  saida: {
    head: "Antes de sair",
    fechar: "Fechar",
    pergunta: ["Qual é o ", "maior desafio", " do seu restaurante hoje?"],
    instrucao: "Toque em uma opção. Leva 2 segundos.",
    opcoes: [
      ["ifood", "Dependo demais do iFood"],
      ["salao", "Salão vazio durante a semana"],
      ["anuncio", "Invisto em anúncio e não vejo retorno"],
      ["volta", "O cliente compra uma vez e não volta"],
    ],
    // RESPOSTAS do script do WP: t = [antes, destaque em itálico]; p = trechos, negrito nos ímpares.
    respostas: {
      ifood: { tag: "Dependência do iFood", t: ["Isso tem solução, e começa pelo ", "canal próprio."], p: ["Os pilares de ", "Delivery", " e ", "Recorrência", " da Alpha existem pra isso: o iFood vendendo com margem e o seu cliente comprando também direto com você."] },
      salao: { tag: "Salão vazio na semana", t: ["Dia de semana parado é ", "faturamento esquecido."], p: ["Com ", "Atração", " e ", "Desejo", " trabalhando juntos, anúncio e conteúdo passam a ter um objetivo só: trazer gente pra mesa de segunda a quinta também."] },
      anuncio: { tag: "Anúncio sem retorno", t: ["O problema quase nunca é o anúncio. É o ", "caminho até o pedido."], p: ["No pilar de ", "Atração", ", cada real investido é acompanhado até virar pedido no caixa, não só clique. É isso que o diagnóstico olha primeiro."] },
      volta: { tag: "Cliente que não volta", t: ["Vender de novo pra quem já comprou é ", "o lucro mais barato."], p: ["O pilar de ", "Recorrência", " organiza a sua base de clientes e cria campanhas pra aumentar a frequência e o ticket de quem já conhece a casa."] },
    } as Record<string, { tag: string; t: [string, string]; p: string[] }>,
    ir: "Quero resolver isso no diagnóstico",
    video: "Prefiro ver antes o vídeo de 5 minutos",
  },
};
