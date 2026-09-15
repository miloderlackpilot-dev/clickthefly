class Game {
    constructor() {
        this.score = 0;
        this.best = parseInt(localStorage.getItem('flyBest')) || 0;
        this.timeLeft = 0;
        this.running = false;
        this.paused = false;
        this.difficulty = 'easy';
        this.timerInterval = null;
        this.fly = null;

        // DOM
        this.field = document.getElementById('field');
        this.scoreEl = document.getElementById('score');
        this.timerEl = document.getElementById('timer');
        this.bestEl = document.getElementById('best');

        // Configs
        this.configs = {
            easy: { time: 30 },
            medium: { time: 20 },
            hard: { time: 10 }
        };

        this.init();
    }

    init() {
        // Menu buttons - Fix für Event Listener
        const diffButtons = document.querySelectorAll('.btn-difficulty');
        console.log('Found difficulty buttons:', diffButtons.length);
        
        diffButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = btn.dataset.difficulty;
                console.log('Starting game with difficulty:', this.difficulty);
                this.start();
            });
        });

        // Game buttons
        const pauseBtn = document.getElementById('pause-btn');
        const resumeBtn = document.getElementById('resume-btn');
        const pauseMenuBtn = document.getElementById('pause-menu-btn');
        const exitBtn = document.getElementById('exit-btn');
        const replayBtn = document.getElementById('replay-btn');

        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.resume());
        if (pauseMenuBtn) pauseMenuBtn.addEventListener('click', () => this.goMenu());
        if (exitBtn) exitBtn.addEventListener('click', () => this.goMenu());
        if (replayBtn) replayBtn.addEventListener('click', () => this.goMenu());

        this.updateBest();
        console.log('Game initialized. Best score:', this.best);
    }

    start() {
        this.score = 0;
        this.timeLeft = this.configs[this.difficulty].time;
        this.running = true;
        this.paused = false;

        console.log('Game started with', this.timeLeft, 'seconds');
        
        this.showScreen('game');
        this.updateScore();
        this.updateTimer();
        this.createFly();
        this.startTimer();
    }

    createFly() {
        if (this.fly) this.fly.remove();

        this.fly = document.createElement('div');
        this.fly.className = 'fly';
        this.fly.innerHTML = `
            <div class="fly-head">
                <div class="fly-eye left"></div>
                <div class="fly-eye right"></div>
            </div>
            <div class="fly-body"></div>
            <div class="fly-wing w1"></div>
            <div class="fly-wing w2"></div>
        `;

        this.field.appendChild(this.fly);
        this.moveFly();
        this.fly.addEventListener('click', (e) => this.clickFly(e));
    }

    moveFly() {
        const rect = this.field.getBoundingClientRect();
        const pad = 50;
        
        const x = pad + Math.random() * Math.max(1, rect.width - pad * 2);
        const y = pad + Math.random() * Math.max(1, rect.height - pad * 2);

        this.fly.style.left = x + 'px';
        this.fly.style.top = y + 'px';
    }

    clickFly(e) {
        if (!this.running || this.paused) return;
        e.stopPropagation();

        this.score++;
        this.updateScore();

        if (this.score > this.best) {
            this.best = this.score;
            this.saveBest();
            this.updateBest();
        }

        this.createFly();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.paused) {
                this.timeLeft--;
                this.updateTimer();

                if (this.timeLeft <= 0) {
                    this.end();
                }
            }
        }, 1000);
    }

    updateScore() {
        this.scoreEl.textContent = this.score;
    }

    updateTimer() {
        this.timerEl.textContent = this.timeLeft;
    }

    updateBest() {
        this.bestEl.textContent = this.best;
    }

    pause() {
        this.paused = true;
        document.getElementById('pause-score').textContent = this.score;
        document.getElementById('pause-time').textContent = this.timeLeft;
        this.showScreen('pause');
    }

    resume() {
        this.paused = false;
        this.showScreen('game');
    }

    end() {
        this.running = false;
        clearInterval(this.timerInterval);

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-best').textContent = this.best;

        const recordEl = document.getElementById('record');
        if (this.score === this.best && this.score > 0) {
            recordEl.style.display = 'block';
        } else {
            recordEl.style.display = 'none';
        }

        this.showScreen('gameover');
    }

    goMenu() {
        this.running = false;
        this.paused = false;
        clearInterval(this.timerInterval);
        if (this.fly) this.fly.remove();
        this.field.innerHTML = '';
        this.showScreen('menu');
    }

    showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen-active'));
        document.getElementById(name).classList.add('screen-active');
    }

    saveBest() {
        localStorage.setItem('flyBest', this.best);
    }
}

// Start game
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    window.game = new Game();
});
