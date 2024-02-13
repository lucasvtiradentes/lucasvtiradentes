import { z } from 'zod'
import { zCategories } from '../configs/categories.schema'

const zImage = z.object({
  path: z.string(),
  width: z.string()
})

const zLocalRepo = z.object({
  name: z.string(),
  category: zCategories,
  image: zImage.nullable(),
  featured: z.boolean().optional(),
  package: z.boolean().optional()
})

export type TLocalRepoInfo = z.infer<typeof zLocalRepo>

const zGithubRepo = z.object({
  name: z.string(),
  repo_link:z.string(),
  description:z.string(),
  topics: z.array(z.string()),
  issues: z.number(),
  stars: z.number(),
  homepage: z.string()
})

export type TGithubRepoInfo = z.infer<typeof zGithubRepo>

export type TExtendedRepoInfo = TGithubRepoInfo & TLocalRepoInfo
