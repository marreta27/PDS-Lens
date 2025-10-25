#!/usr/bin/env node
/**
 * Creates simple placeholder PNG icons without external dependencies
 * These are minimal valid PNG files with a solid blue color
 */

const fs = require('fs');

function createBasicPNG(size) {
  // Minimal PNG data for a solid blue square
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(size, 8); // Width
  ihdr.writeUInt32BE(size, 12); // Height
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(2, 17); // Color type (RGB)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace

  const crc = require('zlib').crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(crc, 21);

  // Create image data (solid blue: #0066cc)
  const bytesPerRow = size * 3 + 1; // RGB + filter byte
  const imageData = Buffer.alloc(size * bytesPerRow);

  for (let y = 0; y < size; y++) {
    const rowStart = y * bytesPerRow;
    imageData.writeUInt8(0, rowStart); // Filter byte
    for (let x = 0; x < size; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      imageData.writeUInt8(0x00, pixelStart);     // R
      imageData.writeUInt8(0x66, pixelStart + 1); // G
      imageData.writeUInt8(0xcc, pixelStart + 2); // B
    }
  }

  // Compress image data
  const compressed = require('zlib').deflateSync(imageData);

  // IDAT chunk
  const idat = Buffer.alloc(12 + compressed.length);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = require('zlib').crc32(idat.slice(4, 8 + compressed.length));
  idat.writeUInt32BE(idatCrc, 8 + compressed.length);

  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate icons
const sizes = [
  { size: 16, name: 'icon16.png' },
  { size: 48, name: 'icon48.png' },
  { size: 128, name: 'icon128.png' }
];

sizes.forEach(({ size, name }) => {
  const png = createBasicPNG(size);
  fs.writeFileSync(name, png);
  console.log(`Created ${name} (${size}x${size})`);
});

console.log('\nAll placeholder icons created successfully!');
console.log('These are simple blue squares. For better icons, use the generate_icons.html file.');
