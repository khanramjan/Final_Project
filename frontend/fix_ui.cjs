const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const replacements = [
  // Gradients to solid
  { regex: /bg-gradient-to-[a-z]+ from-([a-z]+)-(\d+)( via-[a-z]+-\d+)? to-([a-z]+)-(\d+)/g, replace: 'bg-$1-$2' },
  // 2xl/xl rounding to md/lg
  { regex: /rounded-2xl/g, replace: 'rounded-lg' },
  { regex: /rounded-xl/g, replace: 'rounded-md' },
  // AI shadows
  { regex: /shadow-[a-z]+-md|shadow-[a-z]+-lg|shadow-[a-z]+-xl|shadow-[a-z]+-2xl/g, replace: 'shadow-sm' },
  { regex: /shadow-2xl/g, replace: 'shadow-lg' },
  { regex: /shadow-xl/g, replace: 'shadow-md' },
  // Extra AI paddings and blurred backgrounds
  { regex: /backdrop-blur-[a-z]+/g, replace: '' },
  { regex: /bg-white\/[0-9]+/g, replace: 'bg-white' },
];

walkDir(path.resolve(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replace);
    });

    // Remove SparklesIcon imports
    content = content.replace(/,\s*SparklesIcon/g, '');
    content = content.replace(/SparklesIcon\s*,?/g, '');
    // Remove usage of SparklesIcon
    content = content.replace(/<SparklesIcon[^>]*\/>/g, '');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});