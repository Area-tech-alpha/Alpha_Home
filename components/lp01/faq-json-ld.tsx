// FAQPage da /01-lp (mesmo schema do FaqJsonLd do Alpha_Home). Fica aqui para
// não mexer no components/json-ld.tsx da home.
export function FaqJsonLd({ items }: { items: readonly { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
