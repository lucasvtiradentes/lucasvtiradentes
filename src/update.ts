import { DynMarkdown, MarkdownTable, getJson } from 'dyn-markdown'
import { join } from 'path';

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
  featured: boolean;
  package: boolean;
}

const readmeMarkdown = new DynMarkdown('./README.md')
const projectsMarkdown = new DynMarkdown('./portfolio/PROJECTS.md')
const projectsJson = getJson('./src/projects.json')
const iconsJson = getJson('./src/icons.json')

updateReadmeMarkdown()
updateProjectsMarkdown()

/* -------------------------------------------------------------------------- */

function updateReadmeMarkdown(){

  const featuredProjects = projectsJson.filter((project: Project) => project.featured)

  const fieldTable = new MarkdownTable()
    fieldTable.setHeader([
      { content: 'Project', width: 215 },
      { content: 'Description', width: 400 },
      { content: 'Demo', width: 215 },
      { content: 'Tech', width: 100, align: 'center' }
    ])

    featuredProjects.forEach((project: Project) => {

      const projectLink = `https://github.com/${project.repository}#readme`
      const stars = `<a href="${projectLink}"><img src="https://badgen.net/github/stars/${project.repository}/"></a>`
      const nameStr = project.repository === '' ? project.name : `<a href="${projectLink}">${project.name}</a><br>${stars}`
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
        {content: project.image.path ? `<a href="${projectLink}"><img src="${project.image.path}" width="${project.image.width}"></a>` : 'N/A', align: 'center'},
        {content: techStr}
      ])

    })

  const table = fieldTable.getTable()
  const div = `<details>\n  <summary align="center"><b>⭐ featured projects (${featuredProjects.length})</b></summary>\n  <br>\n  <div align="center">\n${table.split("\n").map(line => `    ${line}`).join("\n")}\n  </div>\n</details>`
  readmeMarkdown.updateField('FEATURED_PROJECTS', div)
  readmeMarkdown.saveFile()
  console.log(div);
}

function updateProjectsMarkdown(){

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

      const npmLink = project.package ? `<a href="https://www.npmjs.com/package/${project.name}"><img src="https://img.shields.io/npm/v/${project.name}.svg?style=flat" alt="npm version"></a>` : ''
      const projectLink = `https://github.com/${project.repository}#readme`
      const nameStr = project.repository === '' ? project.name : `<a href="${projectLink}">${project.name}</a><br><a href="https://github.com/${project.repository}/commits/master">${npmLink}`
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
        {content: project.image.path ? `<a href="#"><img src="${join('..', project.image.path)}" width="${project.image.width}"></a>` : 'N/A', align: 'center'},
        {content: techStr}
      ])

      projectsMarkdown.updateField(tableField, projectsMarkdown.wrapContentInsideTag(fieldTable.getTable(), 'div', { align: 'center'}))
    })
  })

  projectsMarkdown.saveFile()

}