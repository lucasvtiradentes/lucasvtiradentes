import { DynMarkdown, MarkdownTable, getJson } from 'dyn-markdown';
import { join } from 'node:path';
import { CATEGORIES, TCategories } from '../configs/categories.schema';
import { CONFIGS } from '../configs/configs';
import { TIcon } from '../configs/icon.schema';
import { TExtendedRepoInfo } from '../update_projects/project.schema';

type TCountFields = Uppercase<`${TCategories}_count`>
type TTableFields =  Uppercase<`${TCategories}_table`>
type TProjectsFields = 'PROJECTS_COUNT' | TCountFields | TTableFields

export async function updateProjects(extendedRepositories: TExtendedRepoInfo[]){
  const iconsJson = getJson(CONFIGS.icons_json)
  const projectsMarkdown = new DynMarkdown<TProjectsFields>('./portfolio/PROJECTS.md')

  const sortedRepositories = extendedRepositories.sort((repoA, repoB) => {
    const hasImageA = Boolean(repoA.image);
    const hasImageB = Boolean(repoB.image);
    if (hasImageA && !hasImageB) { return -1; }
    if (!hasImageA && hasImageB) { return 1; }
    return 0;
  }).sort((repoA, repoB) => {
    const isPackageA = Boolean(repoA.package);
    const isPackageB = Boolean(repoB.package);
    if (isPackageA && !isPackageB) { return -1; }
    if (!isPackageA && isPackageB) { return 1; }
    return 0;
  });

  projectsMarkdown.updateField('PROJECTS_COUNT', `ALL MY GITHUB PROJECTS (${sortedRepositories.length})`)


  CATEGORIES.forEach((category) => {
    const countField = `${category}_count`.toUpperCase() as TCountFields
    const qnt = sortedRepositories.filter((item) =>item.category === category).length
    projectsMarkdown.updateField(countField, `${category.replace('_', ' ')} (${qnt})`)
  })

  CATEGORIES.forEach((category) => {
    const tableField = `${category}_table`.toUpperCase() as TTableFields

    const fieldTable = new MarkdownTable([
      { content: 'project', width: 215 },
      { content: 'description', width: 400 },
      { content: 'image', width: 215 },
      { content: 'tech', width: 100, align: 'center' }
    ])

    const fieldItems = sortedRepositories.filter((item) => item.category === category)

    fieldItems.forEach((project) => {

      const npmLink = project.package ? `<a href="https://www.npmjs.com/package/${project.name}"><img src="https://img.shields.io/npm/v/${project.name}.svg?style=flat" alt="npm version"></a>` : ''
      const projectLink = `${project.repo_link}#readme`
      const nameStr = `<a href="${projectLink}">${project.name}</a><br>${npmLink}`
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
        {content: project.image && project.image.path ? `<a href="#"><img src="${join('..', project.image.path)}" width="${project.image.width}"></a>` : 'N/A', align: 'center'},
        {content: techStr}
      ])

      projectsMarkdown.updateField(tableField, `<div align="center">${fieldTable.getTable()}</div>`)
    })
  })

  projectsMarkdown.saveFile()
}
