#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPOS_JSON="$SCRIPT_DIR/../repos.json"
README="$SCRIPT_DIR/../README.md"

REPO_GROUPS=(
  "AI-Assisted Development:branch-context,dev-panel,tscanner,tscanner-action"
  "Documentation Tools:doc-trace,doc-update,doc-align,markdown-helper"
  "CLI Tools:chrome-cmd,sheet-cmd,claude-code-pretty,repositories-manager"
  "General:gcal-sync,esports-notifier,site-tweaker,ticktick-api-lvt,lucasvtiradentes"
)

get_desc() {
  jq -r --arg name "$1" '.[] | select(.name == $name) | .description' "$REPOS_JSON"
}

generate_table() {
  local total_repos=0
  local i group_def group_name repos_str

  for i in "${!REPO_GROUPS[@]}"; do
    group_def="${REPO_GROUPS[$i]}"
    repos_str=$(echo "$group_def" | cut -d: -f2)
    count=$(echo "$repos_str" | tr ',' '\n' | wc -l | tr -d ' ')
    total_repos=$((total_repos + count))
  done

  echo "<table>"
  echo "  <tr>"
  echo "    <th>Group</th>"
  echo "    <th>Repo ($total_repos)</th>"
  echo "    <th>Description</th>"
  echo "  </tr>"

  for i in "${!REPO_GROUPS[@]}"; do
    group_def="${REPO_GROUPS[$i]}"
    group_name=$(echo "$group_def" | cut -d: -f1)
    repos_str=$(echo "$group_def" | cut -d: -f2)

    repos_list=$(echo "$repos_str" | tr ',' '\n')
    count=$(echo "$repos_list" | wc -l | tr -d ' ')
    first=true

    echo "$repos_list" | while read -r repo; do
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
}

START_MARKER="<!-- REPOS:START -->"
END_MARKER="<!-- REPOS:END -->"

if ! grep -q "$START_MARKER" "$README" || ! grep -q "$END_MARKER" "$README"; then
  echo "Markers not found in README.md"
  exit 1
fi

TABLE_FILE=$(mktemp -t update_readme)
generate_table > "$TABLE_FILE"

head -n $(($(grep -n "$START_MARKER" "$README" | cut -d: -f1))) "$README" > "$README.tmp"
cat "$TABLE_FILE" >> "$README.tmp"
tail -n +$(($(grep -n "$END_MARKER" "$README" | cut -d: -f1))) "$README" >> "$README.tmp"

mv "$README.tmp" "$README"
rm "$TABLE_FILE"

echo "README.md updated!"
