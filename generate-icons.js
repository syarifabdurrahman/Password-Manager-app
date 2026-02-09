const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, 'assets', 'images', 'SimCalc.png');
const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Icon sizes for different densities
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Adaptive icon sizes (foreground layer, 108dp)
const adaptiveSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function generateIcons() {
  console.log('Generating Android app icons...\n');

  // Check if source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error(`Source icon not found: ${sourceIcon}`);
    process.exit(1);
  }

  try {
    // Generate regular launcher icons
    console.log('Generating regular launcher icons...');
    for (const [dir, size] of Object.entries(iconSizes)) {
      const targetPath = path.join(androidResPath, dir, 'ic_launcher.png');
      await sharp(sourceIcon)
        .resize(size, size, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(targetPath);
      console.log(`  ✓ Created ${targetPath}`);
    }

    // Generate adaptive icon layers
    console.log('\nGenerating adaptive icon layers...');
    for (const [dir, size] of Object.entries(adaptiveSizes)) {
      console.log(`  Processing ${dir} (${size}x${size})...`);

      // Background - pure black
      const bgPath = path.join(androidResPath, dir, 'ic_launcher_background.png');
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
      })
      .png()
      .toFile(bgPath);
      console.log(`    ✓ Background: ${bgPath}`);

      // Foreground - resized icon centered
      const fgPath = path.join(androidResPath, dir, 'ic_launcher_foreground.png');
      const iconSize = Math.floor(size * 0.66); // Icon takes 66% of the safe zone

      await sharp(sourceIcon)
        .resize(iconSize, iconSize, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: Math.floor((size - iconSize) / 2),
          bottom: Math.floor((size - iconSize) / 2),
          left: Math.floor((size - iconSize) / 2),
          right: Math.floor((size - iconSize) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(fgPath);
      console.log(`    ✓ Foreground: ${fgPath}`);

      // Monochrome - grayscale version
      const monoPath = path.join(androidResPath, dir, 'ic_launcher_monochrome.png');
      await sharp(sourceIcon)
        .grayscale()
        .resize(iconSize, iconSize, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: Math.floor((size - iconSize) / 2),
          bottom: Math.floor((size - iconSize) / 2),
          left: Math.floor((size - iconSize) / 2),
          right: Math.floor((size - iconSize) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(monoPath);
      console.log(`    ✓ Monochrome: ${monoPath}`);
    }

    console.log('\n✅ All icons generated successfully!');
    console.log('\nNote: You may need to clean and rebuild your project for the new icons to appear.');
    console.log('Run: cd android && ./gradlew clean && cd ..');

  } catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
