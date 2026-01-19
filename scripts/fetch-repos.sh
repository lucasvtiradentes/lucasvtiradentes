#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ONLY_PUBLIC=true
USERNAME="lucasvtiradentes"
OUTPUT_FILE="$SCRIPT_DIR/../repos.json"
REPOS_TS="$SCRIPT_DIR/update-markdown-repos.ts"

get_visibility() {
  if [ "$ONLY_PUBLIC" = true ]; then
    echo "public"
  else
    echo "public,private"
  fi
}

fetch_repos() {
  local visibility=$(get_visibility)

  gh repo list "$USERNAME" \
    --visibility "$visibility" \
    --limit 1000 \
    --json name,description,repositoryTopics,createdAt,updatedAt,pushedAt,primaryLanguage \
    | jq --indent 2 '[.[] | {name: .name, description: .description, keywords: [.repositoryTopics[]?.name // empty], createdAt: .createdAt, updatedAt: .updatedAt, pushedAt: .pushedAt, mainLanguage: .primaryLanguage.name}]' > "$OUTPUT_FILE"

  echo "Saved $(jq length "$OUTPUT_FILE") repos to $OUTPUT_FILE"
}

update_repos_type() {
  local repos_names=$(jq -r '[.[].name] | map("'"'"'\(.)'"'"'") | join(" | ")' "$OUTPUT_FILE")
  sed -i "s/^type RepoName = .*/type RepoName = $repos_names/" "$REPOS_TS"

  echo "Updated RepoName type in $REPOS_TS"
}

main() {
  fetch_repos
  update_repos_type
}

main
