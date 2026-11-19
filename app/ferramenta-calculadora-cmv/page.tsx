import type { Metadata } from "next";
import CalculadoraCmv from "@/components/ferramenta/calculadora-cmv";
import { popFontClasses } from "@/components/pop/fonts";
import { Ic } from "@/components/pop/icons";
import { Logo } from "@/components/pop/parts";
import { contentFerramenta as t, FERRAMENTA_PATH } from "@/lib/content-ferramenta-calculadora-cmv";
import "@/components/pop/pop.css";
import "@/components/ferramenta/ferramenta.css";

// Calculadora mágica de CMV: ferramenta sem form (como no WP). Lógica do WP em
// lib/cmv.ts; visual novo com a identidade das iscas. noindex como no WP.
export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: FERRAMENTA_PATH },
  robots: { index: false, follow: true },
};

export default function FerramentaCalculadoraCmvPage() {
  return (
    <div className={`pop tz fx ${popFontClasses}`}>
      <main>
        <header className="fx-hero">
          <div className="tz-wrap">
            <div className="tz-top">
              <span className="tz-logo">
                <Logo priority />
              </span>
              <span className="tz-top-tag">{t.topTag}</span>
            </div>
            <div className="fx-hero-in">
              <p className="tz-eyebrow">{t.etq}</p>
              <h1 className="fx-h1">
                {t.title[0]}
                <span className="tz-hl">{t.title[1]}</span>
                {t.title[2]}
              </h1>
              <p className="tz-sub">{t.sub}</p>
            </div>
          </div>
        </header>

        <div className="tz-wrap fx-corpo">
          <CalculadoraCmv />

          <div className="fx-cta">
            <div>
              <h3>{t.cta.titulo}</h3>
              <p>{t.cta.texto}</p>
            </div>
            <a className="tz-btn" href={t.cta.href}>
              <span>{t.cta.botao}</span>
              <span className="tz-arr">
                <Ic name="arrow" />
              </span>
            </a>
          </div>

          <div className="fx-oque">
            <h3>{t.oQue.titulo}</h3>
            <div>
              <p>
                O <b>CMV (Custo da Mercadoria Vendida)</b> é quanto você gastou em insumos para produzir tudo o que vendeu. Ele é medido em % do faturamento: um CMV de 35% significa que, de cada R$ 100 vendidos, R$ 35 foram embora só em ingredientes, antes de pagar aluguel, equipe, impostos e energia.
              </p>
              <p>
                Por isso ele é o número mais importante da cozinha: <b>1 ou 2 pontos a mais no CMV saem direto do seu lucro.</b> Controlar o CMV é, na prática, controlar a margem do restaurante.
              </p>
              <p>
                <b>Modo rápido:</b> conte o estoque no início e no fim do mês (em R$) e some todas as notas de compra do período. É o jeito mais rápido de ter o CMV real da operação.
                <br />
                <b>Ficha técnica:</b> cadastre o preço de venda, o custo de insumo por porção e quanto vendeu de cada prato. Dá mais trabalho, mas mostra exatamente quais pratos estão sabotando a sua margem.
              </p>
            </div>
          </div>
          <p className="fx-aviso">{t.aviso}</p>
        </div>
      </main>
    </div>
  );
}
