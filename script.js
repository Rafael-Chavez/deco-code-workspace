// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked tab button
    event.target.classList.add('active');
}

// Copy to clipboard functionality
async function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeElement = codeBlock.querySelector('code');

    // For HTML content, preserve the original structure
    let code;
    if (codeElement.classList.contains('language-html')) {
        // Get the innerHTML and decode HTML entities
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = codeElement.innerHTML;
        code = tempDiv.textContent || tempDiv.innerText;
    } else {
        code = codeElement.textContent;
    }

    try {
        await navigator.clipboard.writeText(code);

        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        // Show notification
        showNotification('Code copied to clipboard!');

        // Reset button after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy code: ', err);
        showNotification('Failed to copy code', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Add new code snippet
function addCodeSnippet(title, language, code, thumbnailDataUrl = null) {
    const snippetsTab = document.getElementById('snippets');
    const lastSection = snippetsTab.querySelector('.snippet-section:last-of-type');

    // Create new code block
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';

    const thumbnailContent = thumbnailDataUrl ?
        `<img src="${thumbnailDataUrl}" alt="Preview" class="thumbnail-image" onclick="enlargeThumbnail(this)">
         <button class="thumbnail-overlay" onclick="removeThumbnail(this)" title="Remove thumbnail">×</button>` :
        `<div class="thumbnail-placeholder" onclick="addThumbnail(this)">
            <span>📸</span>
            <p>Click to add preview</p>
         </div>`;

    const lineCount = code.split('\n').length;
    const preClass = lineCount > 20 ? 'collapsed' : '';
    const expandButton = lineCount > 20 ? '<button class="expand-btn" onclick="toggleCodeExpansion(this)">Expand</button>' : '';

    codeBlock.innerHTML = `
        <div class="code-header">
            <span class="code-title">${escapeHtml(title)}</span>
            <button class="copy-btn" onclick="copyCode(this)">Copy</button>
        </div>
        <div class="code-content">
            <pre class="${preClass}"><code class="language-${language}">${escapeHtml(code)}</code>${expandButton}</pre>
            <div class="thumbnail-area">
                ${thumbnailContent}
            </div>
        </div>
    `;

    // Insert before the add snippet form
    const addSnippetDiv = snippetsTab.querySelector('.add-snippet');
    snippetsTab.insertBefore(codeBlock, addSnippetDiv);

    // Re-highlight syntax
    Prism.highlightAllUnder(codeBlock);

    showNotification('Snippet added successfully!');
}

// Add new video tutorial
function addVideoTutorial(title, duration, url, description) {
    const tutorialsTab = document.getElementById('tutorials');
    const tutorialSection = tutorialsTab.querySelector('.tutorial-section');

    // Create new video card
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';

    const embedUrl = convertToEmbedUrl(url);

    videoCard.innerHTML = `
        <div class="video-header">
            <h3>${escapeHtml(title)}</h3>
            ${duration ? `<span class="duration">${escapeHtml(duration)}</span>` : ''}
        </div>
        ${embedUrl ?
            `<iframe class="video-iframe" src="${embedUrl}" allowfullscreen></iframe>` :
            `<div class="video-placeholder">
                <p>Invalid video URL</p>
            </div>`
        }
        ${description ?
            `<div class="video-description">
                <p>${escapeHtml(description)}</p>
            </div>` : ''
        }
    `;

    // Insert before the add tutorial form
    const addTutorialDiv = tutorialsTab.querySelector('.add-tutorial');
    tutorialsTab.insertBefore(videoCard, addTutorialDiv);

    showNotification('Tutorial added successfully!');
}

// Convert video URLs to embed URLs
function convertToEmbedUrl(url) {
    // YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // If already an embed URL, return as is
    if (url.includes('embed') || url.includes('player')) {
        return url;
    }

    return null;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Thumbnail functionality
function addThumbnail(placeholder) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'thumbnail-image';
                img.alt = 'Preview';
                img.onclick = () => enlargeThumbnail(img);

                const overlay = document.createElement('button');
                overlay.className = 'thumbnail-overlay';
                overlay.innerHTML = '×';
                overlay.title = 'Remove thumbnail';
                overlay.onclick = () => removeThumbnail(overlay);

                const thumbnailArea = placeholder.parentElement;
                thumbnailArea.innerHTML = '';
                thumbnailArea.appendChild(img);
                thumbnailArea.appendChild(overlay);

                showNotification('Thumbnail added successfully!');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function removeThumbnail(overlay) {
    const thumbnailArea = overlay.parentElement;
    thumbnailArea.innerHTML = `
        <div class="thumbnail-placeholder" onclick="addThumbnail(this)">
            <span>📸</span>
            <p>Click to add preview</p>
        </div>
    `;
    showNotification('Thumbnail removed');
}

function enlargeThumbnail(img) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
    `;

    const enlargedImg = document.createElement('img');
    enlargedImg.src = img.src;
    enlargedImg.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    `;

    modal.appendChild(enlargedImg);
    document.body.appendChild(modal);

    modal.onclick = () => document.body.removeChild(modal);
}

// Handle snippet form submission
document.getElementById('snippet-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('snippet-title').value;
    const language = document.getElementById('snippet-language').value;
    const code = document.getElementById('snippet-code').value;
    const thumbnailFile = document.getElementById('snippet-thumbnail').files[0];

    if (title && language && code) {
        if (thumbnailFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addCodeSnippet(title, language, code, e.target.result);
            };
            reader.readAsDataURL(thumbnailFile);
        } else {
            addCodeSnippet(title, language, code);
        }

        // Reset form
        this.reset();
        document.getElementById('thumbnail-name').textContent = '';
    }
});

// Handle thumbnail file selection display
document.getElementById('snippet-thumbnail').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || '';
    document.getElementById('thumbnail-name').textContent = fileName ? `Selected: ${fileName}` : '';
});

// Handle tutorial form submission
document.getElementById('tutorial-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('tutorial-title').value;
    const duration = document.getElementById('tutorial-duration').value;
    const url = document.getElementById('tutorial-url').value;
    const description = document.getElementById('tutorial-description').value;

    if (title && url) {
        addVideoTutorial(title, duration, url, description);

        // Reset form
        this.reset();
    }
});

// Handle video placeholder clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.video-placeholder')) {
        const videoCard = e.target.closest('.video-card');
        const title = videoCard.querySelector('h3').textContent;

        const url = prompt(`Enter video URL for "${title}":`);
        if (url) {
            const embedUrl = convertToEmbedUrl(url);
            if (embedUrl) {
                const placeholder = videoCard.querySelector('.video-placeholder');
                placeholder.outerHTML = `<iframe class="video-iframe" src="${embedUrl}" allowfullscreen></iframe>`;
                showNotification('Video added successfully!');
            } else {
                showNotification('Invalid video URL', 'error');
            }
        }
    }
});

// Code expansion functionality
function toggleCodeExpansion(button) {
    const pre = button.parentElement;
    const isCollapsed = pre.classList.contains('collapsed');

    if (isCollapsed) {
        pre.classList.remove('collapsed');
        button.textContent = 'Collapse';
        button.style.bottom = '10px';
    } else {
        pre.classList.add('collapsed');
        button.textContent = 'Expand';
        button.style.bottom = '10px';
    }
}

// Auto-collapse long code blocks
function autoCollapseCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-content pre');

    codeBlocks.forEach(pre => {
        const code = pre.querySelector('code');
        const lineCount = code.textContent.split('\n').length;

        // If code has more than 20 lines, make it collapsible
        if (lineCount > 20) {
            pre.classList.add('collapsed');

            // Add expand button
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.textContent = 'Expand';
            expandBtn.onclick = () => toggleCodeExpansion(expandBtn);

            pre.appendChild(expandBtn);
        }
    });
}

// Load snippets from JSON file
async function loadSnippets() {
    try {
        const response = await fetch('snippets.json');
        const data = await response.json();

        const snippetsContainer = document.getElementById('snippets');
        const addSnippetDiv = snippetsContainer.querySelector('.add-snippet');

        // Clear existing content except add snippet form
        const existingBlocks = snippetsContainer.querySelectorAll('.snippet-section, .code-block');
        existingBlocks.forEach(block => block.remove());

        // Create sections for each category
        data.categories.forEach(category => {
            const section = document.createElement('div');
            section.className = 'snippet-section';
            section.innerHTML = `<h2>${category.name}</h2>`;

            category.snippets.forEach(snippet => {
                createSnippetBlock(snippet, section);
            });

            snippetsContainer.insertBefore(section, addSnippetDiv);
        });

        // Re-highlight syntax
        Prism.highlightAll();
        autoCollapseCodeBlocks();

    } catch (error) {
        console.error('Failed to load snippets:', error);
        showNotification('Failed to load snippets', 'error');
    }
}

// Create snippet block from file
async function createSnippetBlock(snippet, container) {
    try {
        const response = await fetch(snippet.file);
        const code = await response.text();

        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';

        const lineCount = code.split('\n').length;
        const preClass = lineCount > 20 ? 'collapsed' : '';
        const expandButton = lineCount > 20 ? '<button class="expand-btn" onclick="toggleCodeExpansion(this)">Expand</button>' : '';

        codeBlock.innerHTML = `
            <div class="code-header">
                <span class="code-title">${escapeHtml(snippet.title)}</span>
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
            </div>
            <div class="code-content">
                <pre class="${preClass}"><code class="language-${snippet.language}">${escapeHtml(code)}</code>${expandButton}</pre>
                <div class="thumbnail-area">
                    <div class="thumbnail-placeholder" onclick="addThumbnail(this)">
                        <span>📸</span>
                        <p>Click to add preview</p>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(codeBlock);

    } catch (error) {
        console.error(`Failed to load snippet file: ${snippet.file}`, error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load snippets from JSON
    loadSnippets();

    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to your Code Snippet Workspace!');
    }, 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + 1 for Snippets tab
    if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        document.querySelector('.tab-button:first-child').click();
    }

    // Ctrl/Cmd + 2 for Tutorials tab
    if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        document.querySelector('.tab-button:last-child').click();
    }
});

// Auto-save functionality (stores in localStorage)
function saveWorkspace() {
    const snippets = [];
    const tutorials = [];

    // Collect all snippets
    document.querySelectorAll('#snippets .code-block').forEach(block => {
        const title = block.querySelector('.code-title').textContent;
        const code = block.querySelector('code').textContent;
        const language = block.querySelector('code').className.replace('language-', '');

        snippets.push({ title, code, language });
    });

    // Collect all tutorials
    document.querySelectorAll('#tutorials .video-card').forEach(card => {
        const title = card.querySelector('h3').textContent;
        const duration = card.querySelector('.duration')?.textContent || '';
        const iframe = card.querySelector('.video-iframe');
        const url = iframe ? iframe.src : '';
        const description = card.querySelector('.video-description p')?.textContent || '';

        tutorials.push({ title, duration, url, description });
    });

    localStorage.setItem('codeWorkspace', JSON.stringify({ snippets, tutorials }));
}

// Auto-save every 30 seconds
setInterval(saveWorkspace, 30000);

// Save on page unload
window.addEventListener('beforeunload', saveWorkspace);