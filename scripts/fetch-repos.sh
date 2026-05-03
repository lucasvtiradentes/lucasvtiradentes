#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USERNAME="lucasvtiradentes"
PUBLIC_FILE="$SCRIPT_DIR/../repos.json"
PRIVATE_FILE="$SCRIPT_DIR/../private-repos.json"

fetch_repos() {
  local visibility="$1"
  local output_file="$2"
  local tmp_file

  tmp_file="$(mktemp)"

  if [ "$visibility" = "public" ]; then
    gh api --paginate "/users/$USERNAME/repos?type=owner&sort=pushed&direction=desc&per_page=100" \
      | jq --slurp --indent 2 '[.[][] | {name: .name, description: .description, keywords: (.topics // []), createdAt: .created_at, updatedAt: .updated_at, pushedAt: .pushed_at, mainLanguage: .language}]' > "$tmp_file"
  else
    gh api --paginate "/user/repos?visibility=private&affiliation=owner&sort=pushed&direction=desc&per_page=100" \
      | jq --slurp --arg owner "$USERNAME" --indent 2 '[.[][] | select(.owner.login == $owner) | {name: .name, description: .description, keywords: (.topics // []), createdAt: .created_at, updatedAt: .updated_at, pushedAt: .pushed_at, mainLanguage: .language}]' > "$tmp_file"
  fi

  jq empty "$tmp_file"
  mv "$tmp_file" "$output_file"

  echo "Saved $(jq length "$output_file") repos to $output_file"
}

fetch_repos "public" "$PUBLIC_FILE"
fetch_repos "private" "$PRIVATE_FILE"
