Guide: Modular Website (Separate Header/Footer)This method separates your code into reusable parts so you don't have to copy-paste the menu 20 times.1. The File StructureCreate a folder with these files:style.css (Design rules)header.html (Menu code only)footer.html (Footer code only)script.js (The logic to load the files)index.html (Homepage)projects.html (Projects page)2. style.css (The Design)Same as before./* --- CSS Variables & Reset --- */
:root {
    --primary-color: #0056b3;
    --primary-dark: #004494;
    --secondary-color: #00a8e8;
    --text-main: #1f2937;
    --text-light: #6b7280;
    --bg-light: #f9fafb;
    --white: #ffffff;
    --max-width: 1200px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: var(--text-main);
    background-color: var(--white);
    scroll-behavior: smooth;
    display: flex; /* Helps footer stick to bottom */
    flex-direction: column;
    min-height: 100vh;
}

/* --- Layout Utilities --- */
.container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 20px;
}
.section-padding { padding: 80px 0; }
.bg-light { background-color: var(--bg-light); }

/* --- Header & Navigation --- */
header {
    background: var(--white);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}
.logo {
    font-weight: 800;
    font-size: 1.5rem;
    text-decoration: none;
    color: var(--primary-color);
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 10px;
}
.nav-links { display: flex; gap: 30px; }
.nav-links a {
    text-decoration: none;
    color: var(--text-main);
    font-weight: 500;
    transition: color 0.2s;
}
.nav-links a:hover, .nav-links a.active { color: var(--primary-color); }

/* --- Hero Section --- */
.hero {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 100px 0 120px;
    text-align: center;
}
.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
}
.hero p {
    font-size: 1.25rem;
    color: var(--text-light);
    max-width: 700px;
    margin: 0 auto 2.5rem;
}

/* --- Buttons --- */
.btn {
    display: inline-block;
    background: var(--primary-color);
    color: var(--white);
    padding: 14px 32px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 86, 179, 0.2);
    border: 2px solid var(--primary-color);
}
.btn:hover {
    background: var(--primary-dark);
    border-color: var(--primary-dark);
    transform: translateY(-2px);
}
.btn-outline {
    background: transparent;
    color: var(--primary-color);
    margin-left: 10px;
    box-shadow: none;
}
.btn-outline:hover {
    background: var(--primary-color);
    color: var(--white);
}

/* --- Cards & Grid --- */
.grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}
.card {
    background: var(--white);
    padding: 40px 30px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    transition: transform 0.3s ease;
}
.card:hover { transform: translateY(-5px); border-color: var(--primary-color); }
.icon-box {
    width: 60px; height: 60px;
    background: #e0f2fe; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
}
.icon-box i { font-size: 1.5rem; color: var(--primary-color); }
.card h3 { font-size: 1.5rem; margin-bottom: 15px; color: var(--text-main); }
.card p { color: var(--text-light); }

/* --- Footer --- */
footer {
    background: #111827;
    color: #d1d5db;
    padding: 60px 0 30px;
    margin-top: auto;
}
.footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 50px;
    margin-bottom: 50px;
}
.footer-links ul { list-style: none; }
.footer-links a { color: #d1d5db; text-decoration: none; }
.footer-links a:hover { color: var(--white); }

/* --- Responsive --- */
@media (max-width: 768px) {
    .hero h1 { font-size: 2.5rem; }
    .nav-links { display: none; }
    .footer-grid { grid-template-columns: 1fr; gap: 30px; text-align: center; }
}
3. header.html (Reusable Menu)This file contains ONLY the header code. No <html> or <body> tags.<header>
    <div class="container">
        <nav>
            <a href="index.html" class="logo"><i class="fa-solid fa-dna"></i> EXOGENIC</a>
            <div class="nav-links">
                <a href="index.html" class="nav-item">Home</a>
                <a href="about.html" class="nav-item">About</a>
                <a href="projects.html" class="nav-item">Projects</a>
                <a href="contact.html" class="nav-item">Contact</a>
            </div>
        </nav>
    </div>
</header>
4. footer.html (Reusable Footer)This file contains ONLY the footer code.<footer>
    <div class="container">
        <div class="footer-grid">
            <div>
                <span class="logo" style="color:white; margin-bottom:15px; display:block;">EXOGENIC</span>
                <p>Building the Future of Med-Tech.</p>
            </div>
            <div class="footer-links">
                <h4>Company</h4>
                <ul>
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="projects.html">Projects</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h4>Connect</h4>
                <ul>
                    <li><a href="contact.html">Contact Us</a></li>
                    <li><a href="#">LinkedIn</a></li>
                </ul>
            </div>
        </div>
        <p style="text-align: center; border-top: 1px solid #333; padding-top: 20px;">&copy; 2025 Exogenic Pvt Ltd. All rights reserved.</p>
    </div>
</footer>
5. script.js (The Loader)This script loads the header/footer and automatically highlights the correct menu link.// Function to load HTML files
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const content = await response.text();
            document.getElementById(elementId).innerHTML = content;
            
            // If we just loaded the header, highlight the active link
            if (elementId === 'header-placeholder') setActiveLink();
        } else {
            console.error(`Error loading ${filePath}: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}

// Function to highlight the current page in the menu
function setActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
}

// Load components when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', 'header.html');
    loadComponent('footer-placeholder', 'footer.html');
});
6. index.html (Clean Homepage)Notice how much shorter this is! We just add placeholders for the header and footer.<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - Exogenic Pvt Ltd</title>
    <link rel="stylesheet" href="style.css">
    <!-- Icons -->
    <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css)">
    <!-- Fonts -->
    <link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap)" rel="stylesheet">
</head>
<body>

    <!-- Header will appear here -->
    <div id="header-placeholder"></div>

    <section class="hero">
        <div class="container">
            <h1>Redefining Human Potential</h1>
            <p>We are building the future of Med-Tech. Empowering lives through cutting-edge technologies.</p>
            <div>
                <a href="contact.html" class="btn">Partner with Us</a>
                <a href="projects.html" class="btn btn-outline">View Our Work</a>
            </div>
        </div>
    </section>

    <!-- Footer will appear here -->
    <div id="footer-placeholder"></div>

    <!-- Load the script at the end -->
    <script src="script.js"></script>
</body>
</html>
7. projects.html (Clean Projects Page)<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projects - Exogenic Pvt Ltd</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css)">
    <link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap)" rel="stylesheet">
</head>
<body>

    <!-- Header Placeholder -->
    <div id="header-placeholder"></div>

    <section class="section-padding bg-light">
        <div class="container">
            <div style="text-align: center; margin-bottom: 60px;">
                <h2>Our Projects</h2>
                <p>Explore our latest innovations in med-tech.</p>
            </div>

            <div class="grid-3">
                <div class="card">
                    <div class="icon-box"><i class="fa-solid fa-microscope"></i></div>
                    <h3>Bionic Arm V1</h3>
                    <p>An affordable, 3D-printed bionic arm controlled by muscle signals (EMG).</p>
                </div>
                <div class="card">
                    <div class="icon-box"><i class="fa-solid fa-heart-pulse"></i></div>
                    <h3>Cardiac Monitor</h3>
                    <p>Real-time remote monitoring system for patients with arrhythmia.</p>
                </div>
                <div class="card">
                    <div class="icon-box"><i class="fa-solid fa-brain"></i></div>
                    <h3>Neuro-Link</h3>
                    <p>Research into brain-computer interfaces for paralysis recovery.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer Placeholder -->
    <div id="footer-placeholder"></div>

    <script src="script.js"></script>
</body>
</html>
