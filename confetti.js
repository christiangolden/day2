/**
 * Confetti animation for the Number Guessing Game
 * Creates a celebratory particle effect when the player wins
 */

// Use the same logging function from script.js if available, otherwise create it
if (typeof log !== 'function') {
    // Create a local logging function if the global one isn't available
    function log(level, component, message, data) {
        const DEBUG = true;
        if (!DEBUG && level === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}][${level.toUpperCase()}][Confetti:${component}]`;
        
        switch(level) {
            case 'error':
                console.error(prefix, message, data !== undefined ? data : '');
                break;
            case 'warn':
                console.warn(prefix, message, data !== undefined ? data : '');
                break;
            case 'debug':
                console.debug(prefix, message, data !== undefined ? data : '');
                break;
            default:
                console.log(prefix, message, data !== undefined ? data : '');
        }
    }
    
    log('info', 'init', 'Confetti module loaded');
}

class Confetti {
    constructor() {
        log('debug', 'constructor', 'Creating confetti instance');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                      '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        this.isActive = false;
        this.animationId = null;
        log('debug', 'constructor', 'Confetti instance created with colors:', this.colors.length);
    }

    init() {
        log('info', 'init', 'Initializing confetti canvas');
        try {
            // Add canvas to document
            this.canvas.id = 'confetti-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none'; // Allow clicks to go through
            this.canvas.style.zIndex = '1000';
            document.body.appendChild(this.canvas);
            log('debug', 'init', 'Canvas element added to document body');

            // Set canvas dimensions
            this.resizeCanvas();
            window.addEventListener('resize', () => {
                log('debug', 'event', 'Window resize detected');
                this.resizeCanvas();
            });
            log('info', 'init', 'Confetti initialized successfully');
            return true;
        } catch (error) {
            log('error', 'init', 'Failed to initialize confetti', error);
            return false;
        }
    }

    resizeCanvas() {
        try {
            const oldWidth = this.canvas.width;
            const oldHeight = this.canvas.height;
            
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            log('debug', 'resizeCanvas', `Canvas resized from ${oldWidth}x${oldHeight} to ${this.canvas.width}x${this.canvas.height}`);
        } catch (error) {
            log('error', 'resizeCanvas', 'Error resizing canvas', error);
        }
    }

    createParticles() {
        log('debug', 'createParticles', 'Creating new confetti particles');
        try {
            // Create particles based on window size
            const particleCount = Math.floor(window.innerWidth / 10);
            log('debug', 'createParticles', `Creating ${particleCount} particles`);
            
            let addedParticles = 0;
            for (let i = 0; i < particleCount; i++) {
                const particle = {
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    size: Math.random() * 10 + 5,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    shape: Math.random() > 0.5 ? 'circle' : 'square',
                    speedX: Math.random() * 6 - 3,
                    speedY: Math.random() * 6 + 2,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 10 - 5
                };
                this.particles.push(particle);
                addedParticles++;
            }
            log('debug', 'createParticles', `Added ${addedParticles} particles, total: ${this.particles.length}`);
        } catch (error) {
            log('error', 'createParticles', 'Error creating particles', error);
        }
    }

    start() {
        log('info', 'start', 'Starting confetti animation');
        if (this.isActive) {
            log('warn', 'start', 'Confetti animation already active, ignoring start request');
            return;
        }
        
        try {
            this.isActive = true;
            this.particles = [];
            this.createParticles();
            this.animate();
            log('info', 'start', 'Confetti animation started successfully');

            // Auto-stop after a few seconds
            log('debug', 'start', 'Setting auto-stop timeout for 5000ms');
            setTimeout(() => {
                log('debug', 'timeout', 'Auto-stopping confetti animation after timeout');
                this.stop();
            }, 5000);
        } catch (error) {
            log('error', 'start', 'Error starting confetti animation', error);
            this.isActive = false;
        }
    }

    stop() {
        log('info', 'stop', 'Stopping confetti animation');
        try {
            this.isActive = false;
            if (this.animationId) {
                log('debug', 'stop', `Cancelling animation frame: ${this.animationId}`);
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            const particleCount = this.particles.length;
            this.particles = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            log('info', 'stop', `Confetti animation stopped, cleared ${particleCount} particles`);
        } catch (error) {
            log('error', 'stop', 'Error stopping confetti animation', error);
        }
    }

    animate() {
        if (!this.isActive) {
            log('debug', 'animate', 'Animation cycle skipped - not active');
            return;
        }

        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            let activeParticles = 0;
            let removedParticles = 0;

            // Update and draw particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;
                
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                
                if (p.shape === 'circle') {
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, p.size / 2, p.size / 2, 0, 0, 2 * Math.PI);
                    this.ctx.fill();
                } else {
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                }
                
                this.ctx.restore();
                activeParticles++;
                
                // Remove particles that are off screen
                if (p.y > this.canvas.height) {
                    this.particles.splice(i, 1);
                    i--;
                    removedParticles++;
                }
            }
            
            // Add new particles if needed
            if (this.particles.length < 50 && this.isActive) {
                log('debug', 'animate', `Particle count low (${this.particles.length}), adding more`);
                this.createParticles();
            }

            // Log animation stats periodically (every ~100 frames)
            if (Math.random() < 0.01) {
                log('debug', 'animate', `Animation stats: active=${activeParticles}, removed=${removedParticles}, total=${this.particles.length}`);
            }
            
            this.animationId = requestAnimationFrame(() => this.animate());
        } catch (error) {
            log('error', 'animate', 'Error in animation loop', error);
            this.stop(); // Stop animation on error
        }
    }
}

// Create global confetti instance and explicitly attach to window
log('info', 'global', 'Creating global confetti instance');
const confettiInstance = new Confetti();
window.addEventListener('load', () => {
    log('info', 'global', 'Window loaded, initializing confetti');
    const success = confettiInstance.init();
    
    // Explicitly attach to window object
    window.confetti = confettiInstance;
    log('info', 'global', `Confetti attached to window.confetti: ${window.confetti !== undefined}`);
    
    // Verify initialization
    if (success) {
        log('info', 'global', 'Confetti ready for celebration effects');
    } else {
        log('error', 'global', 'Confetti initialization failed');
    }
});