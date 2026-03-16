#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ONLY_PUBLIC=true
USERNAME="lucasvtiradentes"
OUTPUT_FILE="$SCRIPT_DIR/../repos.json"

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

fetch_repos
