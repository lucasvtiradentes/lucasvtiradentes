import { TGithubRepoInfo } from "../update_projects/project.schema"

export async function getGithubRepositoriesInfo(): Promise<TGithubRepoInfo[]>{
  const githubResponse = await fetch("https://api.github.com/users/lucasvtiradentes/repos")
  const data = JSON.parse(await githubResponse.text())
  const parsedRepos = data.map((repo: any) => ({
    name: repo.name,
    repo_link: repo.html_url,
    description: repo.description,
    topics: repo.topics,
    issues: repo.open_issues,
    stars: repo.stargazers_count,
    homepage: repo.homepage
  }))
  return parsedRepos
}
