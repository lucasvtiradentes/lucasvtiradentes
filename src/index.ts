import { updateProjects } from "./update_projects/update_projects"
import { updateReadme } from "./update_readme/update_readme"
import { getExtendedRepos } from "./utils/get_extended_repos"
import { getGithubRepositoriesInfo } from "./utils/get_updated_github_repos"

async function main(){

  // const githubRepositories = getJson(CONFIGS.github_projects_json) as TGithubRepoInfo[]
  const githubRepositories = await getGithubRepositoriesInfo()
  const extendedRepositories = getExtendedRepos(githubRepositories)

  await updateProjects(extendedRepositories)
  await updateReadme(extendedRepositories)
}

main()