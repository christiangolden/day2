// DOM elements
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const resetBtn = document.getElementById('reset-btn');
const message = document.getElementById('message');
const guessHistory = document.getElementById('guess-history');
const attemptsDisplay = document.getElementById('attempts');
const bestScoreDisplay = document.getElementById('best-score');

// Set up logging
const DEBUG = true; // Set to false to disable detailed logging in production

/**
 * Utility logging function
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} component - Component or function name
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
function log(level, component, message, data) {
    if (!DEBUG && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}][${level.toUpperCase()}][${component}]`;
    
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

// Game variables
let secretNumber;
let attempts;
let gameOver;
let guesses = [];
let bestScore = localStorage.getItem('bestScore') || '-';

log('info', 'init', 'Number Guessing Game initializing');
log('debug', 'init', 'Best score retrieved from localStorage', bestScore);

// Initialize the game
function initGame() {
    log('info', 'initGame', 'Starting new game');
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameOver = false;
    guesses = [];
    
    // Reset UI
    guessInput.value = '';
    message.textContent = '';
    message.className = '';
    guessHistory.innerHTML = '';
    attemptsDisplay.textContent = '0';
    bestScoreDisplay.textContent = bestScore;
    
    // Enable input
    guessInput.disabled = false;
    guessBtn.disabled = false;
    
    // Focus on input
    guessInput.focus();
    
    log('debug', 'initGame', `Game initialized with secret number: ${secretNumber}`);
}

// Check player's guess
function checkGuess() {
    log('info', 'checkGuess', 'Processing player guess');
    
    // Validate input
    if (guessInput.value === '') {
        log('warn', 'checkGuess', 'Empty guess submitted');
        return;
    }
    
    if (gameOver) {
        log('warn', 'checkGuess', 'Game already over, ignoring guess');
        return;
    }
    
    const userGuess = parseInt(guessInput.value);
    log('debug', 'checkGuess', `User guessed: ${userGuess}`);
    
    // Validate number range
    if (userGuess < 1 || userGuess > 100) {
        log('warn', 'checkGuess', `Invalid guess outside range: ${userGuess}`);
        message.textContent = 'Please enter a number between 1 and 100.';
        message.className = 'incorrect';
        guessInput.value = '';
        return;
    }
    
    // Check if the number has already been guessed
    if (guesses.includes(userGuess)) {
        log('warn', 'checkGuess', `Repeated guess: ${userGuess}`);
        message.textContent = `You already guessed ${userGuess}. Try a different number.`;
        message.className = 'incorrect';
        guessInput.value = '';
        return;
    }
    
    // Valid guess - increment attempts
    attempts++;
    log('debug', 'checkGuess', `Attempt #${attempts}: ${userGuess}`);
    attemptsDisplay.textContent = attempts;
    
    // Add to guess history
    guesses.push(userGuess);
    const listItem = document.createElement('li');
    listItem.textContent = userGuess;
    guessHistory.appendChild(listItem);
    log('debug', 'checkGuess', 'Guess history updated', guesses);
    
    // Clear input
    guessInput.value = '';
    guessInput.focus();
    
    // Check guess against secret number
    if (userGuess === secretNumber) {
        // Winning condition
        log('info', 'checkGuess', `Player won in ${attempts} attempts`);
        message.textContent = `Congratulations! You guessed the number ${secretNumber} in ${attempts} attempts!`;
        message.className = 'correct';
        gameOver = true;
        guessInput.disabled = true;
        guessBtn.disabled = true;
        
        // Update best score
        if (bestScore === '-' || attempts < parseInt(bestScore)) {
            log('info', 'checkGuess', `New best score achieved: ${attempts}`);
            bestScore = attempts;
            localStorage.setItem('bestScore', bestScore);
            bestScoreDisplay.textContent = bestScore;
        }
        
        // Trigger confetti celebration
        if (window.confetti) {
            log('debug', 'checkGuess', 'Starting confetti celebration');
            try {
                window.confetti.start();
            } catch (error) {
                log('error', 'checkGuess', 'Failed to start confetti', error);
            }
        } else {
            log('error', 'checkGuess', 'Confetti object not found');
        }
    } else if (userGuess < secretNumber) {
        log('debug', 'checkGuess', `Guess too low: ${userGuess} < ${secretNumber}`);
        message.textContent = `Too low! Try a higher number.`;
        message.className = 'incorrect';
    } else {
        log('debug', 'checkGuess', `Guess too high: ${userGuess} > ${secretNumber}`);
        message.textContent = `Too high! Try a lower number.`;
        message.className = 'incorrect';
    }
}

// Event listeners
log('debug', 'init', 'Setting up event listeners');

guessBtn.addEventListener('click', function() {
    log('debug', 'eventListener', 'Guess button clicked');
    checkGuess();
});

resetBtn.addEventListener('click', function() {
    log('debug', 'eventListener', 'Reset button clicked');
    initGame();
});

guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        log('debug', 'eventListener', 'Enter key pressed in input');
        checkGuess();
    }
});

// Start the game when the page loads
window.addEventListener('load', function() {
    log('info', 'eventListener', 'Page loaded, starting game');
    initGame();
});