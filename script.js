// DOM elements
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const resetBtn = document.getElementById('reset-btn');
const message = document.getElementById('message');
const guessHistory = document.getElementById('guess-history');
const attemptsDisplay = document.getElementById('attempts');
const bestScoreDisplay = document.getElementById('best-score');

// Game variables
let secretNumber;
let attempts;
let gameOver;
let guesses = [];
let bestScore = localStorage.getItem('bestScore') || '-';

// Initialize the game
function initGame() {
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
    
    console.log('Secret number:', secretNumber); // For debugging
}

// Check player's guess
function checkGuess() {
    // Validate input
    if (guessInput.value === '' || gameOver) {
        return;
    }
    
    const userGuess = parseInt(guessInput.value);
    
    // Validate number range
    if (userGuess < 1 || userGuess > 100) {
        message.textContent = 'Please enter a number between 1 and 100.';
        message.className = 'incorrect';
        guessInput.value = '';
        return;
    }
    
    // Check if the number has already been guessed
    if (guesses.includes(userGuess)) {
        message.textContent = `You already guessed ${userGuess}. Try a different number.`;
        message.className = 'incorrect';
        guessInput.value = '';
        return;
    }
    
    // Valid guess - increment attempts
    attempts++;
    attemptsDisplay.textContent = attempts;
    
    // Add to guess history
    guesses.push(userGuess);
    const listItem = document.createElement('li');
    listItem.textContent = userGuess;
    guessHistory.appendChild(listItem);
    
    // Clear input
    guessInput.value = '';
    guessInput.focus();
    
    // Check guess against secret number
    if (userGuess === secretNumber) {
        // Winning condition
        message.textContent = `Congratulations! You guessed the number ${secretNumber} in ${attempts} attempts!`;
        message.className = 'correct';
        gameOver = true;
        guessInput.disabled = true;
        guessBtn.disabled = true;
        
        // Update best score
        if (bestScore === '-' || attempts < parseInt(bestScore)) {
            bestScore = attempts;
            localStorage.setItem('bestScore', bestScore);
            bestScoreDisplay.textContent = bestScore;
        }
    } else if (userGuess < secretNumber) {
        message.textContent = `Too low! Try a higher number.`;
        message.className = 'incorrect';
    } else {
        message.textContent = `Too high! Try a lower number.`;
        message.className = 'incorrect';
    }
}

// Event listeners
guessBtn.addEventListener('click', checkGuess);
resetBtn.addEventListener('click', initGame);
guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

// Start the game when the page loads
window.addEventListener('load', initGame);