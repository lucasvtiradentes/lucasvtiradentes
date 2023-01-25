import Json2mdfields from 'json2mdfields'

const FIELDS = [
  "TECHNOLOGIES_TUTORIALS",
  "DEVELOPMENT_CAREER",
  "DEVELOPMENT_SETUP",
  "JAVASCRIPT_TUTORIALS",
  "NODEJS_TUTORIALS",
  "NODEJS_TEMPLATES",
  "NODEJS_UTILITIES"
]

const articlesMarkdown = new Json2mdfields('./portfolio/ARTICLES.md', FIELDS)
const articlesJson = articlesMarkdown.getJsonContent("./json/articles.json");
FIELDS.forEach(field => {
  const curCategory = field.replace('_', ' ')
  const articlesCount = articlesJson.filter((item: any) => item.category === curCategory).length
  articlesMarkdown.updateField(`${field}_COUNT`, `${getParsedCategory(curCategory.toLocaleLowerCase())} (${articlesCount})`)
})
FIELDS.forEach(field => articlesMarkdown.updateField(field, getCategoryTable(articlesJson, field.replace('_', ' '))))
articlesMarkdown.updateFile()

/* ========================================================================== */

function getParsedCategory(oldName: string): string{

  const newNames = {
    "technologies tutorials": "technologies",
    "development career": "dev career",
    "development setup": "dev setup",
    "javascript tutorials": "javascript",
    "nodejs tutorials": "nodejs"
  }

  const newName = newNames[oldName as keyof typeof newNames]
  return newName ? newName : oldName
}

function getCategoryTable(articlesJson: any[], category: string){

  const iconsJson = articlesMarkdown.getJsonContent("./json/icons.json");
  const categoryArticlesArr = articlesJson.filter((item: any) => item.category === category)

  const articlesTable = articlesMarkdown.createTable();

  articlesTable.setHeader([
    { content: 'date', width: 120, align: 'left' },
    { content: 'article', width: 600 },
    { content: 'motivation', width: 300 },
    { content: 'tech', width: 100 }
  ]);

  categoryArticlesArr.forEach((item: any) => {
    const { category, article, motivation, date, tech, links } = item;

    const techStr = tech.length === 0 ? '' : tech.filter((ctech: string) => iconsJson.map((item: any) => item.name).includes(ctech)).map((ctech: string) => {
      const icon = iconsJson.find((icon: any) => icon.name === ctech)
      return `\n      <a target="_blank" href="${icon.default_link}"><img src="${icon.image}"></a>`
    }).join('') + '\n    '

    const articleStr = links.length === 0 ? article : `      <p>${article}</p>` + links.filter((link: any) => iconsJson.map((item: any) => item.name).includes(link.name)).map((link: any) => {
      const icon = iconsJson.find((icon: any) => icon.name === link.name)
      return `\n      <a target="_blank" href="${link.link}"><img src="${icon.image}" alt="${icon.name}"></a>`
    }).join('') + '\n    '

    const bodyRow: any = [
      { content: date, align: 'center' },
      { content: articleStr, align: 'center' },
      { content: motivation, align: 'left' },
      { content: techStr, align: 'center' }
    ];
    articlesTable.addBodyRow(bodyRow);
  });

  return articlesTable.getTable()
}