#!/bin/bash

if [ "$1" = "viz" ]; then
  npx tsx scripts/ascii-viz.ts
elif [ "$1" = "update-repos" ]; then
  npx tsx scripts/update-markdown-repos.ts
else
  echo "Usage: ./scripts/run.sh [viz|update-repos]"
  echo ""
  echo "Commands:"
  echo "  viz          - Display ASCII visualization of GitHub repos"
  echo "  update-repos - Update markdown with repo data"
fi
