class Game {
    constructor() {
        this.score = 0;
        this.best = localStorage.getItem('flyBest') || 0;
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
        // Menu buttons
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = e.target.dataset.difficulty;
                this.start();
            });
        });

        // Game buttons
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('resume-btn').addEventListener('click', () => this.resume());
        document.getElementById('pause-menu-btn').addEventListener('click', () => this.goMenu());
        document.getElementById('exit-btn').addEventListener('click', () => this.goMenu());
        document.getElementById('replay-btn').addEventListener('click', () => this.goMenu());

        this.updateBest();
    }

    start() {
        this.score = 0;
        this.timeLeft = this.configs[this.difficulty].time;
        this.running = true;
        this.paused = false;

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
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
