const fs = require('fs');
const data = JSON.parse(fs.readFileSync('backend/data/out.json', 'utf8'));

let matchCount = 0;
let missedCount = 0;

for (const item of data) {
  let text = JSON.stringify(item);
  if (text.includes('<Image') || text.includes('<image')) {
    const replaced = text.replace(/<Image>\s*([\s\S]*?)\s*<\/Image>/gi, 'REPLACED');
    if (replaced.includes('JVBER') || replaced.includes('/9j/')) {
        console.log(`Intent ${item.intent} still has base64 after replace!`);
        missedCount++;
    } else {
        matchCount++;
    }
  }
}
console.log(`Matched: ${matchCount}, Missed: ${missedCount}`);
