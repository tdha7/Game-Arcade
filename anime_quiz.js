let randomAnime;
let playerScore = 0;

let initialTime = 60;
let timeLeft = initialTime;
let timerInterval;

let timerElement = document.getElementById("timer");

// Start the game
function startGame() {
  document.getElementById("startButton").style.display = "none";
  document.getElementById("restartButton").style.display = "block";
  stopTimer();
  startTimer();
  generateNewQuestion();
}

// Function to generate a new random anime question
function generateNewQuestion() {
  fetch('top_anime_list.json')
    .then(response => response.json())
    .then(data => {
      // reset fields
      document.getElementById('guess').value = '';
      document.getElementById('guess').placeholder = "Enter your guess";
      document.getElementById('output').textContent = '';
      document.getElementById("output").style.fontSize = '110%';
      document.getElementById('nextButton').textContent = 'Skip';
      document.getElementById('guessButton').disabled = false;
      // Choose a random anime
      randomAnime = data[Math.floor(Math.random() * data.length)];

      document.getElementById("anime-question-container").style.display = "block";
      // Display anime information
      document.getElementById('rating').innerHTML = `<strong>MyAnimeList Rating</strong>: ${randomAnime.score}`;
      document.getElementById('aired-date').innerHTML = `<strong>Aired Date</strong>: ${randomAnime.aired_date}`;
      document.getElementById('genres').innerHTML = `<strong>Genres</strong>: ${randomAnime.genres.join(', ')}`;
      document.getElementById('image').style.display = 'inline-block';
      document.getElementById('image').src = randomAnime.image;
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Function to check user's guess
function checkGuess() {
  const userGuess = document.getElementById('guess').value.toLowerCase().trim();
  const isCorrect = (userGuess === randomAnime.name.toLowerCase() || userGuess === randomAnime.japanese_name.toLowerCase());
    
  if (isCorrect) {
    document.getElementById('output').style.color = 'green';
    document.getElementById('output').textContent = `Correct! The answer is: ${randomAnime.name} (${randomAnime.japanese_name.replace(/\)/g, '\\$&')})`;
    document.getElementById('guessButton').disabled = true;
    document.getElementById('nextButton').textContent = 'Next';
    updateScore();
  } 
  else {
    document.getElementById('output').style.color = 'red';
    document.getElementById('guessButton').disabled = true;
    document.getElementById('nextButton').textContent = 'Next';
    document.getElementById('output').textContent = `You are incorrect. The correct names are: ${randomAnime.name} (${randomAnime.japanese_name.replace(/\)/g, '\\$&')})`;
  }
}

function updateScore() {
  playerScore += 10;
  document.getElementById('player-score').textContent = playerScore;
}

function restartGame() {
  // restart the game
  playerScore = 0;
  timeLeft = 60;
  startScreen();
}

function startScreen() {
  document.getElementById("startButton").style.display = "block";
  document.getElementById("restartButton").style.display = "none";
  document.getElementById("anime-question-container").style.display = "none";
  document.getElementById("output").textContent = '';
  document.getElementById("output").style.fontSize = '110%';
  stopTimer();
  timerElement.textContent = '1:00';
  document.getElementById("player-score").textContent = '0';
}

// Function to update the timer display
function updateTimer() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  // Add leading zero if seconds is less than 10
  seconds = seconds < 10 ? '0' + seconds : seconds;
  // Update the timer display
  timerElement.textContent = minutes + ':' + seconds;
}
  
function showEndMessage() {
  stopTimer();
  document.getElementById("anime-question-container").style.display = "none";
  document.getElementById("output").style.color = 'purple';
  document.getElementById("output").style.fontSize = '500%';
  document.getElementById("output").innerHTML = "Congratulations!<br>Score: " + playerScore;
}


function countdown() {
  // Update the timer display
  updateTimer();
  // Decrease timeLeft by 1 second
  timeLeft--;
  // Check if the timer has reached 0
  if (timeLeft < 0) {
    // If timer has reached 0, display a message
    showEndMessage();
    // Stop the timer (optional)
    clearInterval(timerInterval);
  }
}
  
function startTimer() {
  // Reset timeLeft to initialTime
  timeLeft = initialTime;
  // Start the timer immediately
  countdown();
  timerInterval = setInterval(countdown, 1000);
}
  
function stopTimer() {
  clearInterval(timerInterval);
}

startScreen();

