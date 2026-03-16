#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USERNAME="lucasvtiradentes"
PUBLIC_FILE="$SCRIPT_DIR/../repos.json"
PRIVATE_FILE="$SCRIPT_DIR/../private-repos.json"

fetch_repos() {
  local visibility="$1"
  local output_file="$2"

  gh repo list "$USERNAME" \
    --visibility "$visibility" \
    --limit 1000 \
    --json name,description,repositoryTopics,createdAt,updatedAt,pushedAt,primaryLanguage \
    | jq --indent 2 '[.[] | {name: .name, description: .description, keywords: [.repositoryTopics[]?.name // empty], createdAt: .createdAt, updatedAt: .updatedAt, pushedAt: .pushedAt, mainLanguage: .primaryLanguage.name}]' > "$output_file"

  echo "Saved $(jq length "$output_file") repos to $output_file"
}

fetch_repos "public" "$PUBLIC_FILE"
fetch_repos "private" "$PRIVATE_FILE"
