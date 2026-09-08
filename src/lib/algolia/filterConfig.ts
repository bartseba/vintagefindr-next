export function buildConfigure({ brand, tags }: { brand?: string; tags?: string[] }): string[][] {
  const facetFilters: string[][] = []
  if (brand) facetFilters.push([`brand:${brand}`])
  if (tags?.length) {
    facetFilters.push(tags.map((t) => `tags:"${t}"`))
  }
  return facetFilters
}
