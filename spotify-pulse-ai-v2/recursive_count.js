const fs = require('fs');
const path = require('path');

function getCsvs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('.next') && !filePath.includes('.gemini')) {
      results = results.concat(getCsvs(filePath));
    } else if (filePath.endsWith('.csv')) {
      results.push(filePath);
    }
  }
  return results;
}

const allCsvs = getCsvs('c:/Users/Sneh Suman/OneDrive/Desktop/Spotify Graduation Project');
let total = 0;
for (const f of allCsvs) {
  const lines = fs.readFileSync(f, 'utf8').split('\n').length;
  console.log(f, '->', lines, 'lines');
  total += lines;
}
console.log('TOTAL ROWS:', total);
