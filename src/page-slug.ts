export function wikiPageSlug(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
}
