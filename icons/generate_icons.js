#!/usr/bin/env node
/**
 * Simple icon generator for PDS Lens Chrome Extension
 * Creates basic PNG icons using pure Node.js (no dependencies)
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0066cc';
  ctx.fillRect(0, 0, size, size);

  // Draw a simple lens/magnifying glass icon
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.25;

  // Lens circle
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.08;
  ctx.beginPath();
  ctx.arc(centerX - size * 0.05, centerY - size * 0.05, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Handle
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const handleStartX = centerX + radius * 0.5;
  const handleStartY = centerY + radius * 0.5;
  const handleEndX = centerX + radius * 1.3;
  const handleEndY = centerY + radius * 1.3;
  ctx.moveTo(handleStartX, handleStartY);
  ctx.lineTo(handleEndX, handleEndY);
  ctx.stroke();

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

try {
  generateIcon(16, 'icon16.png');
  generateIcon(48, 'icon48.png');
  generateIcon(128, 'icon128.png');
  console.log('\nAll icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error.message);
  console.log('\nTo generate icons, install canvas package:');
  console.log('  npm install canvas');
  console.log('\nOr use the generate_icons.html file in a browser.');
  process.exit(1);
}
