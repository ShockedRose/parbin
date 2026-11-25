export type LegalSectionContent = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

type SectionTranslator = (
  key: string,
  options: { returnObjects: true }
) => unknown

/**
 * Reads the translated section objects for a legal document and returns them
 * in the given order, skipping any section missing from the locale file.
 */
export function readLegalSections(
  t: SectionTranslator,
  key: string,
  order: readonly string[]
): LegalSectionContent[] {
  const sections = t(key, { returnObjects: true }) as Record<
    string,
    LegalSectionContent | undefined
  >

  return order.flatMap((id) => {
    const section = sections[id]
    return section ? [section] : []
  })
}
