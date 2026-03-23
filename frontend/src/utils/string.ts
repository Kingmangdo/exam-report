export const normalizeClassName = (name: string | null | undefined): string => {
  if (!name) return '';
  return name
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
    .replace(/\s+/g, ' ') // Normalize all whitespace to a single standard space
    .trim();
};
