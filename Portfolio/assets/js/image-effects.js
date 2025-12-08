/**
 * Image Effects - JavaScript für Parallax & Hover-Effekte
 * Original von meesverberne.com
 */

class ImageEffects {
    constructor() {
        this.parallaxImages = [];
        this.scrollY = 0;
        this.mousePos = { x: 0, y: 0 };
        this.init();
    }

    init() {
        // Parallax-Effekte initialisieren
        this.initParallax();
        
        // Hover-Effekte initialisieren
        this.initHoverEffects();
        
        // Smooth Reveal initialisieren
        this.initSmoothReveal();
        
        // Event-Listener
        this.attachEventListeners();
    }

    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax="true"]');
        
        parallaxElements.forEach(element => {
            const img = element.querySelector('img, .overlay');
            if (img) {
                this.parallaxImages.push({
                    element: element,
                    img: img,
                    speed: parseFloat(element.dataset.parallaxSpeed) || 0.5
                });
            }
        });
    }

    initHoverEffects() {
        // Mouse-Position für Hover-Effekte tracken
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            
            // Parallax auf Hover für horizontale Bilder
            const hoverElements = document.querySelectorAll('.horizontal-single-item');
            hoverElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (this.mousePos.x - centerX) / rect.width;
                const deltaY = (this.mousePos.y - centerY) / rect.height;
                
                if (element.matches(':hover')) {
                    const overlay = element.querySelector('.overlay');
                    if (overlay) {
                        const moveX = deltaX * 15;
                        const moveY = deltaY * 15;
                        overlay.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.12)`;
                    }
                }
            });
        });
        
        // Reset beim Mouse Leave
        document.addEventListener('mouseleave', () => {
            const hoverElements = document.querySelectorAll('.horizontal-single-item');
            hoverElements.forEach(element => {
                const overlay = element.querySelector('.overlay');
                if (overlay) {
                    overlay.style.transform = '';
                }
            });
        });
    }

    initSmoothReveal() {
        const revealElements = document.querySelectorAll('.smooth-reveal, .smooth-reveal-stagger');
        
        if (revealElements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, entry.target.classList.contains('smooth-reveal-stagger') ? index * 100 : 0);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    attachEventListeners() {
        // Scroll-Event für Parallax
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial Update
        this.updateParallax();
    }

    updateParallax() {
        this.scrollY = window.pageYOffset || window.scrollY;
        
        this.parallaxImages.forEach(({ element, img, speed }) => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + this.scrollY;
            const elementHeight = rect.height;
            const windowHeight = window.innerHeight;
            
            // Berechne Parallax-Offset
            const scrolled = this.scrollY + windowHeight;
            const elementCenter = elementTop + elementHeight / 2;
            const distance = scrolled - elementCenter;
            const parallaxOffset = distance * speed;
            
            // Wende Parallax an
            img.style.transform = `translateY(${parallaxOffset}px) scale(1.1)`;
        });
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    window.imageEffects = new ImageEffects();
});
