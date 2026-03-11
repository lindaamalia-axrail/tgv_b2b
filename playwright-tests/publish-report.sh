#!/bin/bash
# Publishes the local playwright-report to GitHub Pages
# Usage: ./publish-report.sh

set -e

REPORT_DIR="playwright-report"

if [ ! -d "$REPORT_DIR" ]; then
  echo "❌ No playwright-report folder found. Run your tests first."
  exit 1
fi

echo "📦 Publishing report to GitHub Pages..."

# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Create a temp directory and copy report
TEMP_DIR=$(mktemp -d)
cp -r "$REPORT_DIR"/* "$TEMP_DIR"/

# Switch to gh-pages branch (create if doesn't exist)
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
  git rm -rf . 2>/dev/null || true
fi

# Clean and copy report files
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
cp -r "$TEMP_DIR"/* .

# Commit and push
git add -A
git commit -m "Update Playwright report - $(date '+%Y-%m-%d %H:%M:%S')"
git push origin gh-pages --force

# Switch back
git checkout "$CURRENT_BRANCH"
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Report published!"
echo "🔗 https://lindanuranisa.github.io/tgv-b2b/"
