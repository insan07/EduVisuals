const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
            callback(filePath, stat);
        } else if (stat.isDirectory() && name !== 'node_modules' && name !== '.next') {
            walkSync(filePath, callback);
        }
    });
}

const replacements = [
    { from: /bg-\[#073238\]/g, to: 'bg-brand' },
    { from: /bg-\[#00393c\]/g, to: 'bg-brand' },
    { from: /text-\[#00393c\]/g, to: 'text-brand' },
    { from: /text-\[#073238\]/g, to: 'text-brand' },
    // Handle border-[rgba(0,57,60,...)] to border-brand-border
    { from: /border-\[rgba\(0,57,60,[^\]]+\)\]/g, to: 'border-brand-border' },
    { from: /border-\[#073238\](\/15)?/g, to: 'border-brand' }, // also handle standard border hex
    { from: /bg-\[#f8f9fa\]/g, to: 'bg-brand-surface' },
    { from: /text-\[rgba\(0,57,60,0\.6\)\]/g, to: 'text-brand-muted' },
    { from: /text-\[rgba\(0,57,60,0\.65\)\]/g, to: 'text-brand-muted' }, // covering 0.65 just in case
    { from: /text-\[rgba\(0,57,60,0\.4\)\]/g, to: 'text-brand-faint' },
    { from: /text-\[rgba\(0,57,60,0\.55\)\]/g, to: 'text-brand-faint' }, // extra coverage
];

let changedFiles = 0;

dirs.forEach(dir => {
    walkSync(dir, (filePath) => {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        
        replacements.forEach(r => {
            content = content.replace(r.from, r.to);
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            changedFiles++;
            console.log(`Updated ${filePath}`);
        }
    });
});

console.log(`Successfully updated ${changedFiles} files.`);
