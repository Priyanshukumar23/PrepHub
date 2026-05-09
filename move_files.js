const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'public');
const destDir = path.join(__dirname, 'client', 'public');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Files to keep (move to client/public)
const filesToKeep = [
    'questions.html',
    'resume_maker.html',
    'styles.css',
    'hub.css',
    'script.js',
    'editor.js'
];

filesToKeep.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    if (fs.existsSync(srcFile)) {
        fs.renameSync(srcFile, destFile);
        console.log(`Moved ${file} to client/public/`);
    }
});

// Delete everything else in public/
fs.rmSync(srcDir, { recursive: true, force: true });
console.log('Deleted old public/ directory.');
