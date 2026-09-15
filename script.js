// ===================================
// CLICK THE FLY - Game Script
// ===================================

class ClickTheFlyGame {
    constructor() {
        // DOM Elemente
        this.field = document.getElementById('field');
        this.scoreEl = document.getElementById('score');
        this.timerEl = document.getElementById('timer');
        this.difficultyDisplayEl = document.getElementById('difficulty-display');
        this.bestDisplayEl = document.getElementById('best-display');
        this.soundToggleBtn = document.getElementById('sound-toggle');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resumeBtn = document.getElementById('resume-btn');
        this.pauseMenuBtn = document.getElementById('pause-menu-btn');
        this.restartBtn = document.getElementById('restart-btn');

        // Screens
        this.screenStart = document.getElementById('screen-start');
        this.screenGame = document.getElementById('screen-game');
        this.screenPause = document.getElementById('screen-pause');
        this.screenGameover = document.getElementById('screen-gameover');

        // Game States
        this.score = 0;
        this.best = this.loadBest();
        this.timeLeft = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.soundEnabled = true;
        this.timerInterval = null;
        this.flyElement = null;

        // Schwierigkeits-Einstellungen
        this.difficulties = {
            easy: { time: 30, speed: 300, name: 'Easy' },
            medium: { time: 20, speed: 150, name: 'Medium' },
            hard: { time: 10, speed: 75, name: 'Hard' }
        };
        this.currentDifficulty = 'easy';

        // Event Listener
        this.setupEventListeners();
        this.updateBestDisplay();
    }

    // ===================================
    // EVENT LISTENER SETUP
    // ===================================

    setupEventListeners() {
        // Schwierigkeitsauswahl
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => this.startGame(e.target.closest('.btn-difficulty').dataset.difficulty));
        });

        // Sound Toggle
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());

        // Pause/Resume
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.pauseMenuBtn.addEventListener('click', () => this.goToMenu());

        // Restart
        this.restartBtn.addEventListener('click', () => this.goToMenu());
    }

    // ===================================
    // SCREEN NAVIGATION
    // ===================================

    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen-active'));
        screen.classList.add('screen-active');
    }

    goToMenu() {
        this.gameRunning = false;
        this.gamePaused = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.showScreen(this.screenStart);
    }

    // ===================================
    // GAME LOGIC
    // ===================================

    startGame(difficulty) {
        this.currentDifficulty = difficulty;
        const config = this.difficulties[difficulty];
        
        this.score = 0;
        this.timeLeft = config.time;
        this.gameRunning = true;
        this.gamePaused = false;

        // Update UI
        this.updateScore();
        this.updateTimer();
        this.difficultyDisplayEl.textContent = config.name;
        this.showScreen(this.screenGame);

        // Erste Fliege
        this.createFly();

        // Timer starten
        this.startTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gamePaused && this.gameRunning) {
                this.timeLeft--;
                this.updateTimer();

                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    // ===================================
    // FLIEGE-LOGIK
    // ===================================

    createFly() {
        // Alte Fliege entfernen
        if (this.flyElement) {
            this.flyElement.remove();
        }

        // Neue Fliege erstellen
        this.flyElement = document.createElement('div');
        this.flyElement.className = 'fly';
        this.flyElement.innerHTML = `
            <div class="fly-head">
                <div class="fly-eye left"></div>
                <div class="fly-eye right"></div>
            </div>
            <div class="fly-body"></div>
            <div class="wing w1"></div>
            <div class="wing w2"></div>
            <div class="leg l1"></div>
            <div class="leg l2"></div>
        `;

        this.field.appendChild(this.flyElement);
        this.moveFly();
        this.flyElement.addEventListener('click', (e) => this.clickFly(e));
    }

    moveFly() {
        const rect = this.field.getBoundingClientRect();
        const padding = 70;
        
        const x = padding + Math.random() * Math.max(1, rect.width - padding * 2);
        const y = padding + Math.random() * Math.max(1, rect.height - padding * 2);

        this.flyElement.style.left = x + 'px';
        this.flyElement.style.top = y + 'px';
    }

    clickFly(e) {
        if (!this.gameRunning || this.gamePaused) return;

        e.stopPropagation();
        this.score++;
        this.updateScore();

        // Sound abspielen
        if (this.soundEnabled) {
            this.playClickSound();
        }

        // Fliege schütteln
        this.flyElement.classList.add('shake');
        setTimeout(() => this.flyElement.classList.remove('shake'), 300);

        // Neue Fliege
        this.createFly();

        // Best aktualisieren
        if (this.score > this.best) {
            this.best = this.score;
            this.saveBest();
            this.updateBestDisplay();
        }
    }

    // ===================================
    // PAUSE/RESUME
    // ===================================

    pauseGame() {
        this.gamePaused = true;
        document.getElementById('pause-score').textContent = this.score;
        document.getElementById('pause-timer').textContent = this.timeLeft;
        this.showScreen(this.screenPause);
    }

    resumeGame() {
        this.gamePaused = false;
        this.showScreen(this.screenGame);
    }

    // ===================================
    // GAME OVER
    // ===================================

    endGame() {
        this.gameRunning = false;
        clearInterval(this.timerInterval);

        // UI aktualisieren
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-best').textContent = this.best;

        // Neuer Rekord?
        const newRecordBox = document.getElementById('new-record-box');
        if (this.score === this.best && this.score > 0) {
            newRecordBox.style.display = 'block';
            if (this.soundEnabled) this.playWinSound();
        } else {
            newRecordBox.style.display = 'none';
        }

        this.showScreen(this.screenGameover);
    }

    // ===================================
    // UI UPDATES
    // ===================================

    updateScore() {
        this.scoreEl.textContent = this.score;
    }

    updateTimer() {
        this.timerEl.textContent = this.timeLeft;

        // Warnung bei wenig Zeit
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
            this.timerEl.style.color = '#ff6b6b';
        } else {
            this.timerEl.style.color = '#e94560';
        }
    }

    updateBestDisplay() {
        this.bestDisplayEl.textContent = this.best;
    }

    // ===================================
    // SOUND MANAGEMENT
    // ===================================

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggleBtn.classList.toggle('muted');
        this.soundToggleBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    playClickSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio nicht verfügbar');
        }
    }

    playWinSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523, 659, 784]; // Do, Mi, So

            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                const startTime = audioContext.currentTime + index * 0.1;
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.2);
            });
        } catch (e) {
            console.log('Audio nicht verfügbar');
        }
    }

    // ===================================
    // STORAGE MANAGEMENT
    // ===================================

    saveBest() {
        localStorage.setItem('clicktheflyBest', this.best);
    }

    loadBest() {
        const saved = localStorage.getItem('clicktheflyBest');
        return saved ? parseInt(saved) : 0;
    }
}

// ===================================
// GAME INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    window.game = new ClickTheFlyGame();
    console.log('Click the Fly - Spiel geladen!');
});
