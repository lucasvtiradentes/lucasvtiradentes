#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPOS_JSON="$SCRIPT_DIR/../repos.json"
PRIVATE_REPOS_JSON="$SCRIPT_DIR/../private-repos.json"
README="$SCRIPT_DIR/../README.md"
PRIVATE_REPOS_MD="$SCRIPT_DIR/../PRIVATE-REPOS.md"

REPO_GROUPS=(
  "Agentic engineering:branch-context,tscanner,tscanner-action"
  "Developer tools:dev-panel,repositories-manager"
  "Documentation tools:doc-trace,doc-update,doc-align,markdown-helper"
  "CLI tools:chrome-cmd,sheet-cmd,claude-code-pretty"
  "Automations:gcal-sync,esports-notifier"
  "General:site-tweaker,ticktick-api-lvt,lucasvtiradentes"
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

TABLE_FILE=$(mktemp -t update_readme)
generate_table > "$TABLE_FILE"

head -n $(($(grep -n "$START_MARKER" "$README" | cut -d: -f1))) "$README" > "$README.tmp"
cat "$TABLE_FILE" >> "$README.tmp"
tail -n +$(($(grep -n "$END_MARKER" "$README" | cut -d: -f1))) "$README" >> "$README.tmp"

mv "$README.tmp" "$README"
rm "$TABLE_FILE"

echo "README.md updated!"

generate_private_repos_md
