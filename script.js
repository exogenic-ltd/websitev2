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

    // --- PAGE SPECIFIC LOGIC ---

    // A. Home Page (New Logic)
    if (document.getElementById('home-projects-container')) {
        loadAndParseMarkdownList('home.md', renderHome);
    }

    // B. Projects Page
    if (document.getElementById('projects-container')) {
        if (file) {
            showProjectDetail(file);
        } else {
            loadAndParseMarkdownList('projects.md', renderProjects);
        }
        setupBackButton('back-to-projects', 'projects.html');
    }

    // C. Blog Page
    if (document.getElementById('blog-container')) {
        if (file) {
            showBlogDetail(file);
        } else {
            loadAndParseMarkdownList('blog.md', renderBlog);
        }
        setupBackButton('back-to-blog', 'blog.html');
    }

    // D. Team Page
    if (document.getElementById('team-container')) {
        if (file) {
            showTeamDetail(file);
        } else {
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
        
        const htmlContent = simpleMarkdownToHTML(text);
        container.innerHTML = htmlContent;
        
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
    const parts = md.split(/\n\s*---\s*\n/);
    let finalHtml = '';

    parts.forEach(part => {
        let html = part.trim();
        if (!html) return;

        html = html.replace(/^# (.*$)/gim, '<h1 class="post-title">$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="post-img">');
        html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
        html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

        html = html.split('\n\n').map(para => {
            para = para.trim();
            if (!para) return '';
            if (para.match(/^<(h|ul|li|bl|pre|img|div|table)/)) return para;
            return `<p>${para}</p>`;
        }).join('\n');

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

        if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
            if (currentItem) currentSection.items.push(currentItem);
            if (currentSection.items.length > 0 || currentSection.title) {
                sections.push(currentSection);
            }
            currentSection = { title: trimmed.substring(2).trim(), items: [] };
            currentItem = null;
        } 
        else if (trimmed.startsWith('## ')) {
            if (currentItem) currentSection.items.push(currentItem);
            currentItem = { 
                title: trimmed.substring(3).trim(), 
                meta: {}, 
                description: '' 
            };
        } 
        else if (trimmed.startsWith('- ')) {
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmed.substring(2, colonIndex).trim().toLowerCase();
                const value = trimmed.substring(colonIndex + 1).trim();
                if (currentItem) currentItem.meta[key] = value;
            }
        } 
        else {
            if (currentItem) {
                currentItem.description += (currentItem.description ? ' ' : '') + trimmed;
            }
        }
    });

    if (currentItem) currentSection.items.push(currentItem);
    if (currentSection.items.length > 0 || currentSection.title) {
        sections.push(currentSection);
    }
    
    return sections;
}

// --- RENDERERS ---

// New: Render Homepage Content
function renderHome(sections) {
    const projectContainer = document.getElementById('home-projects-container');
    const blogContainer = document.getElementById('home-blog-container');
    
    sections.forEach(section => {
        if (section.title === 'Featured Projects' && projectContainer) {
            projectContainer.innerHTML = '';
            section.items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card glass';
                const link = item.meta.link || '#';
                
                if (link !== '#') {
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => window.location.href = link);
                }

                card.innerHTML = `
                    <div class="icon-box"><i class="${item.meta.icon || 'fa-solid fa-star'}"></i></div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                `;
                projectContainer.appendChild(card);
            });
        }
        else if (section.title === 'Latest Insights' && blogContainer) {
            blogContainer.innerHTML = '';
            section.items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card glass';
                const link = item.meta.link || '#';

                if (link !== '#') {
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => window.location.href = link);
                }

                card.innerHTML = `
                    <span style="color: #3b82f6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">
                        ${item.meta.label || 'Update'}
                    </span>
                    <h3 style="margin: 10px 0;">${item.title}</h3>
                    <p>${item.description}</p>
                `;
                blogContainer.appendChild(card);
            });
        }
    });
}

function renderProjects(sections) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = ''; 
    sections.flatMap(s => s.items).forEach(project => {
        const link = project.meta.link || '#';
        const icon = project.meta.icon || 'fa-solid fa-code';
        
        const card = document.createElement('div');
        card.className = 'card glass';
        
        const isDetailLink = link.endsWith('.md');
        const finalLink = isDetailLink ? `projects.html?file=${link}` : link;
        
        if (link !== '#') {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    window.location.href = finalLink;
                }
            });
        }
        
        card.innerHTML = `
            <div class="icon-box"><i class="${icon}"></i></div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
        `;
        container.appendChild(card);
    });
}

function renderTeam(sections) {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    container.innerHTML = '';
    sections.forEach(section => {
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
            
            let imgContent;
            if (rawImg.includes('/') || rawImg.includes('.')) {
                imgContent = `<img src="${rawImg}" alt="${member.title}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            } else {
                imgContent = `<i class="${rawImg}"></i>`;
            }
            
            const isDetailLink = link.endsWith('.md');
            const finalLink = isDetailLink ? `team.html?file=${link}` : link;
            
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
        
        const isDetailLink = link.endsWith('.md');
        const finalLink = isDetailLink ? `blog.html?file=${link}` : link;

        const card = document.createElement('article');
        card.className = 'card glass';
        
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
        `;
        container.appendChild(card);
    });
}

// --- UI HELPERS ---
function highlightActiveLink() {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    if (path.includes('?')) path = path.split('?')[0];
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