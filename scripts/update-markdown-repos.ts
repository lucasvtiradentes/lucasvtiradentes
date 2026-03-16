import reposData from '../repos.json'

type RepoInfo = {
  name: string
  description: string
  keywords: string[]
  createdAt: string
  updatedAt: string
  pushedAt: string
  mainLanguage: string | null
}

type RepoName = 'dev-panel' | 'chrome-cmd' | 'doc-trace' | 'branch-context' | 'doc-update' | 'claude-code-pretty' | 'doc-align' | 'site-tweaker' | 'lucasvtiradentes' | 'gcal-sync' | 'tscanner' | 'tscanner-action' | 'sheet-cmd' | 'repositories-manager' | 'ticktick-api-lvt' | 'markdown-helper' | 'esports-notifier'

const REPOS: RepoInfo[] = reposData

function getRepo(name: RepoName){
  const repo = REPOS.find(repo => repo.name === name)
  
  if (!repo){
    throw new Error("Repo not found")
  }

  return repo
}

const reposByPlatform = [
  {
    platform: "vscode-extension",
    repos: [
      getRepo('tscanner'),
      getRepo('dev-panel'),
      getRepo('better-claude-code'),
    ]
  },
  {
    platform: "github-action",
    repos: [
      getRepo('tscanner-action'),
    ]
  },
  {
    platform: "cli",
    repos: [
      getRepo('tscanner'),
      getRepo('chrome-cmd'),
      getRepo('linear-cmd'),
      getRepo('sheet-cmd'),
    ]
  },
  {
    platform: "chrome-extension",
    repos: [
      getRepo('site-tweaker'),
    ]
  }
]