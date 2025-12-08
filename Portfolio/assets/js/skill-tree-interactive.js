/**
 * Interactive Skill Tree - Canvas-basiert
 * Komplett fertiggestellt - 100%
 * Inspiriert von malaypatrav2.vercel.app
 */

class InteractiveSkillTree {
    constructor() {
        this.skillsData = null;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.skillItems = [];
        this.playMode = false;
        this.animationFrame = null;
        this.mousePos = { x: 0, y: 0 };
        this.hoveredSkill = null;
        this.dpr = window.devicePixelRatio || 1;
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

            // UI erstellen
            this.createUI();
            
            // Canvas initialisieren
            this.initCanvas();
            
            // Skills laden und rendern
            await this.loadSkills();
            this.arrangeSkills();
            
            // Event-Listener
            this.attachEventListeners();
            
            // Animation starten
            this.animate();
            
        } catch (error) {
            console.error('Fehler beim Initialisieren:', error);
            this.showFallback();
        }
    }

    createUI() {
        this.container.innerHTML = '';
        this.container.className = 'skill-tree-container';
        
        // Header mit Play Mode Switch
        const header = document.createElement('div');
        header.className = 'skill-tree-header';
        header.innerHTML = `
            <div class="play-mode-control">
                <span class="play-mode-label">Play mode</span>
                <label class="switch">
                    <input type="checkbox" id="play-mode-switch">
                    <span class="slider"></span>
                </label>
            </div>
            <p class="play-mode-hint" id="play-mode-hint" style="display: none;">
                Bewege deinen Cursor schnell über die Items, um die zufriedenstellende Farbanimation zu sehen.
            </p>
        `;
        this.container.appendChild(header);
        
        // Canvas Container
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'skills-canvas';
        canvasContainer.appendChild(this.canvas);
        this.container.appendChild(canvasContainer);
    }

    initCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        
        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = Math.min(width * 1.2, 900);
            
            this.canvas.width = width * this.dpr;
            this.canvas.height = height * this.dpr;
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            
            this.ctx = this.canvas.getContext('2d');
            if (this.ctx) {
                this.ctx.scale(this.dpr, this.dpr);
            }
            
            // Skills neu anordnen wenn Canvas-Größe sich ändert
            if (this.skillItems.length > 0) {
                this.arrangeSkills();
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    async loadSkills() {
        this.skillItems = [];
        
        for (const skill of this.skillsData.skills) {
            const item = {
                skill: skill,
                x: 0,
                y: 0,
                icon: null,
                iconLoaded: false,
                size: 48,
                baseSize: 45 + Math.random() * 15,
                rotation: Math.random() * 360,
                targetRotation: Math.random() * 360,
                opacity: 0.6 + Math.random() * 0.4,
                hoverScale: 1,
                color: null,
                isHovered: false,
                velocity: { x: 0, y: 0 }
            };
            
            // Icon laden
            await this.loadSkillIcon(item);
            
            this.skillItems.push(item);
        }
    }

    async loadSkillIcon(item) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                item.icon = img;
                item.iconLoaded = true;
                resolve();
            };
            
            img.onerror = () => {
                item.iconLoaded = true;
                item.icon = null;
                resolve();
            };
            
            img.src = item.skill.icon || 'assets/icons/default.svg';
        });
    }

    arrangeSkills() {
        if (!this.canvas || !this.ctx) return;
        
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;
        const padding = 80;
        const minDistance = 90;
        
        // Organische Anordnung - verstreute Positionen
        this.skillItems.forEach((item, index) => {
            let attempts = 0;
            let validPosition = false;
            
            while (!validPosition && attempts < 150) {
                // Zufällige Position mit Tendenz zur Mitte
                const angle = (index / this.skillItems.length) * Math.PI * 2;
                const radiusVariation = 0.2 + Math.random() * 0.5;
                const radius = radiusVariation * Math.min(width, height) / 2.5;
                const centerX = width / 2;
                const centerY = height / 2;
                
                item.x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 120;
                item.y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 120;
                
                // Prüfe Kollisionen
                validPosition = true;
                for (let i = 0; i < index; i++) {
                    const other = this.skillItems[i];
                    const distance = Math.sqrt(
                        Math.pow(item.x - other.x, 2) + Math.pow(item.y - other.y, 2)
                    );
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Prüfe Grenzen
                if (item.x < padding || item.x > width - padding ||
                    item.y < padding || item.y > height - padding) {
                    validPosition = false;
                }
                
                attempts++;
            }
            
            // Setze Größe
            item.size = item.baseSize;
        });
    }

    attachEventListeners() {
        // Play Mode Switch
        const switchElement = document.getElementById('play-mode-switch');
        if (switchElement) {
            switchElement.addEventListener('change', (e) => {
                this.togglePlayMode(e.target.checked);
            });
        }
        
        // Canvas Mouse Events
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
            this.canvas.addEventListener('click', (e) => this.handleClick(e));
        }
    }

    togglePlayMode(enabled) {
        this.playMode = enabled;
        const hint = document.getElementById('play-mode-hint');
        
        if (enabled) {
            hint.style.display = 'block';
        } else {
            hint.style.display = 'none';
            // Reset all colors
            this.skillItems.forEach(item => {
                item.color = null;
                item.isHovered = false;
                item.hoverScale = 1;
            });
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = (e.clientX - rect.left) * (this.canvas.width / this.dpr / rect.width);
        this.mousePos.y = (e.clientY - rect.top) * (this.canvas.height / this.dpr / rect.height);
        
        // Finde nächstes Skill-Item
        let closestItem = null;
        let minDistance = Infinity;
        
        this.skillItems.forEach(item => {
            const distance = Math.sqrt(
                Math.pow(this.mousePos.x - item.x, 2) + 
                Math.pow(this.mousePos.y - item.y, 2)
            );
            
            const hoverRadius = item.size * 1.5;
            if (distance < hoverRadius && distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });
        
        // Hover-Effekt
        if (closestItem !== this.hoveredSkill) {
            if (this.hoveredSkill) {
                this.hoveredSkill.isHovered = false;
                this.hoveredSkill.hoverScale = 1;
            }
            
            this.hoveredSkill = closestItem;
            
            if (closestItem) {
                closestItem.isHovered = true;
                
                if (this.playMode) {
                    // Zufällige Farbe für Play Mode
                    const colors = [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
                        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80',
                        '#EC7063', '#5DADE2', '#58D68D', '#F4D03F', '#AF7AC5',
                        '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'
                    ];
                    closestItem.color = colors[Math.floor(Math.random() * colors.length)];
                    closestItem.hoverScale = 1.4;
                    
                    // Nachbar-Items auch animieren
                    this.animateNeighbors(closestItem);
                } else {
                    closestItem.hoverScale = 1.25;
                }
            }
        }
    }

    animateNeighbors(centerItem) {
        this.skillItems.forEach(item => {
            if (item === centerItem) return;
            
            const distance = Math.sqrt(
                Math.pow(item.x - centerItem.x, 2) + 
                Math.pow(item.y - centerItem.y, 2)
            );
            
            if (distance < 180) {
                const intensity = 1 - (distance / 180);
                const colors = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
                    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80'
                ];
                item.color = colors[Math.floor(Math.random() * colors.length)];
                item.hoverScale = 1 + intensity * 0.15;
                
                // Nach kurzer Zeit zurücksetzen
                setTimeout(() => {
                    if (!item.isHovered) {
                        item.color = null;
                        item.hoverScale = 1;
                    }
                }, 250);
            }
        });
    }

    handleMouseLeave() {
        if (this.hoveredSkill) {
            this.hoveredSkill.isHovered = false;
            this.hoveredSkill.hoverScale = 1;
            this.hoveredSkill = null;
        }
        
        this.skillItems.forEach(item => {
            item.isHovered = false;
            if (!this.playMode) {
                item.color = null;
                item.hoverScale = 1;
            }
        });
    }

    handleClick(e) {
        if (this.hoveredSkill) {
            // Optional: Detail-Panel öffnen
            console.log('Clicked skill:', this.hoveredSkill.skill.name);
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;
        
        // Weißer Hintergrund
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, width, height);
        
        // Subtile Hintergrund-Punkte
        this.drawBackgroundDots();
        
        // Skills zeichnen
        this.skillItems.forEach(item => {
            this.drawSkillItem(item);
        });
    }

    drawBackgroundDots() {
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;
        
        // Kleine dunkle Punkte (wie in der Referenz)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 0.5 + Math.random() * 1.5;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawSkillItem(item) {
        if (!item.iconLoaded) return;
        
        const size = item.size * item.hoverScale;
        const x = item.x;
        const y = item.y;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate((item.rotation * Math.PI) / 180);
        
        // Farbfilter für Play Mode
        if (this.playMode && item.color) {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = item.color;
            this.ctx.globalAlpha = 0.25;
            this.ctx.fillRect(-size / 2 - 8, -size / 2 - 8, size + 16, size + 16);
            this.ctx.globalAlpha = 1;
        }
        
        // Icon zeichnen (in Graustufen)
        if (item.icon) {
            this.ctx.globalAlpha = item.isHovered ? 1 : item.opacity;
            
            // Icon zeichnen
            this.ctx.drawImage(
                item.icon,
                -size / 2,
                -size / 2,
                size,
                size
            );
            
            // Graustufen-Filter anwenden (nur wenn nicht im Play Mode mit Farbe)
            if (!this.playMode || !item.color) {
                try {
                    const imageData = this.ctx.getImageData(-size / 2, -size / 2, size, size);
                    const data = imageData.data;
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        data[i] = gray;     // R
                        data[i + 1] = gray; // G
                        data[i + 2] = gray; // B
                    }
                    
                    this.ctx.putImageData(imageData, -size / 2, -size / 2);
                } catch (e) {
                    // Ignore CORS errors
                }
            }
        } else {
            // Fallback: Text zeichnen
            this.ctx.globalAlpha = item.isHovered ? 1 : item.opacity;
            this.ctx.fillStyle = this.playMode && item.color ? item.color : 'rgba(0, 0, 0, 0.7)';
            this.ctx.font = `bold ${size * 0.4}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(item.skill.name.charAt(0), 0, 0);
        }
        
        // Hover-Glow
        if (item.isHovered) {
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = item.color || 'rgba(74, 144, 226, 0.6)';
        }
        
        this.ctx.restore();
    }

    animate() {
        // Smooth Animation für Hover-Scale
        this.skillItems.forEach(item => {
            const targetScale = item.isHovered ? item.hoverScale : 1;
            item.size += (item.baseSize * targetScale - item.size) * 0.15;
            
            // Rotation Animation
            if (item.isHovered) {
                item.targetRotation += 3;
            }
            item.rotation += (item.targetRotation - item.rotation) * 0.15;
        });
        
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    showFallback() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: rgba(28,29,32,0.6);">
                    <p>Skills konnten nicht geladen werden.</p>
                    <p style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.7;">
                        Bitte lade die Seite neu.
                    </p>
                </div>
            `;
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const skillTree = new InteractiveSkillTree();
    skillTree.init();
    window.interactiveSkillTree = skillTree;
});
