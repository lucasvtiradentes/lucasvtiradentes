import { DynMarkdown, MarkdownTable, getJson } from 'dyn-markdown'

const COUNT_FIELDS = ['WORK_COUNT', 'OPEN_SOURCE_COUNT', 'PRACTICE_COUNT', 'OTHER_COUNT']
const TABLE_FIELDS = ['WORK_TABLE', 'OPEN_SOURCE_TABLE', 'PRACTICE_PROJECT_ADVANCED_TABLE', 'PRACTICE_PROJECT_BASIC_TABLE', 'OTHER_TABLE'] as const

type Icon = {
  name: string;
  image: string;
  default_link: string;
}

type Project = {
  name: string;
  repository: string;
  category: (typeof TABLE_FIELDS)[number]
  description: string;
  image: {
    path: string;
    width: string;
  }
  tech: string[];
}

const projectsMarkdown = new DynMarkdown('./portfolio/PROJECTS.md')
const projectsJson = getJson('./src/projects.json')
const iconsJson = getJson('./src/icons.json')

projectsMarkdown.updateField('PROJECTS_COUNT', `ALL MY GITHUB PROJECTS (${projectsJson.filter((item: Project) => item.repository !== "").length})`)

COUNT_FIELDS.forEach((field: string) => {
  const tmp_field = field.toLocaleLowerCase().replace("_count", '')
  const qnt = projectsJson.filter((item: Project) => item.repository !== "").map((item: Project) => item.category).filter((category: string) => category.search(tmp_field) > -1).length
  projectsMarkdown.updateField(field, `${tmp_field.replace('_', ' ')} (${qnt})`)
})

TABLE_FIELDS.forEach((tableField) => {

  const fieldTable = new MarkdownTable()
  fieldTable.setHeader([
    { content: 'Project', width: 215 },
    { content: 'Description', width: 400 },
    { content: 'Demo', width: 215 },
    { content: 'Tech', width: 100, align: 'center' }
  ])

  const projectCategory = tableField.replace('_TABLE', '').toLowerCase()
  const fieldItems = projectsJson.filter((item: Project) => item.category === projectCategory)

  fieldItems.forEach((project: Project) => {

    const nameStr = project.repository === '' ? project.name : `<a href="https://github.com/${project.repository}">${project.name}</a><br><a href="https://github.com/${project.repository}/commits/master"><img src="https://img.shields.io/github/last-commit/${project.repository}?color=green&label=updated"></a>`
    const techStr = project.tech.length === 0 ? '' : project.tech.filter((ctech: string) => {
      const hasIcon = iconsJson.map((item: Icon) => item.name).includes(ctech)
      if (!hasIcon){
        console.log(`could not find the ${ctech} icon!`)
      }
      return hasIcon
    }).map((ctech: string) => {
      const icon = iconsJson.find((icon: Icon) => icon.name === ctech)
      return `\n      <a target="_blank" href="${icon?.default_link}"><img src="${icon?.image}"></a>`
    }).join('') + '\n    '

    fieldTable.addBodyRow([
      {content: nameStr, align: 'center'},
      {content: project.description},
      {content: project.image.path ? `<a href="#"><img src="${project.image.path}" width="${project.image.width}"></a>` : 'N/A', align: 'center'},
      {content: techStr}
    ])

    projectsMarkdown.updateField(tableField, projectsMarkdown.wrapContentInsideTag(fieldTable.getTable(), 'div', { align: 'center'}))
  })
})

projectsMarkdown.saveFile()
