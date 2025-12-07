/**
 * NEURAL COSMOS - Portfolio JavaScript
 * Handles animations, interactions, and dynamic content
 */

// =====================================================
// Neural Network Canvas Animation
// =====================================================
class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.particleCount = window.innerWidth < 768 ? 50 : 100;

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(255, 45, 106, 0.6)',   // Magenta
            'rgba(0, 245, 212, 0.6)',    // Cyan
            'rgba(255, 107, 53, 0.6)',   // Coral
            'rgba(255, 195, 0, 0.4)'     // Gold
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
    }

    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (150 - distance) / 150 * 0.3;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 245, 212, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    particle.vx -= (dx / distance) * force * 0.02;
                    particle.vy -= (dy / distance) * force * 0.02;
                }
            }

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Minimum velocity
            if (Math.abs(particle.vx) < 0.1) particle.vx = (Math.random() - 0.5) * 0.5;
            if (Math.abs(particle.vy) < 0.1) particle.vy = (Math.random() - 0.5) * 0.5;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawParticles();
        this.connectParticles();
        this.updateParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// =====================================================
// Typing Effect
// =====================================================
class TypeWriter {
    constructor(element, words, waitTime = 2000) {
        this.element = element;
        this.words = words;
        this.waitTime = waitTime;
        this.wordIndex = 0;
        this.text = '';
        this.isDeleting = false;
        this.type();
    }

    type() {
        const currentWord = this.words[this.wordIndex % this.words.length];

        if (this.isDeleting) {
            this.text = currentWord.substring(0, this.text.length - 1);
        } else {
            this.text = currentWord.substring(0, this.text.length + 1);
        }

        this.element.textContent = this.text;

        let typeSpeed = this.isDeleting ? 50 : 100;

        if (!this.isDeleting && this.text === currentWord) {
            typeSpeed = this.waitTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.text === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// =====================================================
// Counter Animation
// =====================================================
class CounterAnimation {
    constructor(elements) {
        this.elements = elements;
        this.hasAnimated = false;
    }

    animate() {
        if (this.hasAnimated) return;

        this.elements.forEach(element => {
            const target = parseInt(element.dataset.count);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const counter = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target + '+';
                    clearInterval(counter);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        });

        this.hasAnimated = true;
    }
}

// =====================================================
// Skill Bar Animation
// =====================================================
class SkillBars {
    constructor() {
        this.skillItems = document.querySelectorAll('.skill-item');
        this.hasAnimated = false;
    }

    animate() {
        if (this.hasAnimated) return;

        this.skillItems.forEach((item, index) => {
            const level = item.dataset.level;
            const progress = item.querySelector('.skill-progress');

            setTimeout(() => {
                progress.style.width = level + '%';
            }, index * 100);
        });

        this.hasAnimated = true;
    }
}

// =====================================================
// Scroll Reveal Animation
// =====================================================
class ScrollReveal {
    constructor() {
        this.revealElements = document.querySelectorAll('.section');
        this.init();
    }

    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.revealElements.forEach(el => {
            el.classList.add('reveal');
            this.observer.observe(el);
        });
    }
}

// =====================================================
// Navigation
// =====================================================
class Navigation {
    constructor() {
        this.nav = document.getElementById('nav');
        this.navToggle = document.getElementById('nav-toggle');
        this.navLinks = document.getElementById('nav-links');
        this.links = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        // Scroll behavior
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }
        });

        // Mobile toggle
        this.navToggle.addEventListener('click', () => {
            this.navToggle.classList.toggle('active');
            this.navLinks.classList.toggle('open');
        });

        // Close on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                this.navToggle.classList.remove('active');
                this.navLinks.classList.remove('open');
            });
        });

        // Smooth scroll
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// =====================================================
// Project Card Tilt Effect
// =====================================================
class TiltEffect {
    constructor() {
        this.cards = document.querySelectorAll('.project-card, .blog-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
}

// =====================================================
// Initialize Everything
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Neural Network Canvas
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        new NeuralNetwork(canvas);
    }

    // Typing Effect
    const typedElement = document.getElementById('typed-role');
    if (typedElement) {
        new TypeWriter(typedElement, [
            'Data Scientist',
            'ML Engineer',
            'AI Enthusiast',
            'Problem Solver'
        ]);
    }

    // Counter Animation
    const counterElements = document.querySelectorAll('.stat-number');
    const counterAnimation = new CounterAnimation(counterElements);

    // Skill Bars
    const skillBars = new SkillBars();

    // Intersection Observer for counters and skills
    const heroSection = document.getElementById('hero');
    const skillsSection = document.getElementById('skills');

    const observerOptions = { threshold: 0.5 };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                counterAnimation.animate();
            }
        });
    }, observerOptions);

    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillBars.animate();
            }
        });
    }, observerOptions);

    if (heroSection) counterObserver.observe(heroSection);
    if (skillsSection) skillsObserver.observe(skillsSection);

    // Navigation
    new Navigation();

    // Scroll Reveal
    new ScrollReveal();

    // Tilt Effect
    new TiltEffect();

    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// =====================================================
// Preloader (Optional)
// =====================================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
