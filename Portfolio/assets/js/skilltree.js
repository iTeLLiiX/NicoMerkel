// ============================================
// INTERACTIVE SKILL TREE - Weltklasse Design
// SVG Animationen, Interaktivität, Einzigartig
// ============================================

class SkillTree {
   constructor(container) {
      this.container = container;
      this.nodes = [];
      this.connections = [];
      this.mousePos = { x: 0, y: 0 };
      this.selectedNode = null;
      this.init();
   }

   init() {
      this.createSVG();
      this.setupNodes();
      this.setupConnections();
      this.setupInteractivity();
      this.animate();
   }

   createSVG() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('skilltree-svg');
      svg.setAttribute('viewBox', '0 0 1600 900');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '1';
      
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      
      // Gradient für Verbindungslinien
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', 'connectionGradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', 'rgba(97, 218, 251, 0.3)');
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '50%');
      stop2.setAttribute('stop-color', 'rgba(97, 218, 251, 0.8)');
      const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop3.setAttribute('offset', '100%');
      stop3.setAttribute('stop-color', 'rgba(97, 218, 251, 0.3)');
      
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      gradient.appendChild(stop3);
      defs.appendChild(gradient);
      
      // Glow Filter
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'glow');
      const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      feGaussianBlur.setAttribute('stdDeviation', '4');
      feGaussianBlur.setAttribute('result', 'coloredBlur');
      const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      feMergeNode1.setAttribute('in', 'coloredBlur');
      const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      feMergeNode2.setAttribute('in', 'SourceGraphic');
      feMerge.appendChild(feMergeNode1);
      feMerge.appendChild(feMergeNode2);
      filter.appendChild(feGaussianBlur);
      filter.appendChild(feMerge);
      defs.appendChild(filter);
      
      svg.appendChild(defs);
      this.svg = svg;
      this.container.appendChild(svg);
   }

   setupNodes() {
      const skillNodes = this.container.querySelectorAll('.skill-node');
      skillNodes.forEach((node, index) => {
         const rect = node.getBoundingClientRect();
         const containerRect = this.container.getBoundingClientRect();
         
         const nodeData = {
            element: node,
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
            index: index,
            category: node.getAttribute('data-category'),
            level: node.closest('.skilltree-level').classList.contains('skilltree-level-1') ? 1 :
                   node.closest('.skilltree-level').classList.contains('skilltree-level-2') ? 2 : 3
         };
         
         this.nodes.push(nodeData);
         
         // Interaktive Hover-Effekte
         node.addEventListener('mouseenter', () => this.onNodeEnter(nodeData));
         node.addEventListener('mouseleave', () => this.onNodeLeave(nodeData));
         node.addEventListener('mousemove', (e) => this.onNodeMove(e, nodeData));
      });
   }

   setupConnections() {
      // Verbindungen zwischen Levels
      for (let i = 0; i < this.nodes.length; i++) {
         const node = this.nodes[i];
         const nextLevelNodes = this.nodes.filter(n => n.level === node.level + 1);
         
         if (nextLevelNodes.length > 0) {
            // Verbinde mit nächstem Level (vereinfacht - verbindet mit allen)
            nextLevelNodes.forEach(targetNode => {
               this.createConnection(node, targetNode);
            });
         }
      }
   }

   createConnection(from, to) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('stroke', 'url(#connectionGradient)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('opacity', '0.3');
      line.setAttribute('class', 'connection-line');
      line.style.transition = 'all 0.3s ease';
      
      // Animation beim Erscheinen
      const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      
      setTimeout(() => {
         line.style.strokeDashoffset = '0';
      }, 500 + Math.random() * 500);
      
      this.svg.appendChild(line);
      this.connections.push({ line, from, to });
   }

   setupInteractivity() {
      // Mouse Tracking für Parallax
      this.container.addEventListener('mousemove', (e) => {
         const rect = this.container.getBoundingClientRect();
         this.mousePos.x = e.clientX - rect.left;
         this.mousePos.y = e.clientY - rect.top;
      });
   }

   onNodeEnter(nodeData) {
      this.selectedNode = nodeData;
      
      // Highlight Connections
      this.connections.forEach(conn => {
         if (conn.from === nodeData || conn.to === nodeData) {
            conn.line.setAttribute('opacity', '0.8');
            conn.line.setAttribute('stroke-width', '3');
            conn.line.setAttribute('filter', 'url(#glow)');
         }
      });
      
      // Scale Node
      nodeData.element.style.transform = 'scale(1.15)';
      nodeData.element.style.zIndex = '10';
   }

   onNodeLeave(nodeData) {
      this.selectedNode = null;
      
      // Reset Connections
      this.connections.forEach(conn => {
         conn.line.setAttribute('opacity', '0.3');
         conn.line.setAttribute('stroke-width', '2');
         conn.line.removeAttribute('filter');
      });
      
      // Reset Node
      nodeData.element.style.transform = 'scale(1)';
      nodeData.element.style.zIndex = '2';
   }

   onNodeMove(e, nodeData) {
      // Subtile Parallax-Bewegung
      const rect = nodeData.element.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      const x = e.clientX - containerRect.left - rect.left - rect.width / 2;
      const y = e.clientY - containerRect.top - rect.top - rect.height / 2;
      
      const moveX = x * 0.1;
      const moveY = y * 0.1;
      
      nodeData.element.style.transform = `scale(1.15) translate(${moveX}px, ${moveY}px)`;
   }

   animate() {
      // Subtile Pulsing Animation für aktive Nodes
      setInterval(() => {
         if (this.selectedNode) {
            const indicator = this.selectedNode.element.querySelector('.skill-level-indicator');
            if (indicator) {
               indicator.style.transform = 'scale(1.2)';
               setTimeout(() => {
                  indicator.style.transform = 'scale(1.1)';
               }, 300);
            }
         }
      }, 2000);
   }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
   const skilltreeContainer = document.querySelector('.skilltree-container');
   if (skilltreeContainer) {
      new SkillTree(skilltreeContainer);
   }
});


