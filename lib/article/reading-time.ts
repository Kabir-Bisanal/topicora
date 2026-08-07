export function calculateReadingTime(markdown: string, wordsPerMinute = 220) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?(?:\[[^\]]*\])?\([^)]*\)/g, " ")
    .replace(/[#>*_~\-|]/g, " ");
  const words = plainText.trim().match(/\p{L}[\p{L}\p{N}'’.-]*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
