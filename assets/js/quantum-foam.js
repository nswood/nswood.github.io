/**
 * Quantum Foam Background Animation
 * Creates an animated 3D grid with random Gaussian peaks that grow and fade,
 * resembling quantum vacuum fluctuations.
 */

class QuantumFoam {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.gridSize = 40; // Number of grid cells
        this.cellSize = 0;
        this.heights = [];
        this.gaussians = [];
        this.maxGaussians = 8;
        this.animationId = null;

        // Perspective settings
        this.vanishingPointY = 0.15; // Where horizon sits (0-1 from top)
        this.gridDepth = 25; // How many rows going into distance
        this.gridWidth = 50; // How many columns

        this.init();
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'quantum-foam-bg';
        this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      opacity: 0.4;
    `;
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Initialize height map
        this.initHeightMap();

        // Start animation
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.cellSize = this.width / this.gridWidth;
    }

    initHeightMap() {
        // Create 2D array for heights
        this.heights = [];
        for (let z = 0; z < this.gridDepth; z++) {
            this.heights[z] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.heights[z][x] = 0;
            }
        }
    }

    // Gaussian function
    gaussian(x, z, cx, cz, amplitude, sigma) {
        const dx = x - cx;
        const dz = z - cz;
        const dist2 = dx * dx + dz * dz;
        return amplitude * Math.exp(-dist2 / (2 * sigma * sigma));
    }

    // Spawn a new Gaussian fluctuation
    spawnGaussian() {
        if (this.gaussians.length >= this.maxGaussians) return;

        this.gaussians.push({
            x: Math.random() * this.gridWidth,
            z: Math.random() * this.gridDepth,
            amplitude: 0,
            maxAmplitude: 80 + Math.random() * 60,
            sigma: 2 + Math.random() * 3,
            phase: 0, // 0 = growing, 1 = fading
            speed: 0.005 + Math.random() * 0.01
        });
    }

    // Update Gaussian fluctuations
    updateGaussians() {
        // Randomly spawn new ones
        if (Math.random() < 0.03) {
            this.spawnGaussian();
        }

        // Update existing Gaussians
        for (let i = this.gaussians.length - 1; i >= 0; i--) {
            const g = this.gaussians[i];

            if (g.phase === 0) {
                // Growing
                g.amplitude += g.speed * g.maxAmplitude;
                if (g.amplitude >= g.maxAmplitude) {
                    g.amplitude = g.maxAmplitude;
                    g.phase = 1;
                }
            } else {
                // Fading
                g.amplitude -= g.speed * g.maxAmplitude * 0.7;
                if (g.amplitude <= 0) {
                    this.gaussians.splice(i, 1);
                }
            }
        }

        // Calculate height map from all Gaussians
        for (let z = 0; z < this.gridDepth; z++) {
            for (let x = 0; x < this.gridWidth; x++) {
                let h = 0;
                for (const g of this.gaussians) {
                    h += this.gaussian(x, z, g.x, g.z, g.amplitude, g.sigma);
                }
                this.heights[z][x] = h;
            }
        }
    }

    // Project 3D point to 2D screen coordinates
    project(x, z, height) {
        const horizonY = this.height * this.vanishingPointY;
        const baseY = this.height * 0.95; // Bottom of grid

        // Depth factor (0 = near, 1 = far)
        const depthRatio = z / this.gridDepth;

        // Y position based on depth (perspective)
        const y = baseY + (horizonY - baseY) * depthRatio;

        // X position (converge to center at horizon)
        const centerX = this.width / 2;
        const spreadFactor = 1 - depthRatio * 0.7;
        const screenX = centerX + (x - this.gridWidth / 2) * this.cellSize * spreadFactor;

        // Height displacement (scaled by perspective)
        const heightScale = (1 - depthRatio * 0.8);
        const screenY = y - height * heightScale;

        return { x: screenX, y: screenY, depthRatio };
    }

    draw() {
        const ctx = this.ctx;

        // Clear with dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid lines (back to front for proper overlap)
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.6)';
        ctx.lineWidth = 1;

        // Draw horizontal lines (going into distance)
        for (let z = 0; z < this.gridDepth - 1; z++) {
            ctx.beginPath();

            for (let x = 0; x < this.gridWidth; x++) {
                const p = this.project(x, z, this.heights[z][x]);

                // Fade lines in distance
                const alpha = 0.15 + (1 - p.depthRatio) * 0.5;
                ctx.strokeStyle = `rgba(120, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.5 + (1 - p.depthRatio) * 1.5;

                if (x === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }

        // Draw vertical lines (across width)
        for (let x = 0; x < this.gridWidth; x++) {
            ctx.beginPath();

            for (let z = 0; z < this.gridDepth; z++) {
                const p = this.project(x, z, this.heights[z][x]);

                const alpha = 0.15 + (1 - p.depthRatio) * 0.5;
                ctx.strokeStyle = `rgba(120, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.5 + (1 - p.depthRatio) * 1.5;

                if (z === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }

        // Draw glow effect on peaks
        for (const g of this.gaussians) {
            if (g.amplitude > 5) {
                const p = this.project(g.x, g.z, g.amplitude);
                const glowSize = g.amplitude * (1 - p.depthRatio * 0.5) * 2;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                gradient.addColorStop(0, `rgba(100, 200, 255, ${g.amplitude / g.maxAmplitude * 0.3})`);
                gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    animate() {
        this.updateGaussians();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if dark theme is active
    window.quantumFoam = new QuantumFoam();
});
