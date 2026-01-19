import fs from 'fs';
import path from 'path';

// Utilities
const readFile = (path) => fs.readFileSync(path, 'utf8');
const writeFile = (path, content) => fs.writeFileSync(path, content);
const ensureDir = (path) => { if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true }); };

const legacyRoot = 'legacy_site';
const srcRoot = 'src/content';

ensureDir(`${srcRoot}/team`);
ensureDir(`${srcRoot}/blog`);
ensureDir(`${srcRoot}/projects`);

// --- Helpers ---
function extractFrontmatter(content, overrides = {}) {
    const lines = content.split('\n');
    let title = '';
    let body = [];
    let props = { ...overrides };

    // Simple parser for the legacy format which seemed to be:
    // # Title
    // metadata lines?
    // content

    // We'll rely more on the overrides from the index files (team.md, blog.md)
    // and just grab the body from the file, stripping the first H1 if it matches the name.

    let isBody = false;
    for (const line of lines) {
        if (!isBody) {
            if (line.startsWith('# ')) {
                if (!props.title) props.title = line.replace('# ', '').trim();
                continue; // Skip H1 title in body
            }
            // Skip initial image if it's the profile image/icon already in metadata
            if (line.match(/^!\[.*\]\(.*\)/)) {
                continue;
            }
            if (line.trim() === '') continue;

            // If we hit content separators or just text, start body
            if (line.startsWith('**') && props.role && line.includes(props.role)) {
                continue; // Skip role if repeated
            }
            isBody = true;
            body.push(line);
        } else {
            body.push(line);
        }
    }

    // Frontmatter construction
    let fm = '---\n';
    for (const [key, val] of Object.entries(props)) {
        if (val !== undefined && val !== null) {
            let v = val;
            if (typeof v === 'string') v = `"${v.replace(/"/g, '\\"')}"`;
            fm += `${key}: ${v}\n`;
        }
    }
    fm += '---\n\n';
    return fm + body.join('\n').trim();
}

// --- Team Migration ---
console.log("Migrating Team...");
const teamIndex = readFile(`${legacyRoot}/team.md`);
// Parse team.md to get the list and metadata
// Format: 
// ## Name
// - role: ...
// - img: ...
// - link: content/team/xxx.md

const teamRegex = /## (.*?)\n- role: (.*?)\n- img: (.*?)\n- link: (.*?)\n/g;
let match;
let teamOrder = 0;

// We need to parse manually loop or regex global
const teamLines = teamIndex.split('\n');
let currentPerson = {};
for (let i = 0; i < teamLines.length; i++) {
    const line = teamLines[i].trim();
    if (line.startsWith('## ')) {
        if (currentPerson.name) processPerson(currentPerson);
        currentPerson = { name: line.replace('## ', ''), order: ++teamOrder };
    } else if (line.startsWith('- role: ')) {
        currentPerson.role = line.replace('- role: ', '');
    } else if (line.startsWith('- img: ')) {
        currentPerson.image = '/' + line.replace('- img: ', '').replace('assets/', 'assets/'); // Ensure path
    } else if (line.startsWith('- link: ')) {
        currentPerson.link = line.replace('- link: ', '');
    }
}
if (currentPerson.name) processPerson(currentPerson);

function processPerson(p) {
    if (!p.link || !p.link.startsWith('content/team')) return;
    const oldPath = `${legacyRoot}/${p.link}`;
    if (!fs.existsSync(oldPath)) {
        console.warn(`File not found: ${oldPath}`);
        return;
    }
    const content = readFile(oldPath);
    const filename = path.basename(p.link);

    // Override image path in p.image to be absolute from public
    // Assuming we move assets to public/
    // p.image e.g. "assets/images/team/harindu.jpg" -> "/assets/images/team/harindu.jpg" (Astro public)

    const newContent = extractFrontmatter(content, {
        name: p.name,
        role: p.role,
        image: "/" + p.image.replace(/^\//, ''),
        order: p.order
    });

    writeFile(`${srcRoot}/team/${filename}`, newContent);
    console.log(`Wrote ${filename}`);
}

// --- Blog Migration ---
console.log("Migrating Blog...");
const blogIndex = readFile(`${legacyRoot}/blog.md`);
// Format:
// ## Title
// - date: ...
// - link: ...
// Description...

const blogLines = blogIndex.split('\n');
let currentBlog = {};
for (let i = 0; i < blogLines.length; i++) {
    const line = blogLines[i].trim();
    if (line.startsWith('## ')) {
        if (currentBlog.title) processBlog(currentBlog);
        currentBlog = { title: line.replace('## ', '') };
    } else if (line.startsWith('- date: ')) {
        currentBlog.date = new Date(line.replace('- date: ', '')).toISOString().split('T')[0];
    } else if (line.startsWith('- link: ')) {
        currentBlog.link = line.replace('- link: ', '');
    } else if (line && !line.startsWith('-')) {
        currentBlog.description = line;
    }
}
if (currentBlog.title) processBlog(currentBlog);

function processBlog(b) {
    if (!b.link || !b.link.startsWith('content/blog')) {
        // Create placeholder if link is invalid or #
        const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filename = `${slug}.md`;
        const content = `\nPlaceholder content for ${b.title}`;

        const newContent = `---\ntitle: "${b.title}"\ndate: ${b.date}\ndescription: "${b.description || ''}"\n---\n${content}`;
        writeFile(`${srcRoot}/blog/${filename}`, newContent);
        console.log(`Created placeholder ${filename}`);
        return;
    }

    const oldPath = `${legacyRoot}/${b.link}`;
    if (!fs.existsSync(oldPath)) {
        console.warn(`File not found: ${oldPath}`);
        return;
    }
    const content = readFile(oldPath);
    const filename = path.basename(b.link);

    const newContent = extractFrontmatter(content, {
        title: b.title,
        date: b.date,
        description: b.description
    });

    writeFile(`${srcRoot}/blog/${filename}`, newContent);
    console.log(`Wrote ${filename}`);
}

// --- Projects Migration ---
console.log("Migrating Projects...");
const projectIndex = readFile(`${legacyRoot}/projects.md`);
// Format:
// ## Title
// - icon: ...
// - link: ...
// Description

const projLines = projectIndex.split('\n');
let currentProj = {};
for (let i = 0; i < projLines.length; i++) {
    const line = projLines[i].trim();
    if (line.startsWith('## ')) {
        if (currentProj.title) processProj(currentProj);
        currentProj = { title: line.replace('## ', '') };
    } else if (line.startsWith('- icon: ')) {
        currentProj.icon = line.replace('- icon: ', '');
    } else if (line.startsWith('- link: ')) {
        currentProj.link = line.replace('- link: ', '');
    } else if (line && !line.startsWith('-')) {
        currentProj.description = line;
    }
}
if (currentProj.title) processProj(currentProj);

function processProj(p) {
    if (!p.link || !p.link.startsWith('content/projects')) {
        // Create placeholder or just data entry?
        // Let's create a file even for external links/placeholders, but maybe marked as "external"?
        // Or if link is #, it's just a card.
        // For Content Collections, every entry needs a file.
        const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filename = `${slug}.md`;

        let fm = {
            title: p.title,
            icon: p.icon,
            description: p.description
        };

        let body = "Coming soon.";

        if (p.link !== '#' && !p.link.startsWith('content/')) {
            fm.link = p.link; // External/other link
        }

        const content = `---\n${Object.entries(fm).map(([k, v]) => `${k}: "${v}"`).join('\n')}\n---\n${body}`;
        writeFile(`${srcRoot}/projects/${filename}`, content);
        return;
    }

    const oldPath = `${legacyRoot}/${p.link}`;
    if (!fs.existsSync(oldPath)) return;

    const content = readFile(oldPath);
    const filename = path.basename(p.link);

    const newContent = extractFrontmatter(content, {
        title: p.title,
        icon: p.icon,
        description: p.description
    });

    writeFile(`${srcRoot}/projects/${filename}`, newContent);
    console.log(`Wrote ${filename}`);
}

