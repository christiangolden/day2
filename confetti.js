/**
 * Confetti animation for the Number Guessing Game
 * Creates a celebratory particle effect when the player wins
 */
class Confetti {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                      '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        this.isActive = false;
        this.animationId = null;
    }

    init() {
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

        // Set canvas dimensions
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        // Create particles based on window size
        const particleCount = Math.floor(window.innerWidth / 10);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                size: Math.random() * 10 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                shape: Math.random() > 0.5 ? 'circle' : 'square',
                speedX: Math.random() * 6 - 3,
                speedY: Math.random() * 6 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.particles = [];
        this.createParticles();
        this.animate();

        // Auto-stop after a few seconds
        setTimeout(() => this.stop(), 5000);
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
            
            // Remove particles that are off screen
            if (p.y > this.canvas.height) {
                this.particles.splice(i, 1);
                i--;
            }
        }
        
        // Add new particles if needed
        if (this.particles.length < 50 && this.isActive) {
            this.createParticles();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Create global confetti instance and explicitly attach to window
const confettiInstance = new Confetti();
window.addEventListener('load', () => {
    confettiInstance.init();
    // Explicitly attach to window object
    window.confetti = confettiInstance;
});