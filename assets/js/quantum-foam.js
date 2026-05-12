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

        this.gridWidth = 400;
        this.gridDepth = 70;
        this.frontBuffer = 10;
        this.maxGaussians = 50;

        this.heights = [];
        this.noise = [];
        this.gaussians = [];
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

        this.seedRandom();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    setConfig() {
        const isMobile = this.width < 768;

        if (isMobile) {
            this.gridWidth = 100;
            this.gridDepth = 50;
            this.maxGaussians = 15;
            this.frontBuffer = 4;
        } else {
            this.gridWidth = 150;
            this.gridDepth = 60;
            this.maxGaussians = 40;
            this.frontBuffer = 10;
        }
    }

    resize() {
        const prevWidth = this.width;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        const wasMobile = prevWidth < 768;
        const isMobile = this.width < 768;

        if (prevWidth === 0 || wasMobile !== isMobile) {
            this.setConfig();
            this.initHeightMap();
            this.initNoise();
            this.gaussians = [];
        } else {
            if (this.heights.length !== this.gridDepth || this.heights[0].length !== this.gridWidth) {
                this.initHeightMap();
                this.initNoise();
            }
        }
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
        this.noise = [];
        for (let z = 0; z < this.gridDepth; z++) {
            this.noise[z] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.noise[z][x] = (Math.random() - 0.5) * 0.2;
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

        const isMobile = this.width < 768;

        const baseAmplitude = 80 + Math.random() * 140;
        let baseSigma;
        if (isMobile) {
            baseSigma = 1.5 + Math.random() * 1.5;
        } else {
            baseSigma = 0.6 + Math.random() * 1.2;
        }

        const z = this.frontBuffer + Math.random() * (this.gridDepth - this.frontBuffer);
        const x = Math.random() * this.gridWidth;

        this.gaussians.push({
            x: x,
            z: z,
            amplitude: 0,
            maxAmplitude: baseAmplitude,
            sigma: baseSigma,
            phase: 0,
            speed: 0.01 + Math.random() * 0.02,
            noiseScale: 0.25 + Math.random() * 0.2
        });
    }

    // Pre-populate the scene so the first frame already looks alive.
    // Each seeded gaussian is placed at a random point in its lifecycle.
    seedRandom() {
        this.gaussians = [];
        const isMobile = this.width < 768;
        const seedCount = Math.floor(this.maxGaussians * 0.6);

        for (let i = 0; i < seedCount; i++) {
            const baseAmplitude = 80 + Math.random() * 140;
            const baseSigma = isMobile
                ? 1.5 + Math.random() * 1.5
                : 0.6 + Math.random() * 1.2;
            const speed = 0.01 + Math.random() * 0.02;

            const phase = Math.random() < 0.5 ? 0 : 1;
            const amplitude = phase === 0
                ? Math.random() * baseAmplitude
                : (0.3 + Math.random() * 0.7) * baseAmplitude;

            this.gaussians.push({
                x: Math.random() * this.gridWidth,
                z: this.frontBuffer + Math.random() * (this.gridDepth - this.frontBuffer),
                amplitude: amplitude,
                maxAmplitude: baseAmplitude,
                sigma: baseSigma,
                phase: phase,
                speed: speed,
                noiseScale: 0.25 + Math.random() * 0.2
            });
        }
    }

    updateGaussians() {
        if (Math.random() < 0.4) {
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

        for (let z = 0; z < this.gridDepth; z++) {
            for (let x = 0; x < this.gridWidth; x++) {
                let h = 0;
                for (const g of this.gaussians) {
                    const baseHeight = this.gaussian(x, z, g.x, g.z, g.amplitude, g.sigma);
                    const noiseAmount = baseHeight * this.noise[z][x] * g.noiseScale;
                    h += baseHeight + noiseAmount;
                }
                this.heights[z][x] = Math.max(0, h);
            }
        }
    }

    project(x, z, height) {
        const fov = 300;
        const horizonY = this.height * 0.1;
        const gridSpacingX = this.width / 30;
        const gridSpacingZ = 20;

        const depth = 50 + z * gridSpacingZ;
        const scale = fov / (fov + depth);

        const centerX = this.width / 2;
        const xOffset = (x - this.gridWidth / 2) * gridSpacingX * 0.8;

        const screenX = centerX + xOffset * scale;

        const floorY = 400;
        const screenY = horizonY + (floorY - height * 3) * scale;

        return { x: screenX, y: screenY, depthRatio: z / this.gridDepth };
    }

    draw() {
        const ctx = this.ctx;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        for (let z = this.gridDepth - 1; z >= 0; z--) {
            ctx.beginPath();

            for (let x = 0; x < this.gridWidth; x++) {
                const p = this.project(x, z, this.heights[z][x]);
                if (p.y < -50 || p.y > this.height + 50) continue;

                if (x === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }

            const depthRatio = z / this.gridDepth;
            const alpha = 0.12 + (1 - depthRatio) * 0.55;
            ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
            ctx.lineWidth = 0.3 + (1 - depthRatio) * 1.2;

            ctx.stroke();
        }

        for (let x = 0; x < this.gridWidth; x += 2) {
            ctx.beginPath();

            ctx.strokeStyle = `rgba(100, 180, 220, 0.3)`;
            ctx.lineWidth = 0.5;

            for (let z = 0; z < this.gridDepth; z++) {
                const p = this.project(x, z, this.heights[z][x]);
                if (p.y < -50 || p.y > this.height + 50) continue;

                if (z === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
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

function initQuantumFoam() {
    const container = document.getElementById('quantum-foam-header');
    if (!container) return;

    const existingCanvas = container.querySelector('canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }

    if (window.quantumFoam && window.quantumFoam.animationId) {
        cancelAnimationFrame(window.quantumFoam.animationId);
    }
    window.quantumFoam = null;

    window.quantumFoam = new QuantumFoamHeader('quantum-foam-header');
}

(function () {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initQuantumFoam, 0);
    } else {
        document.addEventListener('DOMContentLoaded', initQuantumFoam);
    }

    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            initQuantumFoam();
        }
    });
})();
