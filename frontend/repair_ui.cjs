const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.resolve(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix broken <className="..." /> syntax by removing them entirely
    content = content.replace(/<className="[^"]*"\s*\/>/g, '');
    content = content.replace(/<className=\{[^}]*\}\s*\/>/g, '');
    
    // Fix missing icon attributes in arrays like `icon:  current:`
    content = content.replace(/icon:\s*current:/g, 'icon: undefined, current:');
    content = content.replace(/icon:\s*},/g, 'icon: undefined },');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Repaired ${filePath}`);
    }
  }
});