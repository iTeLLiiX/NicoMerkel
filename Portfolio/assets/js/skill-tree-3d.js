/**
 * Skill Tree 3D - Einzigartiges, weltklassen Design
 * Interaktiver Skill-Tree mit Partikeln, Animationen und 3D-Effekten
 */

class SkillTree3D {
    constructor() {
        this.skillsData = null;
        this.container = null;
        this.nodes = [];
        this.connections = [];
        this.particles = null;
        this.currentHover = null;
        this.animationFrame = null;
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

            // Container vorbereiten
            this.setupContainer();
            
            // Skill-Tree erstellen
            this.createSkillTree();
            
            // Event-Listener
            this.attachEventListeners();
            
            // Animation Loop starten
            this.startAnimationLoop();
            
        } catch (error) {
            console.error('Fehler beim Initialisieren:', error);
            this.showFallback();
        }
    }

    setupContainer() {
        this.container.innerHTML = '';
        this.container.className = 'skill-tree-3d-container';
        
        // SVG für Verbindungslinien
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.className = 'skill-tree-connections';
        svg.setAttribute('viewBox', '0 0 1000 1000');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        this.container.appendChild(svg);
        this.svg = svg;

        // Nodes Container
        const nodesContainer = document.createElement('div');
        nodesContainer.className = 'skill-tree-nodes';
        this.container.appendChild(nodesContainer);
        this.nodesContainer = nodesContainer;
    }

    createSkillTree() {
        // Kategorien als Cluster organisieren
        const clusters = this.organizeClusters();
        
        // Nodes für jede Kategorie erstellen
        clusters.forEach((cluster, clusterIndex) => {
            const categorySkills = this.skillsData.skills.filter(
                skill => skill.category === cluster.categoryId
            );
            
            categorySkills.forEach((skill, skillIndex) => {
                const node = this.createSkillNode(skill, cluster, skillIndex, categorySkills.length);
                this.nodes.push(node);
                this.nodesContainer.appendChild(node.element);
            });
        });

        // Verbindungen erstellen
        this.createConnections();
        
        // Initial Animation
        this.animateNodesIn();
    }

    organizeClusters() {
        // Radiales Layout: Kategorien in einem Kreis
        const categories = this.skillsData.categories;
        const centerX = 500;
        const centerY = 500;
        const radius = 300;
        
        return categories.map((category, index) => {
            const angle = (index / categories.length) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            return {
                categoryId: category.id,
                categoryName: category.name,
                centerX: x,
                centerY: y,
                angle: angle
            };
        });
    }

    createSkillNode(skill, cluster, index, total) {
        const node = document.createElement('div');
        node.className = 'skill-node-3d';
        node.dataset.skillId = skill.id;
        node.dataset.category = skill.category;
        
        // Position berechnen (Kreis um Cluster-Zentrum)
        const nodeRadius = 80;
        const nodeAngle = (index / total) * Math.PI * 2;
        const x = cluster.centerX + Math.cos(nodeAngle) * nodeRadius;
        const y = cluster.centerY + Math.sin(nodeAngle) * nodeRadius;
        
        // Level-Berechnung
        const levelPercentage = (skill.level / skill.maxLevel) * 100;
        const levelLabel = this.getLevelLabel(skill.level, skill.maxLevel);
        
        node.innerHTML = `
            <div class="node-glow"></div>
            <div class="node-content">
                <div class="node-icon-wrapper">
                    <img src="${skill.icon}" alt="${skill.name}" class="node-icon" loading="lazy" />
                    <div class="node-level-ring">
                        <svg class="level-ring-svg" viewBox="0 0 100 100">
                            <circle class="level-ring-bg" cx="50" cy="50" r="45" />
                            <circle class="level-ring-fill" cx="50" cy="50" r="45" 
                                    data-level="${levelPercentage}" />
                        </svg>
                        <span class="node-level-text">${skill.level}</span>
                    </div>
                </div>
                <div class="node-info">
                    <h6 class="node-name">${skill.name}</h6>
                    <span class="node-level-label">${levelLabel}</span>
                </div>
            </div>
            <div class="node-detail-panel">
                <h6>${skill.name}</h6>
                <p>${skill.description}</p>
                ${skill.years ? `<span class="node-years">${skill.years} ${skill.years === 1 ? 'Jahr' : 'Jahre'} Erfahrung</span>` : ''}
            </div>
        `;
        
        // Position setzen
        node.style.setProperty('--x', `${x}px`);
        node.style.setProperty('--y', `${y}px`);
        
        // Node-Objekt erstellen
        const nodeObj = {
            element: node,
            skill: skill,
            x: x,
            y: y,
            cluster: cluster,
            connections: []
        };
        
        return nodeObj;
    }

    createConnections() {
        // Verbindungen zwischen verwandten Skills erstellen
        this.nodes.forEach((node, i) => {
            this.nodes.slice(i + 1).forEach(otherNode => {
                // Verbinde Skills derselben Kategorie
                if (node.skill.category === otherNode.skill.category) {
                    this.createConnection(node, otherNode);
                }
            });
        });
    }

    createConnection(node1, node2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node1.x);
        line.setAttribute('y1', node1.y);
        line.setAttribute('x2', node2.x);
        line.setAttribute('y2', node2.y);
        line.className = 'skill-connection';
        
        // Gradient für Linie
        const defs = this.svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        if (!this.svg.querySelector('defs')) {
            this.svg.appendChild(defs);
        }
        
        const gradientId = `gradient-${node1.skill.id}-${node2.skill.id}`;
        let gradient = this.svg.querySelector(`#${gradientId}`);
        
        if (!gradient) {
            gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '0%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', 'rgba(255, 255, 255, 0.3)');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '50%');
            stop2.setAttribute('stop-color', 'rgba(255, 255, 255, 0.6)');
            
            const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop3.setAttribute('offset', '100%');
            stop3.setAttribute('stop-color', 'rgba(255, 255, 255, 0.3)');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            gradient.appendChild(stop3);
            defs.appendChild(gradient);
        }
        
        line.setAttribute('stroke', `url(#${gradientId})`);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '5,5');
        line.style.opacity = '0';
        line.style.transition = 'opacity 0.6s';
        
        this.svg.appendChild(line);
        
        // Connection-Objekt
        const connection = {
            line: line,
            node1: node1,
            node2: node2
        };
        
        node1.connections.push(connection);
        node2.connections.push(connection);
        this.connections.push(connection);
        
        // Animation
        setTimeout(() => {
            line.style.opacity = '0.4';
        }, Math.random() * 500);
    }

    animateNodesIn() {
        this.nodes.forEach((node, index) => {
            node.element.style.opacity = '0';
            node.element.style.transform = 'scale(0) rotate(180deg)';
            
            setTimeout(() => {
                node.element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                node.element.style.opacity = '1';
                node.element.style.transform = 'scale(1) rotate(0deg)';
            }, index * 50);
        });
    }

    attachEventListeners() {
        this.nodes.forEach(node => {
            const element = node.element;
            
            element.addEventListener('mouseenter', () => this.handleNodeHover(node, true));
            element.addEventListener('mouseleave', () => this.handleNodeHover(node, false));
            element.addEventListener('click', () => this.handleNodeClick(node));
        });
    }

    handleNodeHover(node, isEntering) {
        if (isEntering) {
            this.currentHover = node;
            node.element.classList.add('hovered');
            
            // Verbindungen hervorheben
            node.connections.forEach(conn => {
                conn.line.style.opacity = '0.8';
                conn.line.style.strokeWidth = '2.5';
            });
            
            // Detail-Panel zeigen
            const detailPanel = node.element.querySelector('.node-detail-panel');
            if (detailPanel) {
                detailPanel.style.display = 'block';
            }
            
        } else {
            node.element.classList.remove('hovered');
            
            // Verbindungen zurücksetzen
            node.connections.forEach(conn => {
                conn.line.style.opacity = '0.4';
                conn.line.style.strokeWidth = '1.5';
            });
            
            // Detail-Panel verstecken
            const detailPanel = node.element.querySelector('.node-detail-panel');
            if (detailPanel) {
                detailPanel.style.display = 'none';
            }
            
            this.currentHover = null;
        }
    }

    handleNodeClick(node) {
        // Zoom auf Node
        this.zoomToNode(node);
    }

    zoomToNode(node) {
        // Center Node im Viewport
        const containerRect = this.container.getBoundingClientRect();
        const nodeRect = node.element.getBoundingClientRect();
        
        const scrollX = nodeRect.left - containerRect.left - containerRect.width / 2 + nodeRect.width / 2;
        const scrollY = nodeRect.top - containerRect.top - containerRect.height / 2 + nodeRect.height / 2;
        
        this.container.scrollTo({
            left: scrollX,
            top: scrollY,
            behavior: 'smooth'
        });
    }

    startAnimationLoop() {
        const animate = () => {
            // Animierte Verbindungslinien
            this.connections.forEach(conn => {
                const dashOffset = parseFloat(conn.line.style.strokeDashoffset || 0);
                conn.line.style.strokeDashoffset = (dashOffset - 0.5) % 10;
            });
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    getLevelLabel(level, maxLevel) {
        const percentage = (level / maxLevel) * 100;
        if (percentage >= 80) return 'Experte';
        if (percentage >= 60) return 'Fortgeschritten';
        if (percentage >= 40) return 'Mittelstufe';
        return 'Grundkenntnisse';
    }

    showFallback() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="skills-error">
                    <p>Skill-Tree konnte nicht geladen werden. Bitte Seite neu laden.</p>
                </div>
            `;
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const skillTree = new SkillTree3D();
    skillTree.init();
    window.skillTree3D = skillTree;
});




