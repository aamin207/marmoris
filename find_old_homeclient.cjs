const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const objectsDir = '.git/objects';
const dirs = fs.readdirSync(objectsDir);

for (const dir of dirs) {
    if (dir === 'pack' || dir === 'info') continue;
    const files = fs.readdirSync(path.join(objectsDir, dir));
    for (const file of files) {
        const filePath = path.join(objectsDir, dir, file);
        try {
            const compressed = fs.readFileSync(filePath);
            const decompressed = zlib.inflateSync(compressed);
            const content = decompressed.toString();
            if (content.includes('HomeClient.tsx') || content.includes('getSliders()')) {
                console.log(`\n\n--- MATCH FOUND IN ${dir}/${file} ---\n`);
                // Print lines around getSliders()
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('getSliders()')) {
                        console.log(lines.slice(Math.max(0, i-20), Math.min(lines.length, i+30)).join('\n'));
                        break;
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    }
}
