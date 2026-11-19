import type { PopContent } from "@/lib/content-pop";

// /cardapio-que-vende: textos literais da página do WP
// (https://assessorialpha.com/cardapio-que-vende/, ID 14290).
export const contentCardapioQueVende = {
  slug: "cardapio-que-vende",
  meta: {
    title: "O Cardápio que Vende em 10 Segundos · Alpha",
    description:
      "É a estrutura que dá ao seu cliente a compra mais fácil: ele decide nos primeiros 10 segundos, não sai do cardápio e fecha o pedido com um ticket maior. Aplique hoje e veja a diferença nos pedidos do mesmo dia.",
    ogImage: "/images/pop/og-delivery.jpg",
  },
  cta: "QUERO O CARDÁPIO DE 10 SEGUNDOS",
  topTag: "Material gratuito",
  eyebrow: "Guia gratuito · cardápio digital para restaurantes",
  form: { submit: "ENVIAR MEU GUIA", nota: "O guia chega no seu e-mail em seguida." },
  hero: {
    image: "/images/pop/hero-delivery.webp",
    title: ["Copie e cole ", "O Cardápio que Vende em 10 Segundos:", " o cliente entra, pede rápido e gasta mais"],
    titleSize: "l",
    sub: "É a estrutura que dá ao seu cliente a compra mais fácil: ele decide nos primeiros 10 segundos, não sai do cardápio e fecha o pedido com um ticket maior. Aplique hoje e veja a diferença nos pedidos do mesmo dia.",
    prova: "A mesma estrutura do cardápio da Alpha's Pizzaria, que vende mais de R$ 200 mil por mês no delivery. Já usada em mais de 2.000 restaurantes.",
  },
  problema: {
    title: ["Ele abriu. Olhou. ", "Fechou."],
    paras: [
      "Você já pagou para esse cliente chegar: anúncio, taxa do aplicativo, post. Às vezes o anúncio traz clique barato, o cliente entra e não compra. O problema não é o anúncio. É o cardápio.",
      "No cardápio, ele decide em 10 segundos. Cardápio poluído, categoria confusa, foto ruim, descrição que não justifica o preço ou opção demais, e ele fecha. Pede no concorrente.",
      "E quando pede, sem combo e sem sugestão, leva menos do que levaria.",
    ],
    virada: "Antes de pagar para trazer mais gente, faça quem já chegou pedir.",
    comanda: {
      titulo: "A conta do clique",
      subtitulo: "O cliente que já chegou",
      rows: [
        { label: "Pagou para trazer", value: "", icon: "sim" },
        { label: "Abriu o cardápio", value: "", icon: "sim" },
        { label: "Fechou sem pedir", value: "", icon: "nao", tone: "red", big: true },
      ],
      total: { label: "Pedido", value: "R$ 0,00" },
      carimbo: "Pediu no concorrente",
    },
  },
  muda: {
    title: ["O que muda ", "no seu cardápio."],
    itens: [
      ["O cliente decide rápido", "As categorias na ordem certa levam ele direto ao que vende, sem rolar até desistir."],
      ["O cliente pede mais", "Combo e adicional aparecem no momento exato em que ele está decidindo."],
      ["O cliente paga sem estranhar", "Foto e descrição que justificam o preço antes de ele olhar o valor."],
      ["Menos cardápio aberto e fechado", "Você corta os erros dos 10 segundos que fazem o cliente sair sem pedir."],
      ["Sem trocar de plataforma", "Funciona no cardápio que você já usa."],
    ],
  },
  email: {
    extras: ["Você recebe o guia em PDF, para ler no celular em 15 minutos, com o passo a passo para aplicar no seu cardápio."],
  },
  autor: {
    title: ["Testado num cardápio ", "que vende todo dia."],
    paras: [
      "É a mesma estrutura que a gente usou no cardápio da Alpha's Pizzaria, que vende mais de R$ 200 mil por mês só no delivery. E já foi aplicada em mais de 2.000 restaurantes, que somam mais de R$ 500 milhões em vendas com a Alpha.",
      "O cardápio converte quem chega. Trazer mais gente todo mês é o trabalho da Alpha.",
    ],
    stats: [
      ["R$ 200 mil", "por mês no delivery"],
      ["+2.000", "restaurantes"],
      ["R$ 500 milhões", "em vendas"],
    ],
    virada: "O cliente já está abrindo o seu cardápio. Faça ele pedir, e pedir mais.",
  },
} as const satisfies PopContent;

// Partes só desta página.
export const cardapioExtras = {
  celular: {
    nome: "Sua Pizzaria",
    timer: "0:10",
    aberto: "Aberto agora",
    cats: ["Mais pedidas", "Combos", "Pizzas", "Bebidas"],
    itens: [
      { img: "/images/iscas/thumb-pepperoni.webp", nome: "Pepperoni", desc: "Pepperoni fatiado e muçarela.", preco: "R$ 64,00", alvo: false },
      { img: "/images/iscas/thumb-calabresa.webp", nome: "Calabresa", desc: "Calabresa, cebola e muçarela.", preco: "R$ 59,00", alvo: true },
      { img: "/images/iscas/thumb-frango.webp", nome: "Frango com bacon", desc: "Frango, bacon e creme de milho.", preco: "R$ 66,00", alvo: false },
    ],
    sheet: { small: "Combina com a sua pizza", titulo: "+ Refrigerante 2L por R$ 12", botao: "ADICIONAR AO PEDIDO" },
    sacola: "Sacola",
    exemplo: "Cardápio fictício no padrão do guia",
  },
  antesDepois: {
    antes: { tag: "Antes", nome: "Calabresa", preco: "R$ 59" },
    depois: {
      tag: "Depois",
      img: "/images/iscas/thumb-calabresa.webp",
      alt: "Pizza calabresa da Alpha's Pizzaria",
      nome: "Calabresa",
      desc: "Calabresa fatiada, cebola e muçarela.",
      preco: "R$ 59",
      combo: "Combo sugerido: + Refri 2L",
      comboPreco: "+ R$ 12",
    },
    exemplo: "Exemplo do mesmo item",
  },
  guia: [
    { img: "/images/iscas/cardapio-01.webp", legenda: "O guia" },
    { img: "/images/iscas/cardapio-03.webp", legenda: "Categoria âncora" },
    { img: "/images/iscas/cardapio-05.webp", legenda: "Combo" },
    { img: "/images/iscas/cardapio-08.webp", legenda: "Descrição que vende" },
  ],
  fachada: { src: "/images/iscas/alphas-pizzaria.webp", alt: "Fachada da Alpha's Pizzaria", width: 765, height: 1020, nome: "Alpha's Pizzaria", cap: ["O laboratório", "da Alpha"] },
};
