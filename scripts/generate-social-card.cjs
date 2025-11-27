#!/usr/bin/env node
/**
 * Generate PNG social card from SVG
 * Run: node scripts/generate-social-card.cjs
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '../public/social-card.svg');
const PNG_PATH = path.join(__dirname, '../public/social-card.png');

async function generateSocialCard() {
  console.log('🎨 Generating social card PNG from SVG...');
  
  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(SVG_PATH);
    
    // Convert to PNG with sharp
    await sharp(svgBuffer)
      .resize(1200, 630) // Standard OG image dimensions
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(PNG_PATH);
    
    console.log('✅ Social card PNG generated successfully!');
    console.log(`   Output: ${PNG_PATH}`);
    
    // Get file size
    const stats = fs.statSync(PNG_PATH);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error generating social card:', error.message);
    process.exit(1);
  }
}

generateSocialCard();
