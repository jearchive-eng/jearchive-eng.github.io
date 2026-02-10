// data.js - MANUEL VERİ GİRİŞİ

const documentsData = {
    'EFTA00000001': {
        id: 'EFTA00000001',
        title: 'EFTA00000001',
        description: 'This is an FBI evidence photography form from the Jeffrey Epstein investigation, dated July 6, 2019. It documents photographic evidence collected at Epsteins Manhattan residence (9 East 71st Street, New York). The Case ID "31E-NY-3027571" corresponds to the FBIs investigation into Epsteins activities. The redacted photographer field and specific evidence tracking number "EFTA00000001" indicate this was part of the federal task force evidence collection during the execution of search warrants following Epsteins arrest.',
        filename: 'EFTA00000001.pdf',
        fileUrl: './src/doc/EFTA00000001.pdf',
        markdownUrl: './src/doc/EFTA00000001.md',
        date: '2026-02-10',
        size: '2 MB',
        type: 'pdf',
        category: 'FEDERAL',
        fileType: 'doc'
    }
    
    // YENİ BELGE EKLEMEK İÇİN:
    // ,'yeni-belge': {
    //     id: 'yeni-belge',
    //     title: 'Yeni Belge',
    //     description: 'Açıklama',
    //     filename: 'dosya.pdf',
    //     fileUrl: './src/doc/dosya.pdf',
    //     markdownUrl: './src/doc/yeni-belge.md',
    //     date: '2026-02-11',
    //     size: '3 MB',
    //     type: 'pdf',
    //     category: 'DOCUMENT',
    //     fileType: 'doc'
    // }
};

// Dosya tipi haritası
const fileTypeMap = {
    doc: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'],
    img: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico', 'raw'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']
};

// İstatistik hesaplama - DÜZELTİLMİŞ VERSİYON
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
        } else if (size.includes('b') && !size.includes('kb') && !size.includes('mb') && !size.includes('gb')) {
            totalBytes += parseFloat(size);
        }
    });
    
    // OTOMATİK FORMAT: B, KB, MB veya GB olarak göster
    let totalSize;
    if (totalBytes === 0) {
        totalSize = '0 B';
    } else if (totalBytes < 1024) {
        totalSize = Math.round(totalBytes) + ' B';
    } else if (totalBytes < 1024 * 1024) {
        totalSize = (totalBytes / 1024).toFixed(1) + ' KB';
    } else if (totalBytes < 1024 * 1024 * 1024) {
        totalSize = (totalBytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
        totalSize = (totalBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    
    if (docs.length === 0) {
        return { 
            totalFiles: 0, 
            categories: 0, 
            totalSize: '0 B', 
            lastUpdateText: 'Never' 
        };
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
    
    return { 
        totalFiles, 
        categories, 
        totalSize,  // ARTIK DOĞRU GÖSTERİYOR: "2.0 MB"
        lastUpdateText 
    };
}

// Dummy fonksiyon (app.js uyumluluğu için)
async function autoScanDocuments() {
    return documentsData;
}