const fs = require('fs');

// Read hero.png and convert to base64
const imagePath = '/Users/nphuong/Documents/GitHub/FrontendChatbot/src/assets/hero.png';
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');
// It's a png, so we don't strictly need a prefix for our code, but our code uses:
// base64.startsWith('iVBORw') for PNG.
// The raw base64 for PNG usually starts with iVBORw0KGgo=

const dataPath = '/Users/nphuong/Documents/GitHub/FrontendChatbot/backend/data/out.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let updated = 0;

for (let i = 0; i < data.length; i++) {
  if (data[i].intent === 'MY_PHOTO_AVATAR' || data[i].intent === 'MY_PHOTO_ATTENDANCE') {
    if (data[i].resp && data[i].resp.data && data[i].resp.data.Data && data[i].resp.data.Data.Table1) {
       let description = data[i].resp.data.Data.Table1[0].DESCRIPTION;
       description = description.replace(/<Image>\s*([\s\S]*?)\s*<\/Image>/gi, `<Image>${base64Image}</Image>`);
       data[i].resp.data.Data.Table1[0].DESCRIPTION = description;
       updated++;
    }
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
console.log(`Updated ${updated} intents with the new hero.png image!`);
