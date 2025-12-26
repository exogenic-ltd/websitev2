# ExoGenic Website

Official website for ExoGenic (Pvt) Ltd - a MedTech startup developing smart, accessible medical and assistive devices.

## Overview

A modern, responsive website featuring glassmorphism design with dynamic content management through markdown files. The site showcases projects, team members, blog posts, and company information.

## Features

- Fully responsive design (desktop, tablet, mobile)
- Dynamic content loading from markdown files
- Interactive project and team showcases
- Blog system for updates and insights
- Smooth page transitions and animations
- Mobile-friendly hamburger menu

## Getting Started

### Running Locally

Use any local web server to run the site:

**Option 1 - Python:**
Open terminal in project folder and run `python -m http.server 8000`, then visit `http://localhost:8000`

**Option 2 - VS Code:**
Install "Live Server" extension, right-click `index.html`, select "Open with Live Server"

**Option 3 - Node.js:**
Run `npx http-server` in project folder

## Updating Content

### Adding a New Project

1. Open `projects.md` in the root folder
2. Add a new section following the existing format:
   - Title starting with `##`
   - Icon (search Font Awesome for icon names)
   - Link to detail page
   - Short description
3. Create a new markdown file in `content/projects/` folder with full project details
4. Add project images to `assets/images/` if needed

### Adding a Blog Post

1. Open `blog.md`
2. Add new post entry with date and description
3. Create markdown file in `content/blog/` folder
4. Write your article in markdown format

### Adding/Updating Team Members

1. Open `team.md`
2. Add member under appropriate section (Directors, Advisors, Core Team)
3. Include: name, role, photo path, and CV link
4. Add profile photo to `assets/images/team/`
5. Create CV markdown file in `content/team/`

### Updating Homepage

1. Open `home.md`
2. Edit "Featured Projects" or "Latest Insights" sections
3. Changes appear immediately on homepage

### Modifying Pages

- **About page**: Edit `about.html` directly
- **Header/Footer**: Edit `header.html` or `footer.html` (changes reflect across all pages)
- **Styling**: Modify `style.css` for colors, fonts, spacing

## Content Format

All content files use simple markdown:
- `#` for main headings
- `##` for item titles
- `- key: value` for metadata (icon, date, role, etc.)
- Regular text for descriptions

## File Structure

- **Root folder**: Main HTML pages and markdown content files
- **assets/images/**: All photos and graphics
- **content/**: Detailed markdown files for projects, blog, team
- **style.css**: All styling
- **script.js**: Site functionality

## Image Guidelines

- Team photos: 500x500px minimum, square format
- Hero images: 1920x1080px landscape
- Project images: 800px minimum width
- File formats: JPG for photos, PNG for logos

## Tips

- Test changes in multiple screen sizes (desktop, tablet, phone)
- Keep descriptions concise for better mobile experience
- Use consistent naming for files (lowercase, hyphens instead of spaces)
- Back up files before making major changes
- Links starting with `#` will be non-clickable placeholders

## Browser Compatibility

Works on all modern browsers: Chrome, Firefox, Safari, Edge (latest versions)

## Support

For technical issues or questions, contact the ExoGenic development team.

---

© 2025 ExoGenic Pvt Ltd. All rights reserved.
