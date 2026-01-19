document.addEventListener('DOMContentLoaded', () => {
    initNetworkBackground();
    setupScrollEffect();
    setupMobileMenu();
    setupCarousel();
    setupBackToTop();
});

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

function setupMobileMenu() {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');

    if (nav && navLinks && !document.querySelector('.mobile-menu-btn')) {
        const btn = document.createElement('div');
        btn.className = 'mobile-menu-btn';
        btn.innerHTML = '<i class="fa-solid fa-bars"></i>';

        btn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        nav.appendChild(btn);
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

// --- NETWORK BACKGROUND ANIMATION ---
function initNetworkBackground() {
    const canvas = document.getElementById('network-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    const config = {
        particleColor: 'rgba(255, 255, 255, 1)',
        lineColor: 'rgba(59, 130, 246, 0.15)',
        defaultSpeed: 0.3,
        linkRadius: 130,
        mouseRadius: 160
    };

    let w, h;
    let mouse = { x: null, y: null };

    function resizeCanvas() {
        w = window.innerWidth;
        h = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        if (particles.length === 0 || Math.abs(particles.length - (w * h) / 15000) > 20) {
            initParticles();
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * config.defaultSpeed;
            this.vy = (Math.random() - 0.5) * config.defaultSpeed;
            this.size = Math.random() * 2 + 0.8;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;

            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (config.mouseRadius - distance) / config.mouseRadius;
                    const directionX = forceDirectionX * force * 2;
                    const directionY = forceDirectionY * force * 2;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = config.particleColor;
            ctx.shadowBlur = 20;
            ctx.shadowColor = "white";
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function initParticles() {
        particles = [];
        const density = Math.floor((w * h) / 15000);
        const count = Math.min(Math.max(density, 30), 120);

        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
            let p1 = particles[i];
            p1.update();
            p1.draw();

            for (let j = i; j < particles.length; j++) {
                let p2 = particles[j];
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.linkRadius) {
                    ctx.beginPath();
                    let opacity = 1 - (distance / config.linkRadius);
                    ctx.strokeStyle = config.lineColor.replace('0.15', (0.15 * opacity).toString());
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
}
