// Otomatik belge verisi - GitHub Pages için client-side tarama
// src/docs/ klasöründeki .md dosyalarını otomatik bulur

const documentsData = {};

// Otomatik tarama fonksiyonu
async function autoScanDocuments() {
    const commonIds = [
        'ornek-belge',
    ];
    
    // Yeni ID'ler buraya otomatik eklenebilir
    // Örnek: GitHub API ile repo içeriğini çekmek
    
    const docs = {};
    
    for (const id of commonIds) {
        try {
            const doc = await tryLoadDocument(id);
            if (doc) {
                docs[id] = doc;
            }
        } catch (e) {
            // Dosya yok, atla
        }
    }
    
    // Global değişkene ata
    Object.assign(documentsData, docs);
    
    return docs;
}

// Tek dosya dene
async function tryLoadDocument(id) {
    // Önce markdown var mı kontrol et
    try {
        const mdResponse = await fetch(`./src/docs/${id}.md`, { method: 'HEAD' });
        if (!mdResponse.ok) return null;
        
        // Markdown içeriğini oku ve metadata çıkar
        const mdContent = await fetch(`./src/docs/${id}.md`).then(r => r.text());
        
        // Metadata parse et
        const title = extractTitle(mdContent) || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const description = extractDescription(mdContent) || 'No description';
        const date = extractDate(mdContent) || new Date().toISOString().split('T')[0];
        const category = extractCategory(mdContent) || 'DOCUMENT';
        
        // Asıl dosyayı bul (pdf, mp4, vb.)
        const fileInfo = await findMainFile(id);
        
        return {
            id: id,
            title: title,
            description: description,
            filename: fileInfo.filename,
            fileUrl: fileInfo.fileUrl,
            markdownUrl: `./src/docs/${id}.md`,
            date: date,
            size: 'Unknown',
            type: fileInfo.extension,
            category: category,
            fileType: fileInfo.fileType
        };
        
    } catch (error) {
        return null;
    }
}

// Metadata çıkarıcılar
function extractTitle(md) {
    const match = md.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
}

function extractDescription(md) {
    // Summary bölümü veya ilk paragraf
    const summaryMatch = md.match(/## Summary\s*\n([\s\S]*?)(?=##|$)/i);
    if (summaryMatch) {
        return summaryMatch[1].replace(/\n/g, ' ').trim().substring(0, 300);
    }
    
    // İlk paragraf
    const paraMatch = md.match(/\n\n([^#\n][^\n]{50,500})\n\n/);
    return paraMatch ? paraMatch[1].trim() : null;
}

function extractDate(md) {
    const match = md.match(/(?:Date|Published|Document Date):\s*(\d{4}-\d{2}-\d{2})/i);
    return match ? match[1] : null;
}

function extractCategory(md) {
    const content = md.toUpperCase();
    if (content.includes('LEAKED') || content.includes('UNREDACTED')) return 'LEAKED';
    if (content.includes('FEDERAL') || content.includes('FBI') || content.includes('INDICTMENT')) return 'FEDERAL';
    if (content.includes('COURT') || content.includes('LAWSUIT') || content.includes('DEPOSITION')) return 'COURT DOCUMENT';
    if (content.includes('EVIDENCE') || content.includes('PHOTO') || content.includes('VIDEO')) return 'EVIDENCE';
    return 'DOCUMENT';
}

// Asıl dosyayı bul (pdf, mp4, jpg, vb.)
async function findMainFile(id) {
    const extensions = [
        { ext: 'pdf', type: 'doc' },
        { ext: 'mp4', type: 'video' },
        { ext: 'webm', type: 'video' },
        { ext: 'jpg', type: 'img' },
        { ext: 'jpeg', type: 'img' },
        { ext: 'png', type: 'img' },
        { ext: 'gif', type: 'img' },
        { ext: 'zip', type: 'img' },
        { ext: 'docx', type: 'doc' },
        { ext: 'txt', type: 'doc' }
    ];
    
    for (const { ext, type } of extensions) {
        try {
            const response = await fetch(`./src/docs/${id}.${ext}`, { method: 'HEAD' });
            if (response.ok) {
                return {
                    filename: `${id}.${ext}`,
                    fileUrl: `./src/docs/${id}.${ext}`,
                    extension: ext,
                    fileType: type
                };
            }
        } catch (e) {
            // Devam et
        }
    }
    
    // Varsayılan: pdf varsay
    return {
        filename: `${id}.pdf`,
        fileUrl: `./src/docs/${id}.pdf`,
        extension: 'pdf',
        fileType: 'doc'
    };
}

// Stats hesaplama (boş data.js ile çalışır)
function calculateStats() {
    const docs = Object.values(documentsData);
    const totalFiles = docs.length;
    const categories = new Set(docs.map(d => d.category)).size;
    
    let totalBytes = 0;
    docs.forEach(doc => {
        const size = (doc.size || '0 MB').toLowerCase();
        if (size.includes('gb')) {
            totalBytes += parseFloat(size) * 1024 * 1024 * 1024;
        } else if (size.includes('mb')) {
            totalBytes += parseFloat(size) * 1024 * 1024;
        } else if (size.includes('kb')) {
            totalBytes += parseFloat(size) * 1024;
        }
    });
    
    const totalGB = totalBytes > 0 ? (totalBytes / (1024 * 1024 * 1024)).toFixed(1) : '0.0';
    
    if (docs.length === 0) {
        return { totalFiles: 0, categories: 0, totalGB: '0.0', lastUpdateText: 'Never' };
    }
    
    const dates = docs.map(d => new Date(d.date || '2024-01-01'));
    const lastUpdate = new Date(Math.max(...dates));
    const today = new Date();
    const diffDays = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
    
    let lastUpdateText;
    if (diffDays === 0) lastUpdateText = 'Today';
    else if (diffDays === 1) lastUpdateText = 'Yesterday';
    else if (diffDays < 7) lastUpdateText = `${diffDays} days ago`;
    else if (diffDays < 30) lastUpdateText = `${Math.floor(diffDays / 7)} weeks ago`;
    else lastUpdateText = lastUpdate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return { totalFiles, categories, totalGB, lastUpdateText };
}