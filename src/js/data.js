// data.js - MANUEL VERİ GİRİŞİ
// Yeni belge eklemek için documentsData objesine ekleme yap

const documentsData = {
    'ornek-belge': {
        id: 'ornek-belge',
        title: 'Örnek Belge Başlığı',
        description: 'Bu bir örnek belgedir. GitHub Pages otomatik arşiv sisteminde nasıl göründüğünü test etmek için oluşturulmuştur.',
        filename: 'ornek-belge.pdf',
        fileUrl: './src/doc/ornek-belge.pdf',
        markdownUrl: './src/doc/ornek-belge.md',
        date: '2026-02-10',
        size: '2 MB',
        type: 'pdf',
        category: 'FEDERAL',
        fileType: 'doc'
    }
    
    // YENİ BELGE EKLEME ÖRNEĞİ:
    // ,'yeni-belge': {
    //     id: 'yeni-belge',
    //     title: 'Yeni Belge Başlığı',
    //     description: 'Bu yeni bir belgedir.',
    //     filename: 'EFTA00000001.pdf',
    //     fileUrl: './src/doc/EFTA00000001.pdf',
    //     markdownUrl: './src/doc/yeni-belge.md',
    //     date: '2026-02-11',
    //     size: '1.5 MB',
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

// İstatistik hesaplama
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
        return { 
            totalFiles: 0, 
            categories: 0, 
            totalGB: '0.0', 
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
    else lastUpdateText = lastUpdate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    return { totalFiles, categories, totalGB, lastUpdateText };
}

// Dummy fonksiyon (app.js uyumluluğu için)
async function autoScanDocuments() {
    return documentsData;
}