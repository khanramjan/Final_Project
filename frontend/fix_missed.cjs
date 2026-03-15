const fs = require('fs');

function applyFix(file, stringReplaces, regexReplaces = []) {
  let content = fs.readFileSync(file, 'utf8');
  stringReplaces.forEach(r => { content = content.split(r[0]).join(r[1]); });
  regexReplaces.forEach(r => { content = content.replace(r[0], r[1]); });
  fs.writeFileSync(file, content, 'utf8');
}

applyFix('src/components/AdminLayout.tsx', [['SparklesIcon', 'StarIcon']]);
applyFix('src/components/AdminSidebar.tsx', [['SparklesIcon', 'StarIcon']]);
applyFix('src/components/ImpactInsights.tsx', [['SparklesIcon', 'StarIcon']]);
applyFix('src/pages/admin/MLInsights.tsx', [['SparklesIcon', 'StarIcon']]);
applyFix('src/pages/volunteer/VolunteerAchievementsPage.tsx', [['SparklesIcon', 'StarIcon']]);

const baseRegex = [
  // Gradients to solid
  [/bg-gradient-to-[a-z]+ from-([a-z]+)-(\d+)( via-[a-z]+-\d+)? to-([a-z]+)-(\d+)/g, 'bg-$1-$2'],
  // 2xl/xl rounding to md/lg
  [/rounded-2xl/g, 'rounded-lg'],
  [/rounded-xl/g, 'rounded-md'],
  // AI shadows
  [/shadow-[a-z]+-md|shadow-[a-z]+-lg|shadow-[a-z]+-xl|shadow-[a-z]+-2xl/g, 'shadow-sm'],
  [/shadow-2xl/g, 'shadow-lg'],
  [/shadow-xl/g, 'shadow-md'],
  // Extra AI paddings and blurred backgrounds
  [/backdrop-blur-[a-z]+/g, ''],
  [/bg-white\/[0-9]+/g, 'bg-white'],
]

applyFix('src/components/AdminLayout.tsx', [], baseRegex);
applyFix('src/components/AdminSidebar.tsx', [], baseRegex);
applyFix('src/components/ImpactInsights.tsx', [], baseRegex);
applyFix('src/pages/admin/MLInsights.tsx', [], baseRegex);
applyFix('src/pages/volunteer/VolunteerAchievementsPage.tsx', [], baseRegex);
