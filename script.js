class Game {
    constructor() {
        this.score = 0;
        this.best = parseInt(localStorage.getItem('flyBest')) || 0;
        this.timeLeft = 0;
        this.running = false;
        this.difficulty = 'easy';
        this.timerInterval = null;
        this.fly = null;
        this.selectedDifficulty = null;

        this.configs = {
            easy: { time: 30, name: 'Easy' },
            medium: { time: 20, name: 'Medium' },
            hard: { time: 10, name: 'Hard' }
        };

        this.updateBest();
    }

    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        document.getElementById('confirm-diff').textContent = this.configs[difficulty].name;
        this.showScreen('confirm');
    }

    startGame() {
        this.difficulty = this.selectedDifficulty;
        this.score = 0;
        this.timeLeft = this.configs[this.difficulty].time;
        this.running = true;

        this.showScreen('game-screen');
        this.createFly();
        this.startTimer();
    }

    backToMenu() {
        this.running = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.fly) this.fly.remove();
        document.getElementById('field').innerHTML = '';
        this.showScreen('menu');
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

        document.getElementById('field').appendChild(this.fly);
        this.moveFly();
        this.fly.addEventListener('click', (e) => this.clickFly(e));
    }

    moveFly() {
        const field = document.getElementById('field');
        const rect = field.getBoundingClientRect();
        const pad = 50;
        
        const x = pad + Math.random() * Math.max(1, rect.width - pad * 2);
        const y = pad + Math.random() * Math.max(1, rect.height - pad * 2);

        this.fly.style.left = x + 'px';
        this.fly.style.top = y + 'px';
    }

    clickFly(e) {
        if (!this.running) return;
        e.stopPropagation();

        this.score++;
        document.getElementById('score').textContent = this.score;

        if (this.score > this.best) {
            this.best = this.score;
            this.saveBest();
            this.updateBest();
        }

        this.createFly();
    }

    startTimer() {
        document.getElementById('timer').textContent = this.timeLeft;
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.running = false;
        clearInterval(this.timerInterval);

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-best').textContent = this.best;

        const recordEl = document.getElementById('new-record');
        if (this.score === this.best && this.score > 0) {
            recordEl.style.display = 'block';
        } else {
            recordEl.style.display = 'none';
        }

        this.showScreen('gameover');
    }

    showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(name).classList.add('active');
    }

    updateBest() {
        document.getElementById('best-score').textContent = this.best;
    }

    saveBest() {
        localStorage.setItem('flyBest', this.best);
    }
}

const game = new Game();
