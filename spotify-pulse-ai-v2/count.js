const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Sneh Suman/OneDrive/Desktop/Spotify Graduation Project';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));
let total = 0;
for(const f of files) { 
  const content = fs.readFileSync(path.join(dir, f), 'utf8'); 
  total += content.split('\n').length - 1; 
}
console.log('Total CSV rows:', total);
