// Simple Markdown Parser for GitHub Pages (no external dependencies)
const MarkdownParser = {
    parse: function(text) {
        if (!text) return '';
        
        let html = text;
        
        // Escape HTML
        html = this.escapeHtml(html);
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold and Italic
        html = html.replace(/\*\*\*(.*)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*)\*/g, '<em>$1</em>');
        html = html.replace(/\_\_(.*)\_\_/g, '<strong>$1</strong>');
        html = html.replace(/\_(.*)\_/g, '<em>$1</em>');
        
        // Strikethrough
        html = html.replace(/\~\~(.*)\~\~/g, '<del>$1</del>');
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Lists
        html = this.parseLists(html);
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;">');
        
        // Blockquotes
        html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
        
        // Horizontal rule
        html = html.replace(/^---$/gim, '<hr>');
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        
        // Paragraphs (wrap text not in tags)
        html = this.wrapParagraphs(html);
        
        return html;
    },
    
    parseLists: function(text) {
        let html = text;
        const lines = html.split('\n');
        let result = [];
        let inList = false;
        let listType = '';
        let listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const unorderedMatch = line.match(/^[\*\-] (.*)/);
            const orderedMatch = line.match(/^\d+\. (.*)/);
            
            if (unorderedMatch) {
                if (!inList || listType !== 'ul') {
                    if (inList) result.push(`</${listType}>`);
                    result.push('<ul>');
                    inList = true;
                    listType = 'ul';
                }
                result.push(`<li>${unorderedMatch[1]}</li>`);
            } else if (orderedMatch) {
                if (!inList || listType !== 'ol') {
                    if (inList) result.push(`</${listType}>`);
                    result.push('<ol>');
                    inList = true;
                    listType = 'ol';
                }
                result.push(`<li>${orderedMatch[1]}</li>`);
            } else {
                if (inList) {
                    result.push(`</${listType}>`);
                    inList = false;
                    listType = '';
                }
                result.push(line);
            }
        }
        
        if (inList) {
            result.push(`</${listType}>`);
        }
        
        return result.join('\n');
    },
    
    wrapParagraphs: function(html) {
        const lines = html.split('<br>');
        let result = [];
        let inParagraph = false;
        
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // Check if line starts with a tag
            const startsWithTag = /^<[a-z][^>]*>/i.test(trimmed);
            const endsWithTag = /<\/[a-z][^>]*>$/i.test(trimmed);
            
            if (startsWithTag && endsWithTag) {
                if (inParagraph) {
                    result.push('</p>');
                    inParagraph = false;
                }
                result.push(trimmed);
            } else {
                if (!inParagraph) {
                    result.push('<p>');
                    inParagraph = true;
                }
                result.push(trimmed);
            }
        }
        
        if (inParagraph) {
            result.push('</p>');
        }
        
        return result.join('');
    },
    
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Usage helper
function renderMarkdown(elementId, markdownText) {
    const element = document.getElementById(elementId);
    if (element && markdownText) {
        element.innerHTML = MarkdownParser.parse(markdownText);
    }
}

// Fetch and render markdown file
async function loadMarkdownFile(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load');
        const text = await response.text();
        renderMarkdown(elementId, text);
        return true;
    } catch (error) {
        console.error('Error loading markdown:', error);
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<p class="error">Failed to load content.</p>';
        }
        return false;
    }
}