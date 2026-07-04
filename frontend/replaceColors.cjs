const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/bg-orange-500 hover:bg-orange-600 text-white/g, 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900');
  content = content.replace(/bg-orange-500 text-white/g, 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900');

  content = content.replace(/from-orange-500 to-orange-600 text-white/g, 'from-zinc-800 to-zinc-900 text-white dark:from-zinc-200 dark:to-white dark:text-zinc-900');
  content = content.replace(/from-orange-400 to-orange-600 text-white/g, 'from-zinc-700 to-zinc-900 text-white dark:from-zinc-300 dark:to-white dark:text-zinc-900');

  content = content.replace(/from-orange-500 to-orange-600 bg-clip-text text-transparent/g, 'from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent');
  content = content.replace(/from-orange-500 to-purple-600 bg-clip-text text-transparent/g, 'from-zinc-800 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent');
  content = content.replace(/from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent/g, 'from-zinc-800 via-zinc-600 to-zinc-900 dark:from-zinc-200 dark:via-zinc-400 dark:to-white bg-clip-text text-transparent');

  content = content.replace(/text-orange-500/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/hover:text-orange-500/g, 'hover:text-zinc-600 dark:hover:text-zinc-300');
  content = content.replace(/hover:text-orange-600/g, 'hover:text-zinc-500 dark:hover:text-zinc-400');
  content = content.replace(/group-focus-within:text-orange-500/g, 'group-focus-within:text-zinc-900 dark:group-focus-within:text-white');

  content = content.replace(/bg-orange-100/g, 'bg-zinc-100 dark:bg-zinc-800');
  content = content.replace(/bg-orange-50/g, 'bg-zinc-50 dark:bg-zinc-800/50');
  content = content.replace(/from-orange-50/g, 'from-zinc-50 dark:from-zinc-900');
  content = content.replace(/to-orange-50/g, 'to-zinc-50 dark:to-zinc-900');
  
  content = content.replace(/from-orange-400 to-orange-600/g, 'from-zinc-800 to-zinc-900 dark:from-zinc-200 dark:to-white');
  content = content.replace(/from-orange-100 to-orange-200/g, 'from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700');
  content = content.replace(/dark:from-orange-900\/30/g, 'dark:from-zinc-800');
  content = content.replace(/dark:to-orange-800\/30/g, 'dark:to-zinc-700');

  content = content.replace(/border-orange-500/g, 'border-zinc-900 dark:border-white');
  content = content.replace(/focus:border-orange-500/g, 'focus:border-zinc-900 dark:focus:border-white');
  content = content.replace(/hover:border-orange-500/g, 'hover:border-zinc-900 dark:hover:border-white');
  content = content.replace(/focus:ring-orange-500\/10/g, 'focus:ring-zinc-900/10 dark:focus:ring-white/10');
  content = content.replace(/focus:ring-orange-500\/20/g, 'focus:ring-zinc-900/20 dark:focus:ring-white/20');
  content = content.replace(/group-hover:border-orange-500\/30/g, 'group-hover:border-zinc-900/30 dark:group-hover:border-white/30');

  content = content.replace(/shadow-orange-500\/25/g, 'shadow-zinc-900/20 dark:shadow-white/20');
  content = content.replace(/shadow-orange-500\/40/g, 'shadow-zinc-900/30 dark:shadow-white/30');
  
  content = content.replace(/text-orange-400/g, 'text-zinc-800 dark:text-zinc-200');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

function processCss(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(/rgba\(249, 115, 22/g, 'rgba(24, 24, 27');
  content = content.replace(/#f97316/g, '#18181b');
  content = content.replace(/#ea580c/g, '#09090b');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}

walkDir('./src');
processCss('./src/assets/styles/index.css');
