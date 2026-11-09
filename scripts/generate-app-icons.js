const path = require('path');
const sharp = require('sharp');

async function generate() {
  const masterIconPath = path.join(__dirname, '../public/logo.png');

  console.log('Generating official Pawelium app icons from logo.png...');

  // 1. App icon 512x512 PNG
  await sharp(masterIconPath)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, '../src/app/icon.png'));
  console.log('Created src/app/icon.png (512x512)');

  // 2. Apple icon 180x180 PNG
  await sharp(masterIconPath)
    .resize(180, 180, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, '../src/app/apple-icon.png'));
  console.log('Created src/app/apple-icon.png (180x180)');

  // 3. Favicon 48x48 PNG
  await sharp(masterIconPath)
    .resize(48, 48, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, '../src/app/favicon.png'));
  console.log('Created src/app/favicon.png (48x48)');

  // 4. Favicon 32x32 in public/ and src/app/
  await sharp(masterIconPath)
    .resize(32, 32, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, '../public/favicon.ico'));
  await sharp(masterIconPath)
    .resize(32, 32, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, '../src/app/favicon.ico'));
  console.log('Created public/favicon.ico and src/app/favicon.ico (32x32)');

  // 5. PWA Icon 192x192 PNG
  await sharp(masterIconPath)
    .resize(192, 192, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, '../public/icons/icon-192x192.png'));
  console.log('Created public/icons/icon-192x192.png (192x192)');

  // 6. PWA Icon 512x512 PNG
  await sharp(masterIconPath)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(__dirname, '../public/icons/icon-512x512.png'));
  console.log('Created public/icons/icon-512x512.png (512x512)');

  // 7. Official Square Logo JPEG
  await sharp(masterIconPath)
    .resize(512, 512, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, '../public/logo.jpg'));
  console.log('Created public/logo.jpg (512x512)');

  console.log('All official Pawelium app icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
