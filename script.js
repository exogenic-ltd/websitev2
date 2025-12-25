document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inject Global Header and Footer
    Promise.all([
        loadHTML('header-placeholder', 'header.html'),
        loadHTML('footer-placeholder', 'footer.html')
    ]).then(() => {
        highlightActiveLink();
        setupScrollEffect();
        setupBackToTop();
    });

    // 2. Setup Carousel (Home Page)
    setupCarousel();

    // 3. Check URL parameters for detail views
    const params = new URLSearchParams(window.location.search);
    const file = params.get('file');

    // 4. Projects Page
    if (document.getElementById('projects-container')) {
        if (file) {
            // Show detail view
            showProjectDetail(file);
        } else {
            // Show list view
            loadAndParseMarkdownList('projects.md', renderProjects);
        }
        setupBackButton('back-to-projects', 'projects.html');
    }

    // 5. Blog Page
    if (document.getElementById('blog-container')) {
        if (file) {
            // Show detail view
            showBlogDetail(file);
        } else {
            // Show list view
            loadAndParseMarkdownList('blog.md', renderBlog);
        }
        setupBackButton('back-to-blog', 'blog.html');
    }

    // 6. Team Page
    if (document.getElementById('team-container')) {
        if (file) {
            // Show detail view
            showTeamDetail(file);
        } else {
            // Show list view
            loadAndParseMarkdownList('team.md', renderTeam);
        }
        setupBackButton('back-to-team', 'team.html');
    }
});

// --- DETAIL VIEW FUNCTIONS ---
function showProjectDetail(file) {
    const listView = document.getElementById('projects-list-view');
    const detailView = document.getElementById('projects-detail-view');
    const viewer = document.getElementById('markdown-viewer');
    
    if (listView) listView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';
    if (viewer) loadSingleMarkdownPost(file, viewer);
}

function showBlogDetail(file) {
    const listView = document.getElementById('blog-list-view');
    const detailView = document.getElementById('blog-detail-view');
    const viewer = document.getElementById('markdown-viewer');
    
    if (listView) listView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';
    if (viewer) loadSingleMarkdownPost(file, viewer);
}

function showTeamDetail(file) {
    const listView = document.getElementById('team-list-view');
    const detailView = document.getElementById('team-detail-view');
    const viewer = document.getElementById('markdown-viewer');
    viewer.classList.add('cv-mode');
    if (listView) listView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';
    if (viewer) loadSingleMarkdownPost(file, viewer);
}

function setupBackButton(buttonId, targetPage) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = targetPage;
        });
    }
}

// --- HTML INJECTION ---
async function loadHTML(placeholderId, filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Failed to load ${filename}`);
        const content = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            const temp = document.createElement('div');
            temp.innerHTML = content;
            placeholder.replaceWith(...temp.childNodes);
        }
    } catch (error) {
        console.error('Error loading HTML:', error);
    }
}

// --- SINGLE POST LOGIC ---
async function loadSingleMarkdownPost(filename, container) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error('File not found');
        const text = await response.text();
        
        // Convert Markdown to HTML
        const htmlContent = simpleMarkdownToHTML(text);
        container.innerHTML = htmlContent;
        
        // Extract H1 for document title
        const titleMatch = text.match(/^# (.*$)/m);
        if (titleMatch) {
            document.title = `${titleMatch[1]} - ExoGenic`;
        }

    } catch (error) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color: #ef4444;">
                <h2>Content Not Found</h2>
                <p>Could not load ${filename}. Please ensure the file exists in the correct location.</p>
            </div>
        `;
    }
}

function simpleMarkdownToHTML(md) {
    // 1. Split the markdown file into sections using "---" as the separator
    // This allows you to create separate cards in your MD file.
    const parts = md.split(/\n\s*---\s*\n/);

    let finalHtml = '';

    parts.forEach(part => {
        let html = part.trim();
        if (!html) return; // Skip empty sections

        // --- Standard Markdown Regex Replacements ---

        // Headers
        html = html.replace(/^# (.*$)/gim, '<h1 class="post-title">$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

        // Bold & Italic
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

        // Images (![alt](url))
        html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="post-img">');

        // Links
        html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

        // Code blocks
        html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
        html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

        // Lists (Unordered)
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Lists (Ordered) - Simple support
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

        // Paragraphs (Handle double newlines)
        html = html.split('\n\n').map(para => {
            para = para.trim();
            if (!para) return '';
            // If it starts with a tag, don't wrap in <p>
            if (para.match(/^<(h|ul|li|bl|pre|img|div|table)/)) return para;
            return `<p>${para}</p>`;
        }).join('\n');

        // --- Wrap the processed chunk in a Card Div ---
        finalHtml += `<div class="detail-card">${html}</div>`;
    });

    return finalHtml;
}

// --- LIST PARSING LOGIC ---
async function loadAndParseMarkdownList(filename, renderCallback) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Failed to load ${filename}`);
        const text = await response.text();
        const data = parseCustomListMarkdown(text);
        renderCallback(data);
    } catch (error) {
        console.error('Error loading markdown list:', error);
        const container = document.querySelector('.grid-3');
        if (container && !container.innerHTML.includes('Error')) {
            container.innerHTML = `
                <p style="color: #ef4444; text-align:center; grid-column: 1/-1;">
                    Error loading content. Please ensure you are running this on a local server (http://localhost).
                </p>
            `;
        }
    }
}

function parseCustomListMarkdown(markdown) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = { title: null, items: [] };
    let currentItem = null;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Section header (single #)
        if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
            if (currentItem) currentSection.items.push(currentItem);
            if (currentSection.items.length > 0 || currentSection.title) {
                sections.push(currentSection);
            }
            currentSection = { title: trimmed.substring(2).trim(), items: [] };
            currentItem = null;
        } 
        // Item header (double ##)
        else if (trimmed.startsWith('## ')) {
            if (currentItem) currentSection.items.push(currentItem);
            currentItem = { 
                title: trimmed.substring(3).trim(), 
                meta: {}, 
                description: '' 
            };
        } 
        // Metadata line (starts with -)
        else if (trimmed.startsWith('- ')) {
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmed.substring(2, colonIndex).trim().toLowerCase();
                const value = trimmed.substring(colonIndex + 1).trim();
                if (currentItem) currentItem.meta[key] = value;
            }
        } 
        // Description text
        else {
            if (currentItem) {
                currentItem.description += (currentItem.description ? ' ' : '') + trimmed;
            }
        }
    });

    // Push final item and section
    if (currentItem) currentSection.items.push(currentItem);
    if (currentSection.items.length > 0 || currentSection.title) {
        sections.push(currentSection);
    }
    
    return sections;
}

// --- RENDERERS ---
function renderProjects(sections) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = ''; 
    sections.flatMap(s => s.items).forEach(project => {
        const link = project.meta.link || '#';
        const icon = project.meta.icon || 'fa-solid fa-code';
        
        const card = document.createElement('div');
        card.className = 'card glass';
        
        // Check if link is a markdown file
        const isDetailLink = link.endsWith('.md');
        const finalLink = isDetailLink ? `projects.html?file=${link}` : link;
        
        // Make entire card clickable if there's a link
        if (link !== '#') {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Prevent double navigation if the user clicks the actual text button
                if (e.target.tagName !== 'A') {
                    window.location.href = finalLink;
                }
            });
        }
        
        card.innerHTML = `
            <div class="icon-box"><i class="${icon}"></i></div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            ${link !== '#' ? `<a href="${finalLink}" class="btn-text">View Details &rarr;</a>` : ''}
        `;
        container.appendChild(card);
    });
}

function renderTeam(sections) {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    container.innerHTML = '';
    sections.forEach(section => {
        // Section title
        if (section.title) {
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.style.fontSize = '1.8rem';
            title.style.marginBottom = '30px';
            title.style.marginTop = section === sections[0] ? '0' : '60px';
            title.style.textAlign = 'left';
            title.innerText = section.title;
            container.appendChild(title);
        }
        
        // Grid for team members
        const grid = document.createElement('div');
        grid.className = 'grid-3';
        if (section.title === 'Founders') {
            grid.style.justifyContent = 'center';
        }
        
        section.items.forEach(member => {
            const card = document.createElement('div');
            card.className = 'card team-card glass';
            const rawImg = member.meta.img || 'fa-solid fa-user';
            const borderColor = section.title === 'Advisors' ? '#555' : 'var(--primary-red)';
            const link = member.meta.link || '#';
            
            // LOGIC CHANGE: Check if it's an image file or an icon class
            let imgContent;
            if (rawImg.includes('/') || rawImg.includes('.')) {
                // It is a local file (e.g., images/photo.jpg)
                imgContent = `<img src="${rawImg}" alt="${member.title}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            } else {
                // It is a FontAwesome icon
                imgContent = `<i class="${rawImg}"></i>`;
            }
            
            // Check if link is a markdown file
            const isDetailLink = link.endsWith('.md');
            const finalLink = isDetailLink ? `team.html?file=${link}` : link;
            
            // Make entire card clickable if there's a link
            if (link !== '#') {
                card.style.cursor = 'pointer';
                card.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'A') {
                        window.location.href = finalLink;
                    }
                });
            }
            
            card.innerHTML = `
                <div class="team-img" style="border-color: ${borderColor}; overflow: hidden;">
                    ${imgContent}
                </div>
                <h3>${member.title}</h3>
                <span class="role" style="${section.title === 'Advisors' ? 'color: var(--text-muted);' : ''}">${member.meta.role || 'Team Member'}</span>
                ${member.meta.extra ? `<p style="font-size:0.9rem; color: #9ca3af; margin-top:5px;">${member.meta.extra}</p>` : ''}
                ${link !== '#' ? `<div class="btn-text" style="margin-top: 15px;">View CV &rarr;</div>` : ''}
            `;
            grid.appendChild(card);
        });
        
        container.appendChild(grid);
    });
}

function renderBlog(sections) {
    const container = document.getElementById('blog-container');
    if (!container) return;
    
    container.innerHTML = '';
    sections.flatMap(s => s.items).forEach(post => {
        const link = post.meta.link || '#';
        const date = post.meta.date || 'Recently';
        
        // Check if link is a markdown file
        const isDetailLink = link.endsWith('.md');
        const finalLink = isDetailLink ? `blog.html?file=${link}` : link;

        const card = document.createElement('article');
        card.className = 'card glass';
        
        // Make entire card clickable if there's a link
        if (link !== '#') {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    window.location.href = finalLink;
                }
            });
        }

        card.innerHTML = `
            <span class="blog-date">${date}</span>
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            ${link !== '#' ? `<a href="${finalLink}" class="read-more">Read Article &rarr;</a>` : ''}
        `;
        container.appendChild(card);
    });
}

// --- UI HELPERS ---
function highlightActiveLink() {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove query parameters for matching
    if (path.includes('?')) {
        path = path.split('?')[0];
    }
    
    if (path === '') path = 'index.html';
    
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === path) {
            link.classList.add('active');
        }
    });
}

function setupScrollEffect() {
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (btn) {
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function setupCarousel() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 1) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3500);
    }
}