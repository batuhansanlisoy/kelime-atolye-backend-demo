export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toLocaleUpperCase('tr-TR') +
        word.slice(1).toLocaleLowerCase('tr-TR'),
    )
    .join(' ');
}
