/**
 * Quantum Foam Background Animation
 * Creates an animated grid with random Gaussian peaks that grow and fade,
 * resembling quantum vacuum fluctuations.
 */

class QuantumFoam {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.cellSize = 30; // Grid cell size in pixels
        this.cols = 0;
        this.rows = 0;
        this.heights = [];
        this.gaussians = [];
        this.maxGaussians = 12;
        this.animationId = null;

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
        this.cols = Math.ceil(this.width / this.cellSize) + 1;
        this.rows = Math.ceil(this.height / this.cellSize) + 1;
        this.initHeightMap();
    }

    initHeightMap() {
        // Create 2D array for heights
        this.heights = [];
        for (let y = 0; y < this.rows; y++) {
            this.heights[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.heights[y][x] = 0;
            }
        }
    }

    // Gaussian function
    gaussian(x, y, cx, cy, amplitude, sigma) {
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;
        return amplitude * Math.exp(-dist2 / (2 * sigma * sigma));
    }

    // Spawn a new Gaussian fluctuation
    spawnGaussian() {
        if (this.gaussians.length >= this.maxGaussians) return;

        this.gaussians.push({
            x: Math.random() * this.cols,
            y: Math.random() * this.rows,
            amplitude: 0,
            maxAmplitude: 0.6 + Math.random() * 0.4, // Opacity-based amplitude
            sigma: 1.5 + Math.random() * 1.5,
            phase: 0, // 0 = growing, 1 = fading
            speed: 0.003 + Math.random() * 0.004
        });
    }

    // Update Gaussian fluctuations
    updateGaussians() {
        // Randomly spawn new ones
        if (Math.random() < 0.02) {
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
                g.amplitude -= g.speed * g.maxAmplitude * 0.5;
                if (g.amplitude <= 0) {
                    this.gaussians.splice(i, 1);
                }
            }
        }

        // Calculate height map from all Gaussians
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let h = 0;
                for (const g of this.gaussians) {
                    h += this.gaussian(x, y, g.x, g.y, g.amplitude, g.sigma);
                }
                this.heights[y][x] = Math.min(h, 1); // Cap at 1
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        const cs = this.cellSize;

        // Clear with dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        // Base grid color (subtle)
        const baseAlpha = 0.08;

        // Draw horizontal lines
        for (let y = 0; y < this.rows; y++) {
            ctx.beginPath();
            for (let x = 0; x < this.cols; x++) {
                const alpha = baseAlpha + this.heights[y][x] * 0.5;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.5 + this.heights[y][x] * 2;

                const px = x * cs;
                const py = y * cs;

                if (x === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }

        // Draw vertical lines
        for (let x = 0; x < this.cols; x++) {
            ctx.beginPath();
            for (let y = 0; y < this.rows; y++) {
                const alpha = baseAlpha + this.heights[y][x] * 0.5;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.5 + this.heights[y][x] * 2;

                const px = x * cs;
                const py = y * cs;

                if (y === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }

        // Draw glow spots at Gaussian centers
        for (const g of this.gaussians) {
            if (g.amplitude > 0.1) {
                const px = g.x * cs;
                const py = g.y * cs;
                const glowSize = g.sigma * cs * 1.5;

                const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
                gradient.addColorStop(0, `rgba(80, 180, 255, ${g.amplitude * 0.2})`);
                gradient.addColorStop(0.5, `rgba(60, 140, 200, ${g.amplitude * 0.1})`);
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
    window.quantumFoam = new QuantumFoam();
});
