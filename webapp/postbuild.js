const fs = require('fs');
const path = require('path');

const langs = ['fr', 'en'];

langs.forEach(lang => {
    const filePath = path.join(__dirname, 'dist', 'd2g-webapp', 'browser', lang, 'index.html');
    let content = fs.readFileSync(filePath, 'utf8');

    // Expressions régulières pour rechercher les parties statiques des noms de fichiers
    const regexes = [
        { regex: /(href|src)="(styles-[^"]+\.css)"/g, replacement: `$1="${lang}/$2"` },
        { regex: /(href|src)="(polyfills-[^"]+\.js)"/g, replacement: `$1="${lang}/$2"` },
        { regex: /(href|src)="(scripts-[^"]+\.js)"/g, replacement: `$1="${lang}/$2"` },
        { regex: /(href|src)="(main-[^"]+\.js)"/g, replacement: `$1="${lang}/$2"` },
    ];

    // Appliquer chaque regex pour remplacer les chemins
    regexes.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
    });

    fs.writeFileSync(filePath, content, 'utf8');
    
});

console.log('Paths modified successfully.');


const rootPath = path.join(__dirname, 'dist', 'd2g-webapp', 'browser');
const sourcePaths = ['fr/assets'];

    sourcePaths.forEach(sourcePath => {
        const sourceDir = path.join(rootPath, sourcePath);
        const targetDir = path.join(rootPath, path.basename(sourcePath));

        try {
            fs.renameSync(sourceDir, targetDir);
            console.log(`Moved ${sourcePath} to ${targetDir}`);
        } catch (err) {
            console.error(`Error moving ${sourcePath} to ${targetDir}: ${err}`);
        }
    });