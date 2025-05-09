// DOM elements
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const resetBtn = document.getElementById('reset-btn');
const message = document.getElementById('message');
const guessHistory = document.getElementById('guess-history');
const attemptsDisplay = document.getElementById('attempts');
const bestScoreDisplay = document.getElementById('best-score');

// Leaderboard elements
const leaderboardTable = document.getElementById('leaderboard');
const leaderboardBody = document.getElementById('leaderboard-body');
const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
const nameModal = document.getElementById('name-modal');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');

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
let isLeaderboardVisible = false;

// Leaderboard max size
const MAX_LEADERBOARD_ENTRIES = 10;

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
        
        // Check if score qualifies for leaderboard
        if (isScoreLeaderboardWorthy(attempts)) {
            log('info', 'checkGuess', 'Score qualifies for leaderboard');
            setTimeout(() => showNameInputModal(), 1500); // Show modal after confetti starts
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

/**
 * Leaderboard Functions
 */

// Get leaderboard from localStorage or return empty array
function getLeaderboard() {
    try {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        log('debug', 'getLeaderboard', `Retrieved ${leaderboard.length} leaderboard entries`);
        return leaderboard;
    } catch (error) {
        log('error', 'getLeaderboard', 'Error retrieving leaderboard', error);
        return [];
    }
}

// Save leaderboard to localStorage
function saveLeaderboard(leaderboard) {
    try {
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        log('debug', 'saveLeaderboard', `Saved ${leaderboard.length} leaderboard entries`);
        return true;
    } catch (error) {
        log('error', 'saveLeaderboard', 'Error saving leaderboard', error);
        return false;
    }
}

// Check if the score is worthy of the leaderboard
function isScoreLeaderboardWorthy(score) {
    const leaderboard = getLeaderboard();
    
    // If leaderboard isn't full yet, score is automatically worthy
    if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) {
        log('debug', 'isScoreLeaderboardWorthy', `Score ${score} qualifies (leaderboard not full)`);
        return true;
    }
    
    // Check if score is better than the worst score on the leaderboard
    const worstScore = Math.max(...leaderboard.map(entry => entry.score));
    const isWorthy = score < worstScore;
    log('debug', 'isScoreLeaderboardWorthy', `Score ${score} ${isWorthy ? 'qualifies' : 'does not qualify'} (worst: ${worstScore})`);
    return isWorthy;
}

// Add score to leaderboard
function addScoreToLeaderboard(name, score) {
    log('info', 'addScoreToLeaderboard', `Adding score: ${name}, ${score}`);
    const leaderboard = getLeaderboard();
    
    // Create new entry with current date
    const newEntry = {
        name: name.trim() || 'Anonymous',
        score: score,
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };
    
    // Add new entry
    leaderboard.push(newEntry);
    
    // Sort by score (lower is better)
    leaderboard.sort((a, b) => a.score - b.score);
    
    // Keep only top scores
    const trimmedLeaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    
    // Save updated leaderboard
    saveLeaderboard(trimmedLeaderboard);
    
    // Update the displayed leaderboard
    updateLeaderboardDisplay();
    
    // Return the position on the leaderboard (0-based)
    const position = trimmedLeaderboard.findIndex(entry => 
        entry.name === newEntry.name && entry.score === newEntry.score && entry.date === newEntry.date
    );
    
    log('debug', 'addScoreToLeaderboard', `Entry added at position ${position + 1}`);
    return position;
}

// Update the leaderboard display with current data
function updateLeaderboardDisplay() {
    log('debug', 'updateLeaderboardDisplay', 'Updating leaderboard display');
    const leaderboard = getLeaderboard();
    leaderboardBody.innerHTML = '';
    
    if (leaderboard.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">No scores yet. Be the first!</td>';
        leaderboardBody.appendChild(row);
    } else {
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${entry.date}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }
}

// Show/hide leaderboard when button is clicked
function toggleLeaderboard() {
    log('debug', 'toggleLeaderboard', 'Toggling leaderboard visibility');
    
    if (isLeaderboardVisible) {
        leaderboardTable.style.display = 'none';
        showLeaderboardBtn.textContent = 'Show Leaderboard';
        showLeaderboardBtn.classList.remove('hide-leaderboard');
    } else {
        updateLeaderboardDisplay();
        leaderboardTable.style.display = 'table';
        showLeaderboardBtn.textContent = 'Hide Leaderboard';
        showLeaderboardBtn.classList.add('hide-leaderboard');
    }
    
    isLeaderboardVisible = !isLeaderboardVisible;
}

// Show the name input modal
function showNameInputModal() {
    log('debug', 'showNameInputModal', 'Showing name input modal');
    nameModal.style.display = 'flex';
    playerNameInput.focus();
}

// Hide the name input modal
function hideNameInputModal() {
    log('debug', 'hideNameInputModal', 'Hiding name input modal');
    nameModal.style.display = 'none';
    playerNameInput.value = '';
}

// Save score with player name
function saveScore() {
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    log('info', 'saveScore', `Saving score for ${playerName}: ${attempts}`);
    
    const position = addScoreToLeaderboard(playerName, attempts);
    hideNameInputModal();
    
    // Show the leaderboard
    if (!isLeaderboardVisible) {
        toggleLeaderboard();
    }
    
    // Highlight the new score
    setTimeout(() => {
        const rows = leaderboardBody.querySelectorAll('tr');
        if (rows[position]) {
            rows[position].classList.add('highlight-score');
            rows[position].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Start the game when the page loads
window.addEventListener('load', function() {
    log('info', 'eventListener', 'Page loaded, starting game');
    initGame();
    // Initialize leaderboard
    updateLeaderboardDisplay();
});

// Additional Event Listeners for leaderboard functionality
showLeaderboardBtn.addEventListener('click', function() {
    log('debug', 'eventListener', 'Show/hide leaderboard button clicked');
    toggleLeaderboard();
});

saveScoreBtn.addEventListener('click', function() {
    log('debug', 'eventListener', 'Save score button clicked');
    saveScore();
});

playerNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        log('debug', 'eventListener', 'Enter key pressed in name input');
        saveScore();
    }
});