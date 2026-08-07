export function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(<mark>|<\/mark>)/g);
  let highlighted = false;
  return parts.map((part, index) => {
    if (part === "<mark>") {
      highlighted = true;
      return null;
    }
    if (part === "</mark>") {
      highlighted = false;
      return null;
    }
    return highlighted ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    );
  });
}
