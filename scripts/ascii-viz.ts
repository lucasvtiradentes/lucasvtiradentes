import reposData from '../repos.json';

type RepoInfo = {
  name: string;
  description: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  mainLanguage: string | null;
};

const REPOS: RepoInfo[] = reposData;

const LANGUAGE_ICONS: Record<string, string> = {
  'TypeScript': '⚡',
  'Rust': '🦀',
  'Svelte': '🔥',
  'JavaScript': '📜',
  'Python': '🐍',
  'null': '📦'
};

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function drawBox(text: string, width: number, color: string = COLORS.cyan): string {
  const lines = [];
  const innerWidth = width - 4;

  lines.push(color + '╔' + '═'.repeat(width - 2) + '╗' + COLORS.reset);

  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= innerWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      const padding = Math.floor((innerWidth - currentLine.length) / 2);
      lines.push(color + '║ ' + COLORS.reset + ' '.repeat(padding) + currentLine + ' '.repeat(innerWidth - currentLine.length - padding) + color + ' ║' + COLORS.reset);
      currentLine = word;
    }
  }

  if (currentLine) {
    const padding = Math.floor((innerWidth - currentLine.length) / 2);
    lines.push(color + '║ ' + COLORS.reset + ' '.repeat(padding) + currentLine + ' '.repeat(innerWidth - currentLine.length - padding) + color + ' ║' + COLORS.reset);
  }

  lines.push(color + '╚' + '═'.repeat(width - 2) + '╝' + COLORS.reset);

  return lines.join('\n');
}

function createRepoCard(repo: RepoInfo): string {
  const icon = LANGUAGE_ICONS[repo.mainLanguage || 'null'] || '📦';
  const lang = repo.mainLanguage || 'N/A';
  const keywords = repo.keywords.slice(0, 3).join(', ') || 'no keywords';

  return `
${COLORS.bright}${icon} ${repo.name}${COLORS.reset}
${COLORS.dim}${repo.description}${COLORS.reset}
${COLORS.yellow}Language:${COLORS.reset} ${lang}
${COLORS.green}Keywords:${COLORS.reset} ${keywords}
`;
}

function createLanguageChart(): string {
  const languageCounts: Record<string, number> = {};

  REPOS.forEach(repo => {
    const lang = repo.mainLanguage || 'Other';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });

  const total = REPOS.length;
  const sorted = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);

  let chart = `\n${COLORS.bright}${COLORS.cyan}Language Distribution${COLORS.reset}\n\n`;

  sorted.forEach(([lang, count]) => {
    const percentage = (count / total * 100).toFixed(1);
    const barLength = Math.round(count / total * 40);
    const bar = '█'.repeat(barLength);
    const icon = LANGUAGE_ICONS[lang] || '📦';

    chart += `${icon} ${COLORS.yellow}${lang.padEnd(12)}${COLORS.reset} ${COLORS.green}${bar}${COLORS.reset} ${percentage}% (${count})\n`;
  });

  return chart;
}

function createTimeline(): string {
  const repos = [...REPOS].sort((a, b) =>
    new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
  ).slice(0, 5);

  let timeline = `\n${COLORS.bright}${COLORS.magenta}Recently Active Repositories${COLORS.reset}\n\n`;

  repos.forEach((repo, idx) => {
    const date = new Date(repo.pushedAt);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    const icon = LANGUAGE_ICONS[repo.mainLanguage || 'null'] || '📦';

    timeline += `${COLORS.blue}${idx + 1}.${COLORS.reset} ${icon} ${COLORS.bright}${repo.name}${COLORS.reset}\n`;
    timeline += `   ${COLORS.dim}${daysAgo} days ago${COLORS.reset}\n\n`;
  });

  return timeline;
}

function createASCIIArt(): void {
  console.clear();

  const title = 'GITHUB REPOSITORY VISUALIZER';
  console.log('\n' + drawBox(title, 60, COLORS.cyan));
  console.log(`\n${COLORS.dim}Total Repositories: ${REPOS.length}${COLORS.reset}\n`);

  console.log(createLanguageChart());
  console.log(createTimeline());

  console.log(`\n${COLORS.bright}${COLORS.blue}Most Keyword-Rich Projects${COLORS.reset}\n`);
  const topKeywords = [...REPOS]
    .sort((a, b) => b.keywords.length - a.keywords.length)
    .slice(0, 3);

  topKeywords.forEach((repo, idx) => {
    const icon = LANGUAGE_ICONS[repo.mainLanguage || 'null'] || '📦';
    console.log(`${COLORS.yellow}${idx + 1}.${COLORS.reset} ${icon} ${COLORS.bright}${repo.name}${COLORS.reset} (${repo.keywords.length} keywords)`);
    console.log(`   ${COLORS.dim}${repo.keywords.slice(0, 5).join(', ')}${COLORS.reset}\n`);
  });

  console.log(`\n${COLORS.green}${'═'.repeat(60)}${COLORS.reset}\n`);
}

createASCIIArt();
