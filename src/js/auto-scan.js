// Auto-scan src/docs/ directory for new files
// Note: This requires a build step or server-side support for production
// For GitHub Pages, use the manual data.js approach or a pre-build script

const AutoScanner = {
    // List of known documents (populated at build time or manually)
    knownDocuments: [],
    
    // Scan for new documents
    async scanDocuments() {
        const documents = {};
        const commonIds = [
            'black-book',
            'maxwell-deposition-2016',
            'katie-johnson-lawsuit',
            'giuffre-deposition-2016',
            'sjoberg-deposition-2016',
            'epstein-indictment',
            'flight-logs',
            'giuffre-unsealed'
        ];
        
        // Try to auto-discover by checking common patterns
        for (const id of commonIds) {
            try {
                const doc = await this.checkDocumentExists(id);
                if (doc) {
                    documents[id] = doc;
                }
            } catch (e) {
                // Document doesn't exist
            }
        }
        
        return documents;
    },
    
    async checkDocumentExists(id) {
        // Check if markdown exists
        const mdCheck = await fetch(`./src/docs/${id}.md`, { method: 'HEAD' });
        if (!mdCheck.ok) return null;
        
        // Determine file type and URL
        const extensions = ['pdf', 'mp4', 'jpg', 'png', 'docx', 'txt', 'zip'];
        let fileUrl = null;
        let fileType = 'pdf';
        let filename = `${id}.pdf`;
        
        for (const ext of extensions) {
            try {
                const check = await fetch(`./src/docs/${id}.${ext}`, { method: 'HEAD' });
                if (check.ok) {
                    fileUrl = `./src/docs/${id}.${ext}`;
                    filename = `${id}.${ext}`;
                    fileType = ext;
                    break;
                }
            } catch (e) {}
        }
        
        // Try to get metadata from markdown
        let title = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        let description = 'Auto-scanned document';
        let date = new Date().toISOString().split('T')[0];
        
        try {
            const mdResponse = await fetch(`./src/docs/${id}.md`);
            const mdContent = await mdResponse.text();
            
            // Extract title from first heading
            const titleMatch = mdContent.match(/^#\s+(.+)$/m);
            if (titleMatch) title = titleMatch[1];
            
            // Extract description from first paragraph after "Summary" or first paragraph
            const summaryMatch = mdContent.match(/## Summary\s*\n([\s\S]*?)(?=##|$)/i);
            if (summaryMatch) {
                description = summaryMatch[1].replace(/\n/g, ' ').trim().substring(0, 200) + '...';
            } else {
                const firstPara = mdContent.match(/\n\n([^#\n].{50,500})\n\n/);
                if (firstPara) description = firstPara[1].trim();
            }
            
            // Extract date if present
            const dateMatch = mdContent.match(/(?:Date|Published):\s*(\d{4}-\d{2}-\d{2})/i);
            if (dateMatch) date = dateMatch[1];
            
        } catch (e) {}
        
        return {
            id: id,
            title: title,
            description: description,
            filename: filename,
            fileUrl: fileUrl || `./src/docs/${id}.pdf`,
            markdownUrl: `./src/docs/${id}.md`,
            date: date,
            size: 'Unknown',
            type: fileType,
            category: 'DOCUMENT',
            fileType: this.categorizeFileType(fileType)
        };
    },
    
    categorizeFileType(ext) {
        const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'];
        const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
        const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'];
        
        if (docExts.includes(ext)) return 'doc';
        if (imgExts.includes(ext)) return 'img';
        if (videoExts.includes(ext)) return 'video';
        return 'doc';
    },
    
    // Merge with existing data.js
    async mergeWithExisting() {
        const scanned = await this.scanDocuments();
        return { ...documentsData, ...scanned };
    }
};

// Usage in app.js:
// const allDocs = await AutoScanner.mergeWithExisting();