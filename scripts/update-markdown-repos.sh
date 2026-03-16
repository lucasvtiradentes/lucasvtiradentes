#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPOS_JSON="$SCRIPT_DIR/../repos.json"
README="$SCRIPT_DIR/../README.md"

get_desc() {
  jq -r --arg name "$1" '.[] | select(.name == $name) | .description' "$REPOS_JSON"
}

row() {
  local repo="$1"
  local desc=$(get_desc "$repo")
  echo "  <tr>"
  echo "    <td><a href=\"https://github.com/lucasvtiradentes/$repo\">$repo</a></td>"
  echo "    <td>$desc</td>"
  echo "  </tr>"
}

row_with_group() {
  local group="$1"
  local rowspan="$2"
  local repo="$3"
  local desc=$(get_desc "$repo")
  echo "  <tr>"
  echo "    <td rowspan=\"$rowspan\">$group</td>"
  echo "    <td><a href=\"https://github.com/lucasvtiradentes/$repo\">$repo</a></td>"
  echo "    <td>$desc</td>"
  echo "  </tr>"
}

TABLE_FILE=$(mktemp -t update_readme)

REPO_COUNT=$(jq 'length' "$REPOS_JSON")

{
  echo "<table>"
  echo "  <tr>"
  echo "    <th>Group</th>"
  echo "    <th>Repo ($REPO_COUNT)</th>"
  echo "    <th>Description</th>"
  echo "  </tr>"

  row_with_group "AI-Assisted Development" 5 "dev-panel"
  row "branch-context"
  row "tscanner"
  row "tscanner-action"
  row "claude-code-pretty"

  row_with_group "Documentation Tools" 4 "doc-trace"
  row "doc-update"
  row "doc-align"
  row "markdown-helper"

  row_with_group "CLI Tools and Automation" 4 "chrome-cmd"
  row "sheet-cmd"
  row "gcal-sync"
  row "repositories-manager"

  row_with_group "Browser Extensions" 1 "site-tweaker"

  row_with_group "API Wrappers and Libraries" 1 "ticktick-api-lvt"

  row_with_group "Utilities" 1 "esports-notifier"

  echo "</table>"
} > "$TABLE_FILE"

START_MARKER="<!-- REPOS:START -->"
END_MARKER="<!-- REPOS:END -->"

if ! grep -q "$START_MARKER" "$README" || ! grep -q "$END_MARKER" "$README"; then
  echo "Markers not found in README.md"
  rm "$TABLE_FILE"
  exit 1
fi

head -n $(($(grep -n "$START_MARKER" "$README" | cut -d: -f1))) "$README" > "$README.tmp"
cat "$TABLE_FILE" >> "$README.tmp"
tail -n +$(($(grep -n "$END_MARKER" "$README" | cut -d: -f1))) "$README" >> "$README.tmp"

mv "$README.tmp" "$README"
rm "$TABLE_FILE"

echo "README.md updated!"
