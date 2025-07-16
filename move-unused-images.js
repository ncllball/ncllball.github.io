const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const imagesDir = path.join(rootDir, 'images');
const unusedDir = path.join(rootDir, 'images_unused');

// Helper: recursively get all files under a directory
function getAllFiles(dir, filesArr = []) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, filesArr);
        } else {
            filesArr.push(fullPath);
        }
    });
    return filesArr;
}

// Helper: get all image references in codebase
function getReferencedImages() {
    const exts = ['.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx'];
    const referenced = new Set();
    function scanFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Match src="...", url('...'), url("..."), url(...)
        const regex = /src\s*=\s*["']([^"']+)["']|url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
        let match;
        while ((match = regex.exec(content))) {
            let imgPath = match[1] || match[2];
            if (imgPath && imgPath.includes('/images/')) {
                // Normalize path (remove domain if present)
                imgPath = imgPath.replace(/^https?:\/\/[^\/]+/, '');
                // Remove query/hash
                imgPath = imgPath.split(/[?#]/)[0];
                referenced.add(imgPath);
            }
        }
    }
    function scanDir(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (exts.includes(path.extname(file).toLowerCase())) {
                scanFile(fullPath);
            }
        });
    }
    scanDir(rootDir);
    return referenced;
}

// Main
function moveUnusedImages() {
    if (!fs.existsSync(imagesDir)) {
        console.error('No images directory found.');
        return;
    }
    if (!fs.existsSync(unusedDir)) {
        fs.mkdirSync(unusedDir);
    }
    const referenced = getReferencedImages();
    const allImages = getAllFiles(imagesDir);
    let moved = 0;
    allImages.forEach(imgPath => {
        // Get relative path from repo root
        const relPath = imgPath.replace(rootDir, '').replace(/\\/g, '/');
        const relUrl = relPath.startsWith('/') ? relPath : '/' + relPath;
        if (![...referenced].some(ref => ref.endsWith(relUrl))) {
            // Move to images_unused, preserving subfolders
            const subPath = path.relative(imagesDir, imgPath);
            const destPath = path.join(unusedDir, subPath);
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            fs.renameSync(imgPath, destPath);
            moved++;
            console.log(`Moved unused image: ${imgPath} -> ${destPath}`);
        }
    });
    console.log(`Done. Moved ${moved} unused images.`);
}

moveUnusedImages();
