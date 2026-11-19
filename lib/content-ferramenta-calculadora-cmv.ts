// /ferramenta-calculadora-cmv ("Calculadora mágica de CMV"): textos literais da
// página do WP (https://assessorialpha.com/ferramenta-calculadora-cmv/, ID 14300).
// O cálculo está em lib/cmv.ts. Visual novo (pedido): mesma identidade das iscas.

export const FERRAMENTA_PATH = "/ferramenta-calculadora-cmv";

export const contentFerramenta = {
  meta: {
    title: "Calculadora Mágica de CMV · Alpha",
    description: "Descubra o seu CMV, quanto ele custa por mês e por ano e um plano de 4 semanas para recuperar a margem.",
  },
  topTag: "Ferramenta gratuita",
  etq: "Calculadora de CMV · Alpha",
  title: ["Calculadora ", "mágica", " de CMV"] as const,
  sub: "Preencha os campos e veja na hora o seu CMV, quanto ele custa por mês e por ano e um plano de 4 semanas para recuperar a margem.",
  cardNumeros: "Seus números",
  cardDiagnostico: "Seu diagnóstico",
  tabs: {
    rapido: ["Modo rápido", "por estoque"],
    ficha: ["Ficha técnica", "por prato"],
  },
  seg: { label: "Tipo de operação", hint: "A faixa ideal de CMV muda conforme o seu segmento." },
  campos: [
    { k: "fat", label: "Faturamento do período", placeholder: "100.000", hint: "Total vendido no mês (ou no período que você vai medir)." },
    { k: "ei", label: "Estoque inicial", placeholder: "18.000", hint: "Valor em R$ do estoque no começo do período." },
    { k: "co", label: "Compras no período", placeholder: "36.500", hint: "Tudo o que entrou de insumo e mercadoria." },
    { k: "ef", label: "Estoque final", placeholder: "19.500", hint: "Valor em R$ do estoque no fim do período (contagem)." },
  ],
  formulaRapido: "CMV (R$) = estoque inicial + compras - estoque final · CMV (%) = CMV ÷ faturamento",
  formulaFicha:
    "somamos o custo de todos os pratos (custo × vendidos) e dividimos pela receita (preço × vendidos). Isso mostra o CMV real do cardápio e os pratos que mais pesam.",
  comoCalculamos: "Como calculamos:",
  pratos: {
    colunas: ["Prato", "Preço", "Custo", "Vendidos/mês"],
    placeholders: { n: "Nome do prato", p: "0,00", c: "0,00", q: "0" },
    labels: { n: "Nome do prato", p: "Preço de venda", c: "Custo por porção", q: "Vendidos no mês" },
    remover: "Remover prato",
    adicionar: "Adicionar prato",
  },
  res: {
    vazio: "Preencha os campos para ver o seu diagnóstico.",
    seuCmv: "Seu CMV é",
    escala: ["15%", "55%+"],
    mesa: "Você está deixando na mesa",
    porMes: " /mês",
    mesaTexto: ["Seu CMV está ", " pontos", " acima do teto do seu segmento. São ", " por ano", " saindo direto do seu lucro."],
    okTitulo: "Margem protegida",
    okValor: "Dentro da faixa",
    okTexto: ["Seu CMV está dentro (ou abaixo) da faixa ideal para ", ". O foco agora é manter o controle para ele não subir."],
    cmvRs: "CMV em R$",
    noTeto: ["No teto ideal (", "%) seria"],
    viloes: "Pratos que mais pesam na sua margem",
    acimaIdeal: " acima do ideal",
    plano: "Seu plano de 4 semanas",
    planoAlto: "Para trazer o seu CMV de volta à faixa ideal:",
    planoOk: "Para manter (e blindar) essa margem:",
  },
  acoes: { imprimir: "Imprimir ou salvar em PDF", limpar: "Limpar campos" },
  cta: {
    titulo: "Seu CMV está acima do ideal?",
    texto:
      "A calculadora mostra o furo. Num Raio-X gratuito de 45 minutos, um especialista da Alpha analisa a sua demanda, a sua operação e a sua margem e entrega o seu plano de ação.",
    botao: "QUERO MEU RAIO-X GRATUITO",
    href: "/raio-x-do-restaurante?utm_campaign=isca-cmv",
  },
  oQue: {
    titulo: "O que é CMV e por que ele decide o seu lucro?",
  },
  aviso: "Os valores são estimativas de referência e não substituem a contabilidade da sua operação.",
};
