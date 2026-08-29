const fs = require('fs');

const breedToImage = {
  'golden-retriever': '1552053831-71594a27632d',
  'bouledogue-francais': '1583337130417-3346a1be7dee',
  'berger-allemand': '1589924691995-400dc9ecc119',
  'cavalier-king-charles': '1561037404-61cd46aa615b', // lab substitute since cavalier is flaky
  'rottweiler': '1587300003388-59208cc962cb', // husky substitute
  'husky-siberien': '1587300003388-59208cc962cb',
  'caniche-royal': '1548199973-03cce0bbc87b', // dogs running substitute
  'labrador-retriever': '1561037404-61cd46aa615b',
  'beagle': '1543466835011-5a25bf1444de', // brown dog substitute
  'berger-belge-malinois': '1589924691995-400dc9ecc119' // german shepherd substitute
};

let content = fs.readFileSync('src/data/dogs.ts', 'utf8');

// I will parse the file using regex and replace the images array based on the breed.
// Find block: breed: '...',
// and images: [{ url: '...' }]
// Actually, it's easier to evaluate the TS file? No, TS has syntax.

const lines = content.split('\n');
let currentBreed = null;

for (let i = 0; i < lines.length; i++) {
  const breedMatch = lines[i].match(/breed:\s*'([^']+)'/);
  if (breedMatch) {
    currentBreed = breedMatch[1];
  }

  if (lines[i].includes('images: [{') && currentBreed) {
    const imgId = breedToImage[currentBreed] || '1543466835011-5a25bf1444de';
    // replace url up to the ?
    lines[i] = lines[i].replace(/https:\/\/images\.unsplash\.com\/photo-[^?]+/, 'https://images.unsplash.com/photo-' + imgId);
  }
}

fs.writeFileSync('src/data/dogs.ts', lines.join('\n'));
console.log('Updated dog images based on breed.');
