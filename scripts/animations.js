// Animations JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initTypeWriter();
    initCounterAnimations();
    initMagneticEffects();
    initParallaxEffects();
    initTextAnimations();
    initHoverEffects();
});

// Typewriter Effect
function initTypeWriter() {
    const typewriterElement = document.getElementById('typewriter');
    
    if (!typewriterElement) return;
    
    const texts = [
        'Data Scientist',
        'AI Researcher', 
        'LLM Specialist',
        'Gen-Z Innovator',
        'Machine Learning Engineer'
    ];
    
    let textIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (!isDeleting && !isPaused) {
            // Typing
            typewriterElement.textContent = currentText.substring(0, characterIndex + 1);
            characterIndex++;
            
            if (characterIndex === currentText.length) {
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                    isDeleting = true;
                }, 2000); // Pause at end
            }
        } else if (isDeleting && !isPaused) {
            // Deleting
            typewriterElement.textContent = currentText.substring(0, characterIndex - 1);
            characterIndex--;
            
            if (characterIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                }, 500); // Pause before next word
            }
        }
        
        // Variable typing speed
        const typingSpeed = isDeleting ? 50 : 100;
        const pauseSpeed = isPaused ? 0 : typingSpeed;
        
        setTimeout(typeWriter, pauseSpeed);
    }
    
    // Start the animation
    typeWriter();
}

// Counter Animations
function initCounterAnimations() {
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length === 0) return;
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.7
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const start = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(target * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Magnetic Effects
function initMagneticEffects() {
    const magneticElements = document.querySelectorAll('.btn, .project-card, .blog-card');
    
    magneticElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const moveX = x * 0.1;
            const moveY = y * 0.1;
            
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        element.addEventListener('mouseleave', function() {
            element.style.transform = 'translate(0px, 0px)';
        });
    });
}

// Parallax Effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    if (parallaxElements.length === 0) return;
    
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            const yPos = Math.round(rate);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Text Animations
function initTextAnimations() {
    // Animate text on scroll
    const textElements = document.querySelectorAll('.animate-text');
    
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateTextReveal(entry.target);
                textObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    textElements.forEach(element => {
        textObserver.observe(element);
    });
}

function animateTextReveal(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    // Split text into words
    const words = text.split(' ');
    
    words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = word + ' ';
        wordSpan.style.opacity = '0';
        wordSpan.style.transform = 'translateY(20px)';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.transition = 'all 0.6s ease';
        
        element.appendChild(wordSpan);
        
        setTimeout(() => {
            wordSpan.style.opacity = '1';
            wordSpan.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Hover Effects
function initHoverEffects() {
    // Glow effect for interactive elements
    const glowElements = document.querySelectorAll('.glow-on-hover');
    
    glowElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.classList.add('glowing');
        });
        
        element.addEventListener('mouseleave', function() {
            this.classList.remove('glowing');
        });
    });
    
    // Tilt effect for cards
    const tiltElements = document.querySelectorAll('.tilt-effect');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);
            
            const tiltX = deltaY * 10; // Max 10 degrees
            const tiltY = deltaX * -10;
            
            element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });
        
        element.addEventListener('mouseleave', function() {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

// Scroll Progress Indicator
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    
    // Add styles
    const styles = `
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(255, 255, 255, 0.1);
            z-index: 9999;
            pointer-events: none;
        }
        .scroll-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-500), var(--accent-pink));
            width: 0%;
            transition: width 0.1s ease;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(progressBar);
    
    const progressBarFill = progressBar.querySelector('.scroll-progress-bar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBarFill.style.width = Math.min(scrollPercent, 100) + '%';
    });
}

// Floating Animations
function initFloatingAnimations() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        // Random animation duration between 4-8 seconds
        const duration = 4 + Math.random() * 4;
        element.style.animationDuration = duration + 's';
        
        // Random delay
        element.style.animationDelay = (index * 0.5) + 's';
        
        // Add random movement
        element.addEventListener('animationiteration', function() {
            const randomX = (Math.random() - 0.5) * 40;
            const randomY = (Math.random() - 0.5) * 40;
            
            element.style.setProperty('--random-x', randomX + 'px');
            element.style.setProperty('--random-y', randomY + 'px');
        });
    });
}

// Mouse Trail Effect
function initMouseTrail() {
    const trail = [];
    const trailLength = 20;
    
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-500);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: ${1 - i / trailLength};
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateTrail() {
        let currentX = mouseX;
        let currentY = mouseY;
        
        trail.forEach((dot, index) => {
            const nextDot = trail[index + 1] || { style: { left: mouseX + 'px', top: mouseY + 'px' } };
            
            const targetX = parseFloat(nextDot.style.left) || mouseX;
            const targetY = parseFloat(nextDot.style.top) || mouseY;
            
            currentX += (targetX - currentX) * 0.3;
            currentY += (targetY - currentY) * 0.3;
            
            dot.style.left = currentX + 'px';
            dot.style.top = currentY + 'px';
        });
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// Loading Animations
function initLoadingAnimations() {
    // Page load animation
    window.addEventListener('load', function() {
        const loadingScreen = document.querySelector('.loading-screen');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
        
        // Animate elements on page load
        const animateOnLoad = document.querySelectorAll('.animate-on-load');
        animateOnLoad.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('loaded');
            }, index * 100);
        });
    });
}

// Advanced Scroll Animations
function initAdvancedScrollAnimations() {
    const animationOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.animation;
                const delay = element.dataset.delay || 0;
                
                setTimeout(() => {
                    switch (animationType) {
                        case 'fadeIn':
                            element.classList.add('fade-in-active');
                            break;
                        case 'slideUp':
                            element.classList.add('slide-up-active');
                            break;
                        case 'slideLeft':
                            element.classList.add('slide-left-active');
                            break;
                        case 'slideRight':
                            element.classList.add('slide-right-active');
                            break;
                        case 'zoomIn':
                            element.classList.add('zoom-in-active');
                            break;
                        case 'flipIn':
                            element.classList.add('flip-in-active');
                            break;
                    }
                }, delay);
                
                animationObserver.unobserve(element);
            }
        });
    }, animationOptions);
    
    // Observe all elements with animation data attributes
    const animatedElements = document.querySelectorAll('[data-animation]');
    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });
}

// Particle Burst Effect
function createParticleBurst(x, y, color = 'var(--primary-500)') {
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x}px;
            top: ${y}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        const life = 1000 + Math.random() * 500;
        
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let opacity = 1;
        const startTime = performance.now();
        
        function animateParticle(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = elapsed / life;
            
            if (progress < 1) {
                const x = parseInt(particle.style.left) + vx;
                const y = parseInt(particle.style.top) + vy;
                
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.opacity = 1 - progress;
                
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
}

// Initialize all animations
function initAllAnimations() {
    initScrollProgress();
    initFloatingAnimations();
    initLoadingAnimations();
    initAdvancedScrollAnimations();
    
    // Add click burst effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            createParticleBurst(e.clientX, e.clientY, 'var(--accent-pink)');
        });
    });
    
    // Initialize mouse trail on desktop only
    if (window.innerWidth > 768) {
        initMouseTrail();
    }
}

// Performance optimization - pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    const animatedElements = document.querySelectorAll('*');
    
    if (document.hidden) {
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// Reduce animations for users who prefer reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    respectMotionPreferences();
    optimizeAnimations();
    initAllAnimations();
});

// Export functions for external use
window.AnimationUtils = {
    createParticleBurst,
    animateCounter,
    animateTextReveal
};

// Accessibility considerations
function respectMotionPreferences() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // Disable complex animations
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Performance considerations
function optimizeAnimations() {
    // Reduce animations on mobile for better performance
    if (window.innerWidth < 768) {
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
    
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', function() {
        const particles = document.querySelectorAll('.particle, .trail-dot');
        
        if (document.hidden) {
            particles.forEach(particle => {
                particle.style.animationPlayState = 'paused';
            });
        } else {
            particles.forEach(particle => {
                particle.style.animationPlayState = 'running';
            });
        }
    });
} 