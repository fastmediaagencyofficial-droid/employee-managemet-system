const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplaceStrings(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            findAndReplaceStrings(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Simple pattern to find `const response = await fetch('http://localhost:5000/api/...', {`
            // and replace it with apiUrl logic
            const lines = content.split('\n');
            let newLines = [];
            let i = 0;
            
            while (i < lines.length) {
                const line = lines[i];
                if (line.includes("await fetch('http://localhost:5000/api/")) {
                    modified = true;
                    // Extract the spacing
                    const spacing = line.match(/^\s*/)[0];
                    const apiUrlStr = `${spacing}const apiUrl = process.env.NEXT_PUBLIC_API_URL ? \`\${process.env.NEXT_PUBLIC_API_URL}/api\` : 'http://localhost:5000/api';`;
                    
                    // Add the apiUrl definition if not already present recently
                    if (i > 0 && !lines[i-1].includes('const apiUrl = ')) {
                        newLines.push(apiUrlStr);
                    }
                    
                    // Create the new fetch line
                    const newLine = line.replace("'http://localhost:5000/api/", "`${apiUrl}/").replace("',", "`,");
                    newLines.push(newLine);
                } else if (line.includes("await fetch(`http://localhost:5000/api/")) {
                    modified = true;
                    const spacing = line.match(/^\s*/)[0];
                    const apiUrlStr = `${spacing}const apiUrl = process.env.NEXT_PUBLIC_API_URL ? \`\${process.env.NEXT_PUBLIC_API_URL}/api\` : 'http://localhost:5000/api';`;
                    
                    if (i > 0 && !lines[i-1].includes('const apiUrl = ')) {
                        newLines.push(apiUrlStr);
                    }
                    
                    const newLine = line.replace("`http://localhost:5000/api/", "`${apiUrl}/");
                    newLines.push(newLine);
                } else {
                    newLines.push(line);
                }
                i++;
            }

            if (modified) {
                console.log(`Updated: ${fullPath}`);
                fs.writeFileSync(fullPath, newLines.join('\n'));
            }
        }
    });
}

findAndReplaceStrings(directoryPath);
