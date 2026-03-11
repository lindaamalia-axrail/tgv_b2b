const fs = require('fs');
const path = require('path');

// Create test-data directory if it doesn't exist
const testDataDir = path.join(__dirname, '..', 'test-data');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// Function to create a simple colored image (base64 encoded)
function createSimpleImage(width, height, color, filename) {
  // Create a minimal valid JPEG file (1x1 pixel)
  // This is a base64 encoded 1x1 red JPEG
  const base64Images = {
    red: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    blue: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
  };
  
  const imageData = Buffer.from(base64Images[color] || base64Images.red, 'base64');
  const filePath = path.join(testDataDir, filename);
  fs.writeFileSync(filePath, imageData);
  console.log(`Created ${filename}`);
}

// Create test images
createSimpleImage(1920, 1080, 'red', 'carousel-image.jpg');
createSimpleImage(800, 800, 'blue', 'carousel-800x800.jpg');
createSimpleImage(1080, 600, 'red', 'carousel-1080x600.jpg');
createSimpleImage(1920, 1080, 'blue', 'highlight-image.jpg');
createSimpleImage(800, 800, 'red', 'highlight-800x800.jpg');
createSimpleImage(1080, 60, 'blue', 'highlight-1080x60.jpg');

console.log('All test images created successfully!');
