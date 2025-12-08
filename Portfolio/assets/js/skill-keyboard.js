/**
 * Skill Keyboard - Einzigartige interaktive Tastatur
 * Jede Taste = Ein Skill mit Hover-Animationen
 */

class SkillKeyboard {
    constructor() {
        this.skillsData = null;
        this.container = null;
        this.keys = [];
        this.activeKey = null;
        this.keyboardLayout = null;
    }

    async init() {
        try {
            // Daten laden
            const response = await fetch('data/skills-data.json');
            if (!response.ok) throw new Error('Skills-Daten konnten nicht geladen werden');
            
            this.skillsData = await response.json();
            this.container = document.getElementById('skills-container');
            
            if (!this.container) {
                console.error('Skills-Container nicht gefunden');
                return;
            }

            // Keyboard Layout erstellen
            this.createKeyboardLayout();
            
            // Tastatur rendern
            this.renderKeyboard();
            
            // Event-Listener
            this.attachEventListeners();
            
        } catch (error) {
            console.error('Fehler beim Initialisieren:', error);
            this.showFallback();
        }
    }

    createKeyboardLayout() {
        // Organisiere Skills nach Kategorien für Keyboard-Layout
        const categories = this.skillsData.categories;
        const skills = this.skillsData.skills;
        
        // Erstelle Layout: Jede Zeile = eine Kategorie (oder gemischt)
        const layout = [];
        
        // Zeile 1: Frontend Skills
        const frontend = skills.filter(s => s.category === 'frontend');
        layout.push(frontend.map(s => s.name));
        
        // Zeile 2: Backend & Database
        const backend = skills.filter(s => s.category === 'backend');
        const database = skills.filter(s => s.category === 'database');
        layout.push([...backend, ...database].map(s => s.name));
        
        // Zeile 3: Tools & Methodology
        const tools = skills.filter(s => s.category === 'tools');
        const methodology = skills.filter(s => s.category === 'methodology');
        layout.push([...tools, ...methodology].map(s => s.name));
        
        this.keyboardLayout = layout;
    }

    renderKeyboard() {
        this.container.innerHTML = '';
        this.container.className = 'skill-keyboard-container';
        
        const keyboard = document.createElement('div');
        keyboard.className = 'skill-keyboard';
        
        this.keyboardLayout.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            row.forEach((skillName, keyIndex) => {
                if (!skillName) {
                    // Leere Taste für Spacing
                    const spacer = document.createElement('div');
                    spacer.className = 'key-spacer';
                    rowElement.appendChild(spacer);
                    return;
                }
                
                // Direkte Suche nach Skill-Name
                const skill = this.skillsData.skills.find(s => s.name === skillName);
                
                if (skill) {
                    const key = this.createKey(skill, rowIndex, keyIndex);
                    this.keys.push(key);
                    rowElement.appendChild(key.element);
                }
            });
            
            keyboard.appendChild(rowElement);
        });
        
        this.container.appendChild(keyboard);
        
        // Detail Panel
        const detailPanel = document.createElement('div');
        detailPanel.id = 'skill-key-detail';
        detailPanel.className = 'skill-key-detail-panel';
        this.container.appendChild(detailPanel);
        
        // Initial Animation
        this.animateKeysIn();
    }

    createKey(skill, rowIndex, keyIndex) {
        const key = document.createElement('div');
        key.className = 'skill-key';
        key.dataset.skillId = skill.id;
        key.dataset.row = rowIndex;
        key.dataset.index = keyIndex;
        
        const levelPercentage = (skill.level / skill.maxLevel) * 100;
        const levelLabel = this.getLevelLabel(skill.level, skill.maxLevel);
        
        // Key-Stil basierend auf Kategorie
        const categoryColors = {
            'frontend': '#4A90E2',
            'backend': '#E94B3C',
            'database': '#F5A623',
            'tools': '#7ED321',
            'methodology': '#BD10E0'
        };
        const keyColor = categoryColors[skill.category] || '#ffffff';
        
        key.innerHTML = `
            <div class="key-content">
                <div class="key-icon">
                    <img src="${skill.icon}" alt="${skill.name}" class="key-icon-img" loading="lazy" />
                </div>
                <div class="key-label">${skill.name}</div>
                <div class="key-level">
                    <div class="key-level-fill" data-level="${levelPercentage}" style="width: 0%"></div>
                </div>
            </div>
            <div class="key-glow"></div>
        `;
        
        key.style.setProperty('--key-color', keyColor);
        
        const keyObj = {
            element: key,
            skill: skill,
            row: rowIndex,
            index: keyIndex,
            isPressed: false
        };
        
        return keyObj;
    }

    attachEventListeners() {
        this.keys.forEach(key => {
            const element = key.element;
            
            element.addEventListener('mouseenter', () => this.handleKeyHover(key, true));
            element.addEventListener('mouseleave', () => this.handleKeyHover(key, false));
            element.addEventListener('mousedown', () => this.handleKeyPress(key, true));
            element.addEventListener('mouseup', () => this.handleKeyPress(key, false));
            element.addEventListener('click', () => this.handleKeyClick(key));
        });
        
        // Keyboard Events (echte Tastatur)
        document.addEventListener('keydown', (e) => this.handleKeyboardKey(e, true));
        document.addEventListener('keyup', (e) => this.handleKeyboardKey(e, false));
    }

    handleKeyHover(key, isEntering) {
        if (isEntering) {
            this.activeKey = key;
            key.element.classList.add('hovered');
            
            // Nachbar-Tasten leicht bewegen
            this.affectNeighborKeys(key, true);
            
            // Detail Panel zeigen
            this.showKeyDetails(key);
            
        } else {
            key.element.classList.remove('hovered');
            this.affectNeighborKeys(key, false);
            this.activeKey = null;
            this.hideKeyDetails();
        }
    }

    affectNeighborKeys(key, isEntering) {
        const neighbors = this.keys.filter(k => {
            const rowDiff = Math.abs(k.row - key.row);
            const indexDiff = Math.abs(k.index - key.index);
            return (rowDiff <= 1 && indexDiff <= 2) && k !== key;
        });
        
        neighbors.forEach((neighbor, index) => {
            const delay = index * 20;
            setTimeout(() => {
                if (isEntering) {
                    neighbor.element.style.transform = 'translateY(-4px) translateZ(5px)';
                    neighbor.element.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                } else {
                    neighbor.element.style.transform = '';
                }
            }, delay);
        });
    }

    handleKeyPress(key, isPressing) {
        if (isPressing) {
            key.isPressed = true;
            key.element.classList.add('pressed');
            key.element.style.transform = 'translateY(8px) scale(0.95)';
        } else {
            key.isPressed = false;
            key.element.classList.remove('pressed');
            if (key.element.classList.contains('hovered')) {
                key.element.style.transform = 'translateY(-10px) scale(1.1)';
            } else {
                key.element.style.transform = '';
            }
        }
    }

    handleKeyClick(key) {
        // Ripple Effect
        const ripple = document.createElement('div');
        ripple.className = 'key-ripple';
        key.element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Detail Panel fokussieren
        this.showKeyDetails(key, true);
    }

    handleKeyboardKey(event, isDown) {
        // Mappe echte Tastatur-Tasten auf Skills (optional)
        // z.B. 'Q' = erster Skill, 'W' = zweiter Skill, etc.
    }

    showKeyDetails(key, focus = false) {
        const detailPanel = document.getElementById('skill-key-detail');
        if (!detailPanel) return;
        
        const skill = key.skill;
        const levelPercentage = (skill.level / skill.maxLevel) * 100;
        
        detailPanel.innerHTML = `
            <div class="detail-header">
                <img src="${skill.icon}" alt="${skill.name}" class="detail-icon" />
                <div>
                    <h3>${skill.name}</h3>
                    <span class="detail-category">${this.getCategoryName(skill.category)}</span>
                </div>
            </div>
            <p class="detail-description">${skill.description}</p>
            <div class="detail-stats">
                <div class="detail-stat">
                    <span class="stat-label">Level</span>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: ${levelPercentage}%"></div>
                    </div>
                    <span class="stat-value">${skill.level}/${skill.maxLevel} - ${this.getLevelLabel(skill.level, skill.maxLevel)}</span>
                </div>
                ${skill.years ? `
                <div class="detail-stat">
                    <span class="stat-label">Erfahrung</span>
                    <span class="stat-value">${skill.years} ${skill.years === 1 ? 'Jahr' : 'Jahre'}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        detailPanel.style.display = 'block';
        detailPanel.style.opacity = '0';
        
        setTimeout(() => {
            detailPanel.style.opacity = '1';
            if (focus) {
                detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 10);
    }

    hideKeyDetails() {
        const detailPanel = document.getElementById('skill-key-detail');
        if (detailPanel) {
            detailPanel.style.opacity = '0';
            setTimeout(() => {
                detailPanel.style.display = 'none';
            }, 300);
        }
    }

    getCategoryName(categoryId) {
        const category = this.skillsData.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    getLevelLabel(level, maxLevel) {
        const percentage = (level / maxLevel) * 100;
        if (percentage >= 80) return 'Experte';
        if (percentage >= 60) return 'Fortgeschritten';
        if (percentage >= 40) return 'Mittelstufe';
        return 'Grundkenntnisse';
    }

    animateKeysIn() {
        this.keys.forEach((key, index) => {
            key.element.style.opacity = '0';
            key.element.style.transform = 'translateY(30px) scale(0.8)';
            
            setTimeout(() => {
                key.element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                key.element.style.opacity = '1';
                key.element.style.transform = 'translateY(0) scale(1)';
            }, index * 40);
        });
        
        // Level-Bars animieren
        setTimeout(() => {
            this.keys.forEach(key => {
                const levelFill = key.element.querySelector('.key-level-fill');
                if (levelFill) {
                    const level = levelFill.dataset.level;
                    levelFill.style.width = `${level}%`;
                }
            });
        }, this.keys.length * 40 + 300);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const skillKeyboard = new SkillKeyboard();
    skillKeyboard.init();
    window.skillKeyboard = skillKeyboard;
});

