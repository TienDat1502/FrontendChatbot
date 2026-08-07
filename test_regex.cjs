const fs = require('fs');
let data = JSON.parse(fs.readFileSync('/Users/nphuong/Documents/GitHub/FrontendChatbot/backend/data/out.json', 'utf8'));

for (let i = 0; i < data.length; i++) {
  if (data[i].intent === 'MY_ANNUALLEAVE') {
      const tables = data[i].resp.data.Data;
      let finalMessage = tables.Table1?.[0]?.DESCRIPTION || "";
      
      finalMessage = finalMessage.replace(/<Table>\n([\s\S]*?)\n<\/Table>/gi, (match, csvContent) => {
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return match;

        const parseCsvLine = (line) => {
          return line.split(',').map(cell => {
            let val = cell.trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.substring(1, val.length - 1);
            }
            if (val === 'null' || !val) val = '-';
            return val;
          });
        };

        const headers = parseCsvLine(lines[0]);
        const markdownLines = [];
        
        markdownLines.push('| ' + headers.join(' | ') + ' |');
        markdownLines.push('|' + headers.map(() => '---').join('|') + '|');
        
        for (let j = 1; j < lines.length; j++) {
          const cells = parseCsvLine(lines[j]);
          markdownLines.push('| ' + cells.join(' | ') + ' |');
        }
        
        return markdownLines.join('\n');
      });
      console.log(finalMessage);
  }
}
