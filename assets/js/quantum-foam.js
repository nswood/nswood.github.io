/**
 * Quantum Foam Header Animation
 * Creates an animated grid header with random Gaussian peaks that grow and fade,
 * resembling quantum vacuum fluctuations.
 */

class QuantumFoamHeader {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 300; // Header height
        this.cellSize = 25;
        this.cols = 0;
        this.rows = 0;
        this.heights = [];
        this.gaussians = [];
        this.maxGaussians = 8;
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
        this.cols = Math.ceil(this.width / this.cellSize) + 1;
        this.rows = Math.ceil(this.height / this.cellSize) + 1;
        this.initHeightMap();
    }

    initHeightMap() {
        this.heights = [];
        for (let y = 0; y < this.rows; y++) {
            this.heights[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.heights[y][x] = 0;
            }
        }
    }

    gaussian(x, y, cx, cy, amplitude, sigma) {
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;
        return amplitude * Math.exp(-dist2 / (2 * sigma * sigma));
    }

    spawnGaussian() {
        if (this.gaussians.length >= this.maxGaussians) return;

        this.gaussians.push({
            x: Math.random() * this.cols,
            y: Math.random() * this.rows,
            amplitude: 0,
            maxAmplitude: 0.5 + Math.random() * 0.5,
            sigma: 1.2 + Math.random() * 1.2,
            phase: 0,
            speed: 0.004 + Math.random() * 0.004
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
                g.amplitude -= g.speed * g.maxAmplitude * 0.4;
                if (g.amplitude <= 0) {
                    this.gaussians.splice(i, 1);
                }
            }
        }

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let h = 0;
                for (const g of this.gaussians) {
                    h += this.gaussian(x, y, g.x, g.y, g.amplitude, g.sigma);
                }
                this.heights[y][x] = Math.min(h, 1);
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        const cs = this.cellSize;

        // Dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        const baseAlpha = 0.1;

        // Horizontal lines
        for (let y = 0; y < this.rows; y++) {
            ctx.beginPath();
            for (let x = 0; x < this.cols; x++) {
                const alpha = baseAlpha + this.heights[y][x] * 0.6;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.5 + this.heights[y][x] * 2.5;

                const px = x * cs;
                const py = y * cs;

                if (x === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Vertical lines
        for (let x = 0; x < this.cols; x++) {
            ctx.beginPath();
            for (let y = 0; y < this.rows; y++) {
                const alpha = baseAlpha + this.heights[y][x] * 0.6;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.5 + this.heights[y][x] * 2.5;

                const px = x * cs;
                const py = y * cs;

                if (y === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Glow effects
        for (const g of this.gaussians) {
            if (g.amplitude > 0.15) {
                const px = g.x * cs;
                const py = g.y * cs;
                const glowSize = g.sigma * cs * 2;

                const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
                gradient.addColorStop(0, `rgba(80, 180, 255, ${g.amplitude * 0.25})`);
                gradient.addColorStop(0.5, `rgba(60, 140, 200, ${g.amplitude * 0.12})`);
                gradient.addColorStop(1, 'rgba(60, 140, 200, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(px, py, glowSize, 0, Math.PI * 2);
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
