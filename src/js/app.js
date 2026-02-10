// app.js - Ana uygulama mantığı

// State
let currentPage = 1;
let itemsPerPage = 10;
let filteredDocs = [];
let currentSearch = '';
let selectedTypes = { doc: true, img: true, video: true, audio: true };
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showLoadingState();
    
    try {
        // Manuel veri kontrolü
        if (Object.keys(documentsData).length === 0) {
            showEmptyState();
            return;
        }
        
        isLoading = false;
        hideLoadingState();
        
        // Stats güncelle
        const stats = calculateStats();
        updateStatsUI(stats);
        
        // İlk yükleme
        filterDocuments();
        
        // Search listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase();
                const clearBtn = document.getElementById('searchClear');
                if (clearBtn) {
                    clearBtn.classList.toggle('show', currentSearch.length > 0);
                }
                currentPage = 1;
                filterDocuments();
            });
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorState();
    }
});

function showLoadingState() {
    const tbody = document.getElementById('documentsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 60px;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border-width: 3px;"></div>
                    <p style="margin-top: 20px; color: var(--text-muted);">Loading documents...</p>
                </td>
            </tr>
        `;
    }
}

function hideLoadingState() {
    // Normal görünüme geç
}

function showEmptyState() {
    const tbody = document.getElementById('documentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (tbody) tbody.innerHTML = '';
    if (emptyState) {
        emptyState.classList.remove('hidden');
        emptyState.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <p>No documents found.</p>
            <p style="font-size: 14px; margin-top: 10px;">Add documents to data.js file.</p>
        `;
    }
    
    // Stats sıfırla
    updateStatsUI({ totalFiles: 0, categories: 0, totalGB: '0.0', lastUpdateText: 'Never' });
}

function showErrorState() {
    const tbody = document.getElementById('documentsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
                    <p>Error loading documents. Please refresh the page.</p>
                </td>
            </tr>
        `;
    }
}

function updateStatsUI(stats) {
    const totalFilesEl = document.getElementById('totalFiles');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const totalSizeEl = document.getElementById('totalSize');
    const lastUpdateEl = document.getElementById('lastUpdate');
    
    if (totalFilesEl) totalFilesEl.textContent = stats.totalFiles;
    if (totalCategoriesEl) totalCategoriesEl.textContent = stats.categories;
    if (totalSizeEl) totalSizeEl.textContent = `${stats.totalGB} GB`;
    if (lastUpdateEl) lastUpdateEl.textContent = stats.lastUpdateText;
}

// Filter Documents
function filterDocuments() {
    const allDocs = Object.values(documentsData);
    
    filteredDocs = allDocs.filter(doc => {
        if (!selectedTypes[doc.fileType]) return false;
        if (!currentSearch) return true;
        
        const searchInTitle = doc.title.toLowerCase().includes(currentSearch);
        const searchInDesc = doc.description.toLowerCase().includes(currentSearch);
        const searchInCategory = doc.category.toLowerCase().includes(currentSearch);
        
        return searchInTitle || searchInDesc || searchInCategory;
    });
    
    renderTable();
    renderPagination();
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('documentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    if (filteredDocs.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageDocs = filteredDocs.slice(start, end);
    
    tbody.innerHTML = pageDocs.map((doc, index) => `
        <tr class="page-transition" style="animation-delay: ${index * 50}ms">
            <td>
                <div class="doc-title">${highlightText(doc.title)}</div>
            </td>
            <td>
                <div class="doc-description">${highlightText(doc.description)}</div>
            </td>
            <td>
                <span class="type-badge ${doc.category.toLowerCase().replace(' ', '-')}">${doc.category}</span>
            </td>
            <td>
                <a href="document.html?id=${doc.id}" class="view-btn">
                    View
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </td>
        </tr>
    `).join('');
}

// Render Pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    </button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="page-btn" style="cursor: default; background: transparent; border: none;">...</span>`;
        }
    }
    
    html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    </button>`;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    renderTable();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function highlightText(text) {
    if (!currentSearch) return text;
    const regex = new RegExp(`(${currentSearch})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// UI Functions
function openMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    if (menu) menu.classList.add('open');
    if (overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    if (menu) menu.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function toggleAdvanced() {
    const panel = document.getElementById('advancedPanel');
    const toggle = document.querySelector('.advanced-toggle');
    if (panel) panel.classList.toggle('show');
    if (toggle) toggle.classList.toggle('active');
}

function toggleAllTypes() {
    const allChecked = document.getElementById('checkAll').checked;
    document.getElementById('checkDoc').checked = allChecked;
    document.getElementById('checkImg').checked = allChecked;
    document.getElementById('checkVideo').checked = allChecked;
    
    selectedTypes = {
        doc: allChecked,
        img: allChecked,
        video: allChecked,
        audio: allChecked
    };
    
    currentPage = 1;
    filterDocuments();
}

function updateTypeFilter() {
    const doc = document.getElementById('checkDoc').checked;
    const img = document.getElementById('checkImg').checked;
    const video = document.getElementById('checkVideo').checked;
    
    selectedTypes = { doc, img, video, audio: video };
    
    const allChecked = doc && img && video;
    document.getElementById('checkAll').checked = allChecked;
    
    currentPage = 1;
    filterDocuments();
}

function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    currentPage = 1;
    filterDocuments();
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    currentSearch = '';
    const clearBtn = document.getElementById('searchClear');
    if (clearBtn) clearBtn.classList.remove('show');
    currentPage = 1;
    filterDocuments();
}