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

        // 3D Grid settings - higher resolution
        this.gridWidth = 140;  // Extra columns to extend past viewport edges
        this.gridDepth = 35;   // More rows going into distance
        this.frontBuffer = 3;  // No gaussians in first 3 rows
        this.heights = [];
        this.noise = [];       // Random noise for spikey effect
        this.gaussians = [];
        this.maxGaussians = 8;
        this.animationId = null;

        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: block;
            z-index: 1;
        `;
        this.container.insertBefore(this.canvas, this.container.firstChild);

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.initHeightMap();
        this.initNoise();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initHeightMap();
        this.initNoise();
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

    initNoise() {
        // Generate random noise for spikey effect
        this.noise = [];
        for (let z = 0; z < this.gridDepth; z++) {
            this.noise[z] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.noise[z][x] = (Math.random() - 0.5) * 0.4; // ±20% noise
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

        // More variation in parameters
        const baseAmplitude = 40 + Math.random() * 80;  // 40-120 range
        const baseSigma = 0.6 + Math.random() * 1.2;    // 0.6-1.8 range (narrow to medium)

        this.gaussians.push({
            x: Math.random() * this.gridWidth,
            z: this.frontBuffer + Math.random() * (this.gridDepth - this.frontBuffer), // Start after buffer
            amplitude: 0,
            maxAmplitude: baseAmplitude,
            sigma: baseSigma,
            phase: 0,
            speed: 0.002 + Math.random() * 0.003,
            noiseScale: 0.15 + Math.random() * 0.25  // Each gaussian has different noise intensity
        });
    }

    updateGaussians() {
        if (Math.random() < 0.025) {
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
                g.amplitude -= g.speed * g.maxAmplitude * 0.35;
                if (g.amplitude <= 0) {
                    this.gaussians.splice(i, 1);
                }
            }
        }

        // Calculate height map with noise
        for (let z = 0; z < this.gridDepth; z++) {
            for (let x = 0; x < this.gridWidth; x++) {
                let h = 0;
                for (const g of this.gaussians) {
                    const baseHeight = this.gaussian(x, z, g.x, g.z, g.amplitude, g.sigma);
                    // Add spikey noise proportional to the gaussian height
                    const noiseAmount = baseHeight * this.noise[z][x] * g.noiseScale;
                    h += baseHeight + noiseAmount;
                }
                this.heights[z][x] = Math.max(0, h);
            }
        }
    }

    project(x, z, height) {
        const horizonY = this.height * 0.08;
        const baseY = this.height * 1.15;

        const depthRatio = z / this.gridDepth;
        const y = baseY + (horizonY - baseY) * depthRatio;

        const centerX = this.width / 2;
        const cellWidth = (this.width * 2.5) / this.gridWidth; // 2.5x width for full coverage
        const spreadFactor = 1 - depthRatio * 0.55; // Less convergence to keep grid wide at horizon
        const screenX = centerX + (x - this.gridWidth / 2) * cellWidth * spreadFactor;

        const heightScale = 1 - depthRatio * 0.88;
        const screenY = y - height * heightScale;

        return { x: screenX, y: screenY, depthRatio };
    }

    draw() {
        const ctx = this.ctx;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw from back to front
        for (let z = this.gridDepth - 1; z >= 0; z--) {
            ctx.beginPath();

            for (let x = 0; x < this.gridWidth; x++) {
                const p = this.project(x, z, this.heights[z][x]);
                if (p.y < -50 || p.y > this.height + 50) continue;

                const alpha = 0.12 + (1 - p.depthRatio) * 0.55;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.3 + (1 - p.depthRatio) * 1.2;

                if (x === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        // Vertical lines
        for (let x = 0; x < this.gridWidth; x += 2) { // Every other line for performance
            ctx.beginPath();

            for (let z = 0; z < this.gridDepth; z++) {
                const p = this.project(x, z, this.heights[z][x]);
                if (p.y < -50 || p.y > this.height + 50) continue;

                const alpha = 0.12 + (1 - p.depthRatio) * 0.55;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.3 + (1 - p.depthRatio) * 1.2;

                if (z === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        // Glow effects
        for (const g of this.gaussians) {
            if (g.amplitude > 15) {
                const p = this.project(g.x, g.z, g.amplitude);
                if (p.y < -50 || p.y > this.height + 50) continue;

                const glowSize = g.amplitude * (1 - p.depthRatio * 0.6) * 1.2;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                gradient.addColorStop(0, `rgba(120, 200, 255, ${0.22 * g.amplitude / g.maxAmplitude})`);
                gradient.addColorStop(0.5, `rgba(80, 160, 220, ${0.1 * g.amplitude / g.maxAmplitude})`);
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

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('quantum-foam-header');
    if (container) {
        window.quantumFoam = new QuantumFoamHeader('quantum-foam-header');
    }
});
