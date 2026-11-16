// Renderiza os destaques **assim** do content-01-lp em dourado (ou no estilo passado).
export default function Rich({ text, strongClass = "gold-text font-semibold" }: { text: string; strongClass?: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className={strongClass}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}
