/**
 * Skill Galaxy 3D - Einzigartiger, weltklassen Skill-Tree
 * Zeigt professionelle Webentwicklung-Fähigkeiten
 */

class SkillGalaxy3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.skillsData = null;
        this.nodes = [];
        this.connections = [];
        this.particles = null;
        this.raycaster = null;
        this.mouse = new THREE.Vector2();
        this.hoveredNode = null;
        this.animationId = null;
    }

    async init() {
        try {
            // Daten laden
            const response = await fetch('data/skills-data.json');
            if (!response.ok) throw new Error('Skills-Daten konnten nicht geladen werden');
            
            this.skillsData = await response.json();
            const container = document.getElementById('skills-container');
            
            if (!container) {
                console.error('Skills-Container nicht gefunden');
                return;
            }

            // Three.js Scene erstellen
            this.setupScene(container);
            
            // Skill-Nodes erstellen
            this.createSkillNodes();
            
            // Verbindungen erstellen
            this.createConnections();
            
            // Partikel-System
            this.createParticleSystem();
            
            // Lighting
            this.setupLighting();
            
            // Event-Listener
            this.attachEventListeners();
            
            // Animation Loop
            this.animate();
            
        } catch (error) {
            console.error('Fehler beim Initialisieren:', error);
            this.showFallback();
        }
    }

    setupScene(container) {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 100, 1000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 0, 500);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Controls (OrbitControls)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 200;
            this.controls.maxDistance = 1000;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
        }

        // Raycaster für Mouse-Interaktion
        this.raycaster = new THREE.Raycaster();

        // Resize Handler
        window.addEventListener('resize', () => this.handleResize(container));
    }

    createSkillNodes() {
        const categories = this.skillsData.categories;
        const skills = this.skillsData.skills;
        
        // Kategorien als Cluster organisieren
        const clusterRadius = 200;
        const nodeRadius = 50;
        
        categories.forEach((category, catIndex) => {
            const categorySkills = skills.filter(s => s.category === category.id);
            const clusterAngle = (catIndex / categories.length) * Math.PI * 2;
            const clusterX = Math.cos(clusterAngle) * clusterRadius;
            const clusterZ = Math.sin(clusterAngle) * clusterRadius;
            
            categorySkills.forEach((skill, skillIndex) => {
                const nodeAngle = (skillIndex / categorySkills.length) * Math.PI * 2;
                const nodeX = clusterX + Math.cos(nodeAngle) * nodeRadius;
                const nodeZ = clusterZ + Math.sin(nodeAngle) * nodeRadius;
                const nodeY = (Math.random() - 0.5) * 100;
                
                const node = this.createSkillNode(skill, nodeX, nodeY, nodeZ);
                this.nodes.push(node);
            });
        });
    }

    createSkillNode(skill, x, y, z) {
        // Geometrie
        const geometry = new THREE.SphereGeometry(15, 32, 32);
        
        // Material mit Glow-Effekt
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x444444,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { skill: skill, type: 'skill-node' };
        
        // Glow-Ring
        const glowGeometry = new THREE.RingGeometry(15, 20, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = Math.PI / 2;
        glow.position.copy(mesh.position);
        glow.userData = { parent: mesh };
        this.scene.add(glow);
        
        // Level-Ring (SVG-ähnlich als 3D)
        const levelPercentage = skill.level / skill.maxLevel;
        const levelGeometry = new THREE.RingGeometry(12, 14, 64);
        const levelMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const levelRing = new THREE.Mesh(levelGeometry, levelMaterial);
        levelRing.rotation.x = Math.PI / 2;
        levelRing.position.copy(mesh.position);
        levelRing.scale.y = levelPercentage;
        levelRing.userData = { parent: mesh, level: levelPercentage };
        this.scene.add(levelRing);
        
        // Sprite für Icon (Text)
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.name.substring(0, 2).toUpperCase(), 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(30, 30, 1);
        sprite.position.copy(mesh.position);
        sprite.position.y += 25;
        sprite.userData = { parent: mesh };
        this.scene.add(sprite);
        
        this.scene.add(mesh);
        
        return {
            mesh: mesh,
            glow: glow,
            levelRing: levelRing,
            sprite: sprite,
            skill: skill,
            position: new THREE.Vector3(x, y, z)
        };
    }

    createConnections() {
        // Verbindungen zwischen Skills derselben Kategorie
        const categoryGroups = {};
        this.nodes.forEach(node => {
            const category = node.skill.category;
            if (!categoryGroups[category]) {
                categoryGroups[category] = [];
            }
            categoryGroups[category].push(node);
        });
        
        Object.values(categoryGroups).forEach(group => {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    this.createConnection(group[i], group[j]);
                }
            }
        });
    }

    createConnection(node1, node2) {
        const points = [
            node1.position,
            node2.position
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            linewidth: 2
        });
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        
        this.connections.push({
            line: line,
            node1: node1,
            node2: node2
        });
    }

    createParticleSystem() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2000;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.6
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    setupLighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional Light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Point Lights für Glow
        this.nodes.forEach((node, index) => {
            const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
            pointLight.position.copy(node.position);
            pointLight.userData = { node: node };
            this.scene.add(pointLight);
        });
    }

    attachEventListeners() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e, canvas));
        canvas.addEventListener('click', (e) => this.onMouseClick(e, canvas));
    }

    onMouseMove(event, canvas) {
        this.mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.scene.children.filter(obj => obj.userData.type === 'skill-node')
        );
        
        if (intersects.length > 0) {
            const node = this.nodes.find(n => n.mesh === intersects[0].object);
            if (node && node !== this.hoveredNode) {
                this.hoverNode(node);
            }
        } else if (this.hoveredNode) {
            this.unhoverNode();
        }
    }

    onMouseClick(event, canvas) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.scene.children.filter(obj => obj.userData.type === 'skill-node')
        );
        
        if (intersects.length > 0) {
            const node = this.nodes.find(n => n.mesh === intersects[0].object);
            if (node) {
                this.showNodeDetails(node);
            }
        }
    }

    hoverNode(node) {
        if (this.hoveredNode) {
            this.unhoverNode();
        }
        
        this.hoveredNode = node;
        
        // Scale up
        node.mesh.scale.set(1.5, 1.5, 1.5);
        node.glow.scale.set(1.5, 1.5, 1.5);
        
        // Emissive erhöhen
        node.mesh.material.emissive.setHex(0x888888);
        
        // Auto-rotate stoppen
        if (this.controls) {
            this.controls.autoRotate = false;
        }
    }

    unhoverNode() {
        if (!this.hoveredNode) return;
        
        const node = this.hoveredNode;
        node.mesh.scale.set(1, 1, 1);
        node.glow.scale.set(1, 1, 1);
        node.mesh.material.emissive.setHex(0x444444);
        
        this.hoveredNode = null;
        
        // Auto-rotate wieder starten
        if (this.controls) {
            this.controls.autoRotate = true;
        }
    }

    showNodeDetails(node) {
        // Detail-Panel erstellen/anzeigen
        const detailPanel = document.getElementById('skill-detail-panel');
        if (detailPanel) {
            detailPanel.innerHTML = `
                <h3>${node.skill.name}</h3>
                <p>${node.skill.description}</p>
                <div class="skill-level-info">
                    <span>Level: ${node.skill.level}/${node.skill.maxLevel}</span>
                    ${node.skill.years ? `<span>Erfahrung: ${node.skill.years} ${node.skill.years === 1 ? 'Jahr' : 'Jahre'}</span>` : ''}
                </div>
            `;
            detailPanel.style.display = 'block';
            detailPanel.style.opacity = '0';
            setTimeout(() => {
                detailPanel.style.opacity = '1';
            }, 10);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Controls update
        if (this.controls) {
            this.controls.update();
        }
        
        // Nodes rotieren
        this.nodes.forEach(node => {
            node.mesh.rotation.y += 0.01;
            node.glow.rotation.z += 0.02;
        });
        
        // Particles animieren
        if (this.particles) {
            this.particles.rotation.y += 0.001;
        }
        
        // Connections animieren (optional: Partikel entlang Linien)
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }

    handleResize(container) {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    showFallback() {
        const container = document.getElementById('skills-container');
        if (container) {
            container.innerHTML = `
                <div class="skills-error">
                    <p>3D Skill-Tree konnte nicht geladen werden. Bitte Seite neu laden.</p>
                    <p style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.7;">
                        Falls das Problem besteht, wird automatisch auf die Standard-Ansicht umgeschaltet.
                    </p>
                </div>
            `;
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    // Prüfe ob Three.js geladen ist
    if (typeof THREE === 'undefined') {
        console.warn('Three.js nicht gefunden. Lade Fallback...');
        // Fallback zu Standard-System
        if (window.SkillsLoader) {
            const loader = new SkillsLoader();
            loader.init();
        }
        return;
    }
    
    const skillGalaxy = new SkillGalaxy3D();
    skillGalaxy.init();
    window.skillGalaxy3D = skillGalaxy;
});




