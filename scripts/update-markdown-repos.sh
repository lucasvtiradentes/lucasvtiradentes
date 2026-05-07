#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPOS_JSON="$SCRIPT_DIR/../repos.json"
PRIVATE_REPOS_JSON="$SCRIPT_DIR/../private-repos.json"
README="$SCRIPT_DIR/../README.md"
PRIVATE_REPOS_MD="$SCRIPT_DIR/../PRIVATE-REPOS.md"

REPO_GROUPS=(
  "Developer tools:branch-context,dev-panel,mention-at-codex,tscanner,tscanner-action,repositories-manager"
  "Documentation:doc-trace,doc-update,doc-align"
  "Automations:gcal-sync,esports-notifier"
  "Integrations:gsheet,ticktick-api-lvt"
  "Utilities:site-tweaker,markdown-helper,pretty-session"
  "Profile:lucasvtiradentes"
)

get_desc() {
  jq -r --arg name "$1" '.[] | select(.name == $name) | .description' "$REPOS_JSON"
}

repo_exists() {
  jq -e --arg name "$1" '.[] | select(.name == $name)' "$REPOS_JSON" > /dev/null
}

repo_is_grouped() {
  local repo="$1"
  local group_def repos_str grouped_repo

  for group_def in "${REPO_GROUPS[@]}"; do
    repos_str=$(echo "$group_def" | cut -d: -f2)
    IFS=',' read -ra repos_array <<< "$repos_str"
    for grouped_repo in "${repos_array[@]}"; do
      if [ "$grouped_repo" = "$repo" ]; then
        return 0
      fi
    done
  done

  return 1
}

validate_grouped_repos() {
  local missing=0
  local group_def repo repos_str

  while IFS= read -r repo; do
    if ! repo_is_grouped "$repo"; then
      echo "Missing repo in REPO_GROUPS: $repo" >&2
      missing=1
    fi
  done < <(jq -r '.[].name' "$REPOS_JSON")

  for group_def in "${REPO_GROUPS[@]}"; do
    repos_str=$(echo "$group_def" | cut -d: -f2)
    IFS=',' read -ra repos_array <<< "$repos_str"
    for repo in "${repos_array[@]}"; do
      if ! repo_exists "$repo"; then
        echo "Missing repo in repos.json: $repo" >&2
        missing=1
      fi
    done
  done

  if [ "$missing" -ne 0 ]; then
    exit 1
  fi
}

generate_table() {
  local total_repos=0
  local i group_def group_name repos_str count repo

  for i in "${!REPO_GROUPS[@]}"; do
    group_def="${REPO_GROUPS[$i]}"
    repos_str=$(echo "$group_def" | cut -d: -f2)
    count=0
    IFS=',' read -ra repos_array <<< "$repos_str"
    for repo in "${repos_array[@]}"; do
      if repo_exists "$repo"; then
        count=$((count + 1))
      fi
    done
    total_repos=$((total_repos + count))
  done

  echo "<div align=\"center\">"
  echo ""
  echo "<table>"
  echo "  <tr>"
  echo "    <th>Category</th>"
  echo "    <th>Repo ($total_repos)</th>"
  echo "    <th>Description</th>"
  echo "  </tr>"

  for i in "${!REPO_GROUPS[@]}"; do
    group_def="${REPO_GROUPS[$i]}"
    group_name=$(echo "$group_def" | cut -d: -f1)
    repos_str=$(echo "$group_def" | cut -d: -f2)

    count=0
    IFS=',' read -ra repos_array <<< "$repos_str"
    for repo in "${repos_array[@]}"; do
      if repo_exists "$repo"; then
        count=$((count + 1))
      fi
    done

    if [ "$count" -eq 0 ]; then
      continue
    fi

    first=true

    for repo in "${repos_array[@]}"; do
      if ! repo_exists "$repo"; then
        continue
      fi

      desc=$(get_desc "$repo")
      echo "  <tr>"
      if $first; then
        echo "    <td rowspan=\"$count\">$group_name</td>"
        first=false
      fi
      echo "    <td><a href=\"https://github.com/lucasvtiradentes/$repo\">$repo</a></td>"
      echo "    <td>$desc</td>"
      echo "  </tr>"
    done
  done

  echo "</table>"
  echo ""
  echo "</div>"
}

generate_private_repos_md() {
  if [ ! -f "$PRIVATE_REPOS_JSON" ]; then
    echo "⚠️  Warning: $PRIVATE_REPOS_JSON not found, skipping PRIVATE-REPOS.md generation"
    return 1
  fi

  local total
  total=$(jq 'length' "$PRIVATE_REPOS_JSON")

  {
    echo "<!-- PRIVATE-REPOS:START -->"
    echo "<div align=\"center\">"
    echo ""
    echo "<table>"
    echo "  <tr>"
    echo "    <th>Repo ($total)</th>"
    echo "    <th>Description</th>"
    echo "  </tr>"

    jq -r '.[] | "  <tr>\n    <td>\(.name)</td>\n    <td>\(.description)</td>\n  </tr>"' "$PRIVATE_REPOS_JSON"

    echo "</table>"
    echo ""
    echo "</div>"
    echo "<!-- PRIVATE-REPOS:END -->"
  } > "$PRIVATE_REPOS_MD"

  echo "PRIVATE-REPOS.md updated!"
}

START_MARKER="<!-- REPOS:START -->"
END_MARKER="<!-- REPOS:END -->"

if ! grep -q "$START_MARKER" "$README" || ! grep -q "$END_MARKER" "$README"; then
  echo "Markers not found in README.md"
  exit 1
fi

validate_grouped_repos

TABLE_FILE=$(mktemp -t update_readme)
generate_table > "$TABLE_FILE"

head -n $(($(grep -n "$START_MARKER" "$README" | cut -d: -f1))) "$README" > "$README.tmp"
cat "$TABLE_FILE" >> "$README.tmp"
tail -n +$(($(grep -n "$END_MARKER" "$README" | cut -d: -f1))) "$README" >> "$README.tmp"

mv "$README.tmp" "$README"
rm "$TABLE_FILE"

echo "README.md updated!"

generate_private_repos_md
