import { z } from 'zod'

export const CATEGORIES = ['open_source', 'personal', 'portfolio', 'freelance'] as const

export const zCategories = z.enum(CATEGORIES)

export type TCategories = z.infer<typeof zCategories>