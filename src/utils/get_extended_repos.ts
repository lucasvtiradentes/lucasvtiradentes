import { getJson } from "dyn-markdown"
import { CONFIGS } from "../configs/configs"
import { TExtendedRepoInfo, TGithubRepoInfo, TLocalRepoInfo } from "../update_projects/project.schema"

export const getExtendedRepos = (githubRepositories: TGithubRepoInfo[]) => {
  const localRepositories = getJson(CONFIGS.projects_json) as TLocalRepoInfo[]
  const extendedRepositories: TExtendedRepoInfo[] = githubRepositories.map(githubRepoInfo => {
    const localRepoInfo = localRepositories.find(item => item.name === githubRepoInfo.name)
    if (!localRepoInfo) throw new Error(`please add the repo ${githubRepoInfo.name} locally!`)

    return {
      ...githubRepoInfo,
      ...localRepoInfo
    }
  })

  return extendedRepositories
}