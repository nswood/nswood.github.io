/**
 * Quantum Foam Header Animation
 * Creates a 3D perspective grid with random Gaussian peaks that grow and fade,
 * resembling quantum vacuum fluctuations.
 */

const AnimationState = {
    INTRO_APPROACH: 0,
    INTRO_MERGE: 1,
    INTRO_REVEAL: 2,
    INTRO_DELAY: 3,
    NORMAL: 4
};

class QuantumFoamHeader {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;

        // Base settings, will be updated in setConfig
        this.gridWidth = 400;
        this.gridDepth = 70;
        this.frontBuffer = 10;
        this.maxGaussians = 50;

        this.heights = [];
        this.noise = [];
        this.gaussians = [];
        this.animationId = null;


        this.state = AnimationState.INTRO_APPROACH;
        this.introGaussians = [];
        this.delayFrames = 0; // Frame counter for INTRO_DELAY // specific reference to hero blobs

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

        // initHeightMap and initNoise are called in resize -> setConfig


        this.initIntro();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    setConfig() {
        const isMobile = this.width < 768; // Mobile breakpoint

        if (isMobile) {
            this.gridWidth = 100;      // 4x reduction for mobile
            this.gridDepth = 50;       // Reduced depth
            this.maxGaussians = 15;    // Significant reduction in objects
            this.frontBuffer = 4;      // Adjusted buffer
        } else {
            this.gridWidth = 150; // Reduced from 400 for smoother look
            this.gridDepth = 60;  // Slightly reduced depth to match
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

        // Check if we crossed a breakpoint that requires config change
        const wasMobile = prevWidth < 768;
        const isMobile = this.width < 768;

        if (prevWidth === 0 || wasMobile !== isMobile) {
            this.setConfig();
            // Re-initialize arrays when grid size changes
            this.initHeightMap();
            this.initNoise();
            // Clear existing gaussians to avoid index out of bounds or visual glitches
            this.gaussians = [];
        } else {
            // Just noise needs re-init if grid size is same? 
            // Actually if gridWidth/gridDepth are same, we technically don't need to full re-init 
            // but safe to do so to match exact aspect ratio changes if needed.
            // For now, let's just keep it simple and efficient:
            // Only re-allocate if arrays are wrong size, otherwise just clear?
            // The original code re-allocated on every resize. Let's stick to that but optimized:
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
        // Generate random noise for spikey effect
        this.noise = [];
        for (let z = 0; z < this.gridDepth; z++) {
            this.noise[z] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.noise[z][x] = (Math.random() - 0.5) * 0.2; // Reduced noise (was 0.4)
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

        // Simplified spawning: just pick random positions within grid
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

    updateGaussians() {
        if (this.state === AnimationState.NORMAL) {
            if (Math.random() < 0.4) {
                this.spawnGaussian();
            }
        } else {
            this.updateIntro();
            // Add subtle far-field fluctuations during intro
            if (Math.random() < 0.1) {
                this.spawnBackgroundGaussian();
            }
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
        // Optimization: Clean the height map first (or overwrite completely)
        // Since we iterate all, we can just overwrite.
        // But we need to zero it out first if we were accumulating? 
        // Original code didn't zero out, it just calculated h inside the loop.
        // Wait, original code:
        // for z... for x... h=0... for gaussians... h+=... this.heights[z][x] = h
        // Yes, it overwrites every frame.

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
        // Standard linear perspective projection
        const fov = 300;
        const horizonY = this.height * 0.1;
        const gridSpacingX = this.width / 30; // Wider spacing (was /50)
        const gridSpacingZ = 20;

        const depth = 50 + z * gridSpacingZ;
        const scale = fov / (fov + depth);

        const centerX = this.width / 2;
        const xOffset = (x - this.gridWidth / 2) * gridSpacingX * 0.8; // Increased from 0.5

        const screenX = centerX + xOffset * scale;

        const floorY = 400;
        const screenY = horizonY + (floorY - height * 5) * scale; // Reduced from 8 to prevent exceeding cutoff

        return { x: screenX, y: screenY, depthRatio: z / this.gridDepth };
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
                // Clip extremely out of bounds points for performance?
                // Original check: if (p.y < -50 || p.y > this.height + 50) continue;
                // Since this is a line strip, treating it as point list might cause gaps if "continue" skips a point in the middle of a line.
                // However, the original code did this. Let's keep it but be careful.
                // Actually, if we skip, the lineTo sequence breaks. 
                // Original: if (x===0) moveTo else lineTo. 
                // If a point is skipped, the NEXT point will limit the line to the skipped point? No.
                // If point X is skipped, the loop continues to X+1.
                // If X+1 is drawn, it does 'lineTo(p.x, p.y)'. It will draw a line from X-1 to X+1? No, from the last *valid* point in the path.
                // So if X is skipped, it connects X-1 to X+1. This is fine for clipping Y.

                if (p.y < -50 || p.y > this.height + 50) continue;

                const alpha = 0.12 + (1 - p.depthRatio) * 0.55;
                ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
                ctx.lineWidth = 0.3 + (1 - p.depthRatio) * 1.2;

                // Optimization: Instead of changing strokeStyle/lineWidth per point (which does nothing in a single path),
                // we should set it per line (Z-loop).
                // WAIT! A single path per Z row is drawn.
                // ctx.strokeStyle is set INSIDE the x loop.
                // But a path can only have ONE style.
                // So the original code was effectively using the LAST style set or something?
                // No, ctx.stroke() is called AFTER the loop.
                // So the style of the WHOLE line is determined by the LAST point?
                // Or maybe just the last set value before stroke()?
                // Yes. So setting it per point is useless waste.
                // The alpha depends on depthRatio (z), so it IS constant for the whole Z-loop!
                // So we can move strokeStyle/lineWidth OUT of the X loop.

                // Correction: p.depthRatio depends on z. And z is constant in this loop.
                // So yes, move it out.

                if (x === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }

            // Set style for the line based on Z (depth)
            const depthRatio = z / this.gridDepth;
            const alpha = 0.12 + (1 - depthRatio) * 0.55;
            ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
            ctx.lineWidth = 0.3 + (1 - depthRatio) * 1.2;

            ctx.stroke();
        }

        // Vertical lines
        // Optimization: On mobile, maybe skip vertical lines or reduce frequency?
        // Original: x += 2.
        // Let's keep x += 2.

        for (let x = 0; x < this.gridWidth; x += 2) {
            ctx.beginPath();

            // Should we set style relative to X? No, vertical lines fade in depth too.
            // But a vertical line spans ALL depths. So it needs a gradient or varying colors?
            // Canvas path must be one color.
            // Original code: sets strokeStyle INSIDE the z loop.
            // Then calls stroke() AFTER z loop.
            // This means the WHOLE vertical line gets the color of the LAST point (z=max).
            // That seems like a bug or unintended behavior in the original code, 
            // OR it just looked "good enough".
            // If we want fading vertical lines, we'd need to draw segments or use a gradient.
            // Drawing segments is expensive (many stroke calls).
            // Given the original code did this, and we want to optimize...
            // It's better to just pick an average color or the front color?
            // Or maybe the original behavior (faded at back?) was what updated the style last?
            // z loop goes 0 to gridDepth.
            // last point is at back (z=high). depthRatio high. alpha small.
            // So vertical lines are faint?
            // Let's stick to original behavior but clean it up.

            // Move style setting out. Use average z or something?
            // Let's just use a fixed nice alpha for verticals to save ops.
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

    initIntro() {
        this.gaussians = [];
        this.state = AnimationState.INTRO_APPROACH;

        const isMobile = this.width < 768;
        const amplitude = isMobile ? 180 : 250; // Reduced from 500
        const sigma = isMobile ? 3.5 : 3.5; // Reduced from 6.0
        const z = this.gridDepth * 0.35;

        const leftBlob = {
            x: this.gridWidth * 0.15,
            z: z,
            amplitude: 0,
            maxAmplitude: amplitude,
            sigma: sigma,
            phase: 0,
            speed: 0.02,
            targetX: this.gridWidth * 0.45,
            noiseScale: 0.2
        };

        const rightBlob = {
            x: this.gridWidth * 0.85,
            z: z,
            amplitude: 0,
            maxAmplitude: amplitude,
            sigma: sigma,
            phase: 0,
            speed: 0.02,
            targetX: this.gridWidth * 0.55,
            noiseScale: 0.2
        };

        this.introGaussians = [leftBlob, rightBlob];
        this.gaussians = [leftBlob, rightBlob];
    }

    updateIntro() {
        const [left, right] = this.introGaussians;
        if (!left || !right) {
            this.state = AnimationState.NORMAL;
            return;
        }

        if (this.state === AnimationState.INTRO_APPROACH) {
            const approachSpeed = (this.gridWidth * 0.0025); // Reduced from 0.005 (50% slower)
            if (left.x < left.targetX) left.x += approachSpeed;
            if (right.x > right.targetX) right.x -= approachSpeed;

            if (Math.random() < 0.3) {
                this.spawnIntroParticle(left.x, left.z);
                this.spawnIntroParticle(right.x, right.z);
            }

            if (right.x - left.x < (this.gridWidth * 0.12)) {
                this.state = AnimationState.INTRO_MERGE;
            }
        }
        else if (this.state === AnimationState.INTRO_MERGE) {
            const mergeSpeed = (this.gridWidth * 0.0005); // Reduced from 0.001 (50% slower)
            if (left.x < this.gridWidth * 0.48) left.x += mergeSpeed;
            if (right.x > this.gridWidth * 0.52) right.x -= mergeSpeed;

            if (right.x - left.x < (this.gridWidth * 0.06)) {
                this.state = AnimationState.INTRO_REVEAL;
                this.revealContent();
            }
        }
        else if (this.state === AnimationState.INTRO_REVEAL) {
            if (left.phase === 0) { left.phase = 1; left.amplitude = left.maxAmplitude; }
            if (right.phase === 0) { right.phase = 1; right.amplitude = right.maxAmplitude; }
            this.state = AnimationState.INTRO_DELAY;
            this.delayFrames = 0;
        }
        else if (this.state === AnimationState.INTRO_DELAY) {
            this.delayFrames++;
            // Wait ~2.5 seconds (150 frames at 60fps)
            if (this.delayFrames >= 150) {
                this.state = AnimationState.NORMAL;
            }
        }

        if (this.state !== AnimationState.NORMAL) {
            left.phase = 0;
            right.phase = 0;
            if (left.amplitude >= left.maxAmplitude) left.amplitude = left.maxAmplitude;
            if (right.amplitude >= right.maxAmplitude) right.amplitude = right.maxAmplitude;
        }
    }

    spawnIntroParticle(x, z) {
        const particle = {
            x: x + (Math.random() - 0.5) * 5,
            z: z + (Math.random() - 0.5) * 5,
            amplitude: 0,
            maxAmplitude: 40 + Math.random() * 40,
            sigma: 0.5 + Math.random() * 0.5,
            phase: 0,
            speed: 0.04 + Math.random() * 0.04,
            noiseScale: 0.2
        };
        this.gaussians.push(particle);
    }

    revealContent() {
        const container = document.getElementById('header-text-container');
        if (container) {
            container.style.opacity = '1';
            container.style.transform = 'translate(-50%, -50%) scale(1)';
        }
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
