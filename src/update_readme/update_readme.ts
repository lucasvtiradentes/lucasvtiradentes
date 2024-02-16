
import { DynMarkdown } from "dyn-markdown"
import { TExtendedRepoInfo } from "../update_projects/project.schema"

type TReadmeFields = 'ALL_PROJECTS'

export const updateReadme = async (extendedRepositories: TExtendedRepoInfo[]) => {
  const readmeMarkdown = new DynMarkdown<TReadmeFields>('./README.md')
  readmeMarkdown.updateField('ALL_PROJECTS', `<span>👉 <a href="https://github.com/lucasvtiradentes/lucasvtiradentes/blob/master/portfolio/PROJECTS.md#TOC">projects (${extendedRepositories.length})</a></span><br />`)
  readmeMarkdown.saveFile()
}
