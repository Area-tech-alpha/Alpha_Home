// Destaques do content-01-lp: **trecho** vira <strong> (classe strongClass) e
// ==trecho== vira amarelo (#FFA902), dentro ou fora do negrito.
function Yellow({ text }: { text: string }) {
  return (
    <>
      {text.split(/(==[^=]+==)/g).map((part, i) =>
        part.startsWith("==") && part.endsWith("==") ? (
          <span key={i} className="text-[#ffa902]">
            {part.slice(2, -2)}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function Rich({ text, strongClass = "font-extrabold" }: { text: string; strongClass?: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className={strongClass}>
            <Yellow text={part.slice(2, -2)} />
          </strong>
        ) : (
          <Yellow key={i} text={part} />
        )
      )}
    </>
  );
}
