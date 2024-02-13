
import { DynMarkdown, MarkdownTable, getJson } from "dyn-markdown"
import { CONFIGS } from "../configs/configs"
import { TIcon } from "../configs/icon.schema"
import { TExtendedRepoInfo } from "../update_projects/project.schema"

type TReadmeFields = 'ALL_PROJECTS' | 'FEATURED_PROJECTS'

export const updateReadme = async (extendedRepositories: TExtendedRepoInfo[]) => {
  const iconsJson = getJson(CONFIGS.icons_json)
  const readmeMarkdown = new DynMarkdown<TReadmeFields>('./README.md')

  const featuredProjects = extendedRepositories.filter((project) => project.featured).sort((repoA, repoB) => {
    const hasImageA = Boolean(repoA.image);
    const hasImageB = Boolean(repoB.image);
    if (hasImageA && !hasImageB) { return -1; }
    if (!hasImageA && hasImageB) { return 1; }
    return 0;
  });

  const fieldTable = new MarkdownTable([
    { content: 'project', width: 215 },
    { content: 'description', width: 400 },
    { content: 'image', width: 215 },
    { content: 'tech', width: 100, align: 'center' }
  ])

    featuredProjects.forEach((project) => {

      const projectLink = `${project.repo_link}#readme`
      const stars = `<a href="${projectLink}"><img src="https://badgen.net/github/stars/lucasvtiradentes/${project.name}/"></a>`
      const nameStr =  `<a href="${projectLink}">${project.name}</a><br>${stars}`
      const techStr = project.topics.length === 0 ? '' : project.topics.filter((ctech: string) => {
        const hasIcon = iconsJson.map((item: TIcon) => item.name).includes(ctech)
        return hasIcon
      }).map((ctech: string) => {
        const icon = iconsJson.find((icon: TIcon) => icon.name === ctech)
        return `\n      <a target="_blank" href="${icon?.default_link}"><img src="${icon?.image}"></a>`
      }).join('') + '\n    '

      fieldTable.addBodyRow([
        {content: nameStr, align: 'center'},
        {content: project.description},
        {content: project.image && project.image.path ? `<a href="${projectLink}"><img src="${project.image.path}" width="${project.image.width}"></a>` : 'N/A', align: 'center'},
        {content: techStr}
      ])

    })

  const table = fieldTable.getTable()
  const div = `<details>\n  <summary align="center"><b>⭐ featured projects (${featuredProjects.length})</b></summary>\n  <br>\n  <div align="center">\n${table.split("\n").map(line => `    ${line}`).join("\n")}\n  </div>\n</details>`
  readmeMarkdown.updateField('FEATURED_PROJECTS', div)
  readmeMarkdown.updateField('ALL_PROJECTS', `<a href="https://github.com/lucasvtiradentes/lucasvtiradentes/blob/master/portfolio/PROJECTS.md#TOC">projects (${extendedRepositories.length})</a>`)
  readmeMarkdown.saveFile()
}
