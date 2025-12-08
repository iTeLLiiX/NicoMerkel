/**
 * Skills Loader - Weltklasse Skills-System
 * Professionelle, interaktive Skill-Visualisierung
 */

class SkillsLoader {
    constructor() {
        this.skillsData = null;
        this.currentFilter = 'all';
        this.skillsContainer = null;
        this.filterButtons = null;
        this.observer = null;
    }

    async init() {
        try {
            // Loading State
            this.showLoading();

            // Skills-Daten laden
            const response = await fetch('data/skills-data.json');
            if (!response.ok) throw new Error('Skills-Daten konnten nicht geladen werden');
            
            this.skillsData = await response.json();
            this.skillsContainer = document.getElementById('skills-container');
            
            if (!this.skillsContainer) {
                console.error('Skills-Container nicht gefunden');
                return;
            }

            // Filter-Buttons erstellen
            this.createFilterButtons();
            
            // Skills rendern
            await this.renderSkills();
            
            // Event-Listener
            this.attachEventListeners();
            
            // Intersection Observer für Scroll-Animationen
            this.initScrollObserver();
            
        } catch (error) {
            console.error('Fehler beim Laden der Skills:', error);
            this.showFallback();
        }
    }

    showLoading() {
        const container = document.getElementById('skills-container');
        if (container) {
            container.innerHTML = '<div class="skills-loading"></div>';
        }
    }

    createFilterButtons() {
        const filterContainer = document.getElementById('skills-filter');
        if (!filterContainer) return;

        filterContainer.innerHTML = '';

        // "Alle" Button
        const allButton = document.createElement('button');
        allButton.className = 'filter-btn active';
        allButton.dataset.filter = 'all';
        allButton.textContent = 'Alle';
        allButton.setAttribute('aria-label', 'Alle Skills anzeigen');
        filterContainer.appendChild(allButton);

        // Kategorie-Buttons
        this.skillsData.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.filter = category.id;
            button.textContent = category.name;
            button.setAttribute('aria-label', `${category.name} Skills anzeigen`);
            filterContainer.appendChild(button);
        });
    }

    async renderSkills(filter = 'all') {
        if (!this.skillsContainer || !this.skillsData) return;

        // Skills filtern
        const filteredSkills = filter === 'all' 
            ? this.skillsData.skills 
            : this.skillsData.skills.filter(skill => skill.category === filter);

        // Sortieren nach Level (höchste zuerst)
        filteredSkills.sort((a, b) => {
            const aRatio = a.level / a.maxLevel;
            const bRatio = b.level / b.maxLevel;
            return bRatio - aRatio;
        });

        // Container leeren
        this.skillsContainer.innerHTML = '';

        // Skills rendern mit Stagger-Animation
        filteredSkills.forEach((skill, index) => {
            const skillCard = this.createSkillCard(skill);
            this.skillsContainer.appendChild(skillCard);
            
            // Staggered Animation
            setTimeout(() => {
                skillCard.style.opacity = '0';
                skillCard.style.transform = 'translateY(40px) scale(0.95)';
                
                requestAnimationFrame(() => {
                    skillCard.classList.add('visible');
                });
            }, index * 80);
        });

        // Level-Bars animieren nach kurzer Verzögerung
        setTimeout(() => {
            this.animateLevelBars();
        }, filteredSkills.length * 80 + 200);
    }

    createSkillCard(skill) {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.dataset.category = skill.category;
        card.dataset.skillId = skill.id;

        // Level-Berechnung
        const levelPercentage = (skill.level / skill.maxLevel) * 100;
        const levelLabel = this.getLevelLabel(skill.level, skill.maxLevel);

        // Kategorie-Name finden
        const category = this.skillsData.categories.find(cat => cat.id === skill.category);
        const categoryName = category ? category.name : '';

        card.innerHTML = `
            <div class="skill-card-inner">
                <div class="skill-icon-wrapper">
                    <div class="skill-icon-border"></div>
                    <img src="${skill.icon}" alt="${skill.name}" class="skill-icon-img" loading="lazy" />
                    <div class="skill-level-badge">${skill.level}/${skill.maxLevel}</div>
                </div>
                <div class="skill-content">
                    <h6 class="skill-name">${skill.name}</h6>
                    <p class="skill-description">${skill.description}</p>
                    <div class="skill-level-bar">
                        <div class="skill-level-fill" data-level="${levelPercentage}" style="width: 0%"></div>
                    </div>
                    <div class="skill-meta">
                        <span class="skill-level-label">${levelLabel}</span>
                        ${skill.years ? `<span class="skill-years">${skill.years} ${skill.years === 1 ? 'Jahr' : 'Jahre'}</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        // Hover-Effekte
        this.attachCardInteractions(card);

        return card;
    }

    attachCardInteractions(card) {
        let isHovering = false;

        card.addEventListener('mouseenter', () => {
            isHovering = true;
            this.handleCardHover(card, true);
        });

        card.addEventListener('mouseleave', () => {
            isHovering = false;
            this.handleCardHover(card, false);
        });

        // Magnetic Effect
        card.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const moveX = (x - centerX) * 0.05;
            const moveY = (y - centerY) * 0.05;
            
            card.style.transform = `translateY(-8px) scale(1.02) translate(${moveX}px, ${moveY}px)`;
        });
    }

    handleCardHover(card, isEntering) {
        const icon = card.querySelector('.skill-icon-img');
        const border = card.querySelector('.skill-icon-border');
        
        if (isEntering) {
            // Icon Animation
            if (icon) {
                icon.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            if (border) {
                border.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        } else {
            card.style.transform = '';
            if (icon) icon.style.transform = '';
            if (border) border.style.transform = '';
        }
    }

    getLevelLabel(level, maxLevel) {
        const percentage = (level / maxLevel) * 100;
        if (percentage >= 80) return 'Experte';
        if (percentage >= 60) return 'Fortgeschritten';
        if (percentage >= 40) return 'Mittelstufe';
        return 'Grundkenntnisse';
    }

    animateLevelBars() {
        const levelBars = this.skillsContainer.querySelectorAll('.skill-level-fill');
        levelBars.forEach((bar, index) => {
            const targetWidth = bar.dataset.level;
            setTimeout(() => {
                bar.style.width = `${targetWidth}%`;
            }, index * 50);
        });
    }

    attachEventListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setActiveFilter(filter);
            });
        });
    }

    async setActiveFilter(filter) {
        if (this.currentFilter === filter) return;
        
        this.currentFilter = filter;

        // Button-States aktualisieren
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Smooth Transition
        if (this.skillsContainer) {
            this.skillsContainer.style.opacity = '0.5';
            this.skillsContainer.style.transform = 'translateY(20px)';
            this.skillsContainer.style.transition = 'opacity 0.3s, transform 0.3s';
        }

        // Skills neu rendern
        await this.renderSkills(filter);

        // Fade in
        setTimeout(() => {
            if (this.skillsContainer) {
                this.skillsContainer.style.opacity = '1';
                this.skillsContainer.style.transform = 'translateY(0)';
            }
        }, 100);
    }

    initScrollObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, options);

        // Beobachte alle Skill-Cards
        const cards = this.skillsContainer.querySelectorAll('.skill-card');
        cards.forEach(card => {
            this.observer.observe(card);
        });
    }

    showFallback() {
        if (this.skillsContainer) {
            this.skillsContainer.innerHTML = `
                <div class="skills-error">
                    <p>Skills konnten nicht geladen werden. Bitte Seite neu laden.</p>
                </div>
            `;
        }
    }
}

// Initialisierung wenn DOM bereit ist
document.addEventListener('DOMContentLoaded', () => {
    const skillsLoader = new SkillsLoader();
    skillsLoader.init();
    
    // Global verfügbar machen für Debugging
    window.skillsLoader = skillsLoader;
});

// Export für globale Verwendung
window.SkillsLoader = SkillsLoader;
