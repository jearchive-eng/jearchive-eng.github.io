// Node.js script to auto-generate data.js from src/docs/ folder
// Run: node build.js

const fs = require('fs');
const path = require('path');

const DOCS_DIR = './src/docs';
const OUTPUT_FILE = './src/js/data.js';

function scanDirectory() {
    const files = fs.readdirSync(DOCS_DIR);
    const documents = {};
    
    // Group by base name
    const fileGroups = {};
    
    files.forEach(file => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        
        if (!fileGroups[base]) {
            fileGroups[base] = {};
        }
        fileGroups[base][ext] = file;
    });
    
    // Process each document
    Object.keys(fileGroups).forEach(id => {
        const group = fileGroups[id];
        const mdFile = group['.md'];
        
        if (!mdFile) return; // Skip if no markdown
        
        // Read markdown for metadata
        const mdPath = path.join(DOCS_DIR, mdFile);
        const mdContent = fs.readFileSync(mdPath, 'utf8');
        
        // Extract metadata
        const titleMatch = mdContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const summaryMatch = mdContent.match(/## Summary\s*\n([\s\S]*?)(?=##|$)/i);
        let description = summaryMatch ? 
            summaryMatch[1].replace(/\n/g, ' ').trim().substring(0, 300) : 
            'No description available';
        
        const dateMatch = mdContent.match(/(?:Date|Published):\s*(\d{4}-\d{2}-\d{2})/i);
        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
        
        // Find main file (pdf, video, etc.)
        const mainExts = ['.pdf', '.mp4', '.jpg', '.png', '.docx', '.zip'];
        let mainFile = null;
        let fileType = 'doc';
        
        for (const ext of mainExts) {
            if (group[ext]) {
                mainFile = group[ext];
                fileType = categorizeFileType(ext.replace('.', ''));
                break;
            }
        }
        
        // Determine category from content
        let category = 'DOCUMENT';
        const contentUpper = mdContent.toUpperCase();
        if (contentUpper.includes('LEAKED') || contentUpper.includes('UNREDACTED')) category = 'LEAKED';
        else if (contentUpper.includes('FEDERAL') || contentUpper.includes('FBI')) category = 'FEDERAL';
        else if (contentUpper.includes('COURT') || contentUpper.includes('LAWSUIT')) category = 'COURT DOCUMENT';
        else if (contentUpper.includes('EVIDENCE') || contentUpper.includes('PHOTO')) category = 'EVIDENCE';
        
        documents[id] = {
            id: id,
            title: title,
            description: description,
            filename: mainFile || `${id}.pdf`,
            fileUrl: mainFile ? `./src/docs/${mainFile}` : `./src/docs/${id}.pdf`,
            markdownUrl: `./src/docs/${mdFile}`,
            date: date,
            size: 'Unknown',
            type: mainFile ? path.extname(mainFile).replace('.', '') : 'pdf',
            category: category,
            fileType: fileType
        };
    });
    
    return documents;
}

function categorizeFileType(ext) {
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'];
    const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'webm'];
    
    if (docExts.includes(ext)) return 'doc';
    if (imgExts.includes(ext)) return 'img';
    if (videoExts.includes(ext)) return 'video';
    return 'doc';
}

function generateDataJs(documents) {
    const content = `// Auto-generated on ${new Date().toISOString()}
// Do not edit manually - run 'node build.js' to regenerate

const documentsData = ${JSON.stringify(documents, null, 4)};

// File Type Extensions
const fileTypeMap = {
    doc: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'],
    img: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico', 'raw'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']
};

// Calculate Stats
function calculateStats() {
    const docs = Object.values(documentsData);
    const totalFiles = docs.length;
    const categories = new Set(docs.map(d => d.category)).size;
    
    let totalBytes = 0;
    docs.forEach(doc => {
        const size = doc.size.toLowerCase();
        if (size.includes('gb')) {
            totalBytes += parseFloat(size) * 1024 * 1024 * 1024;
        } else if (size.includes('mb')) {
            totalBytes += parseFloat(size) * 1024 * 1024;
        } else if (size.includes('kb')) {
            totalBytes += parseFloat(size) * 1024;
        }
    });
    
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(1);
    
    const dates = docs.map(d => new Date(d.date));
    const lastUpdate = new Date(Math.max(...dates));
    const today = new Date();
    const diffDays = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
    
    let lastUpdateText;
    if (diffDays === 0) lastUpdateText = 'Today';
    else if (diffDays === 1) lastUpdateText = 'Yesterday';
    else if (diffDays < 7) lastUpdateText = \`\${diffDays} days ago\`;
    else if (diffDays < 30) lastUpdateText = \`\${Math.floor(diffDays / 7)} weeks ago\`;
    else lastUpdateText = lastUpdate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return { totalFiles, categories, totalGB, lastUpdateText };
}
`;

    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`Generated ${OUTPUT_FILE} with ${Object.keys(documents).length} documents`);
}

// Run
const docs = scanDirectory();
generateDataJs(docs);