const tagVariants = ["signal", "cluster", "node"] as const

export type TagBadgeVariant = (typeof tagVariants)[number]

export function tagBadgeVariantForIndex(index: number): TagBadgeVariant {
  return tagVariants[index % tagVariants.length]
}
