/**
 * Quantum Foam Header Animation
 * Creates a 3D perspective grid with random Gaussian peaks that grow and fade,
 * resembling quantum vacuum fluctuations.
 */

class QuantumFoamHeader {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;

        // 3D Grid settings
        this.gridWidth = 60;  // columns
        this.gridDepth = 20;  // rows going into distance
        this.heights = [];
        this.gaussians = [];
        this.maxGaussians = 6;
        this.animationId = null;

        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.initHeightMap();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initHeightMap();
    }

    initHeightMap() {
        this.heights = [];
        for (let z = 0; z < this.gridDepth; z++) {
            this.heights[z] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.heights[z][x] = 0;
            }
        }
    }

    gaussian(x, z, cx, cz, amplitude, sigma) {
        const dx = x - cx;
        const dz = z - cz;
        const dist2 = dx * dx + dz * dz;
        return amplitude * Math.exp(-dist2 / (2 * sigma * sigma));
    }

    spawnGaussian() {
        if (this.gaussians.length >= this.maxGaussians) return;

        this.gaussians.push({
            x: Math.random() * this.gridWidth,
            z: Math.random() * this.gridDepth,
            amplitude: 0,
            maxAmplitude: 60 + Math.random() * 50,
            sigma: 1.0 + Math.random() * 0.8,
            phase: 0,
            speed: 0.003 + Math.random() * 0.003
        });
    }

    updateGaussians() {
        if (Math.random() < 0.02) {
            this.spawnGaussian();
        }

        for (let i = this.gaussians.length - 1; i >= 0; i--) {
            const g = this.gaussians[i];

            if (g.phase === 0) {
                g.amplitude += g.speed * g.maxAmplitude;
                if (g.amplitude >= g.maxAmplitude) {
                    g.amplitude = g.maxAmplitude;
                    g.phase = 1;
                }
            } else {
                g.amplitude -= g.speed * g.maxAmplitude * 0.4;
                if (g.amplitude <= 0) {
                    this.gaussians.splice(i, 1);
                }
            }
        }

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

    // Project 3D point to 2D screen with perspective
    project(x, z, height) {
        const horizonY = this.height * 0.1;  // Horizon near top
        const baseY = this.height * 1.1;      // Grid starts below view

        // Depth ratio (0 = near/bottom, 1 = far/horizon)
        const depthRatio = z / this.gridDepth;

        // Y position with perspective
        const y = baseY + (horizonY - baseY) * depthRatio;

        // X position converges to center at horizon
        const centerX = this.width / 2;
        const cellWidth = this.width / this.gridWidth;
        const spreadFactor = 1 - depthRatio * 0.75;
        const screenX = centerX + (x - this.gridWidth / 2) * cellWidth * spreadFactor;

        // Height displacement (scaled by perspective)
        const heightScale = 1 - depthRatio * 0.85;
        const screenY = y - height * heightScale;

        return { x: screenX, y: screenY, depthRatio };
    }

    draw() {
        const ctx = this.ctx;

        // Dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw from back to front for proper overlap
        // Horizontal lines (going into distance)
        for (let z = this.gridDepth - 1; z >= 0; z--) {
            ctx.beginPath();

            for (let x = 0; x < this.gridWidth; x++) {
                const p = this.project(x, z, this.heights[z][x]);

                // Skip if outside view
                if (p.y < 0 || p.y > this.height) continue;

                const alpha = 0.15 + (1 - p.depthRatio) * 0.6;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.3 + (1 - p.depthRatio) * 1.8;

                if (x === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }

        // Vertical lines (across width, going into depth)
        for (let x = 0; x < this.gridWidth; x++) {
            ctx.beginPath();

            for (let z = 0; z < this.gridDepth; z++) {
                const p = this.project(x, z, this.heights[z][x]);

                if (p.y < 0 || p.y > this.height) continue;

                const alpha = 0.15 + (1 - p.depthRatio) * 0.6;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.3 + (1 - p.depthRatio) * 1.8;

                if (z === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }

        // Glow effects at peaks
        for (const g of this.gaussians) {
            if (g.amplitude > 10) {
                const p = this.project(g.x, g.z, g.amplitude);
                if (p.y < 0 || p.y > this.height) continue;

                const glowSize = g.amplitude * (1 - p.depthRatio * 0.6) * 1.5;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                gradient.addColorStop(0, `rgba(120, 200, 255, ${0.25 * g.amplitude / g.maxAmplitude})`);
                gradient.addColorStop(0.5, `rgba(80, 160, 220, ${0.12 * g.amplitude / g.maxAmplitude})`);
                gradient.addColorStop(1, 'rgba(60, 140, 200, 0)');

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
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('quantum-foam-header');
    if (container) {
        window.quantumFoam = new QuantumFoamHeader('quantum-foam-header');
    }
});
