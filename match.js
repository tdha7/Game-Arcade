fetch('top_anime_list.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse JSON response
  })
  .then(animeData => {
    let boardSize = 16;

// initialize symbols
// list with nums 0 - boardSize
let symbols = [];
// 1 3 4 2 5 0

// contains a list of anime card objects
// anime card objects have TWO fields:
// type: (image) or (name)
// value: (image link) or (English name)
// doesn't have to be shuffled
let animeDictionary = [];

let symbolDictionary = []; 

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;

let initialTime = 60;
let timeLeft = initialTime;
let timerInterval;

let numCols = 4;
let numRows = 4;

const gridContainer = document.getElementById('grid-container');
const restartButton = document.getElementById('restart-button');
let timerElement = document.getElementById('timer');
let gameContainer = document.getElementById('game-container');

window.addEventListener('resize', adjustGridSize);

restartButton.addEventListener('click', clearGame);

// new game (initial)
restartButton.disabled = true;
addButtons();
// restartGame();
//console.log(document.documentElement.outerHTML);

function flipCard() {
  if (lockBoard) return;
  // user clicks on it twice, return early to prevent flipping again
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!firstCard) {
    firstCard = this;
    showText(firstCard);
    return;
  }

  secondCard = this;
  showText(secondCard);
  checkForMatch();
}

function checkForMatch() {
  const gridIndex1 = firstCard.dataset.index;
  const gridIndex2 = secondCard.dataset.index;
  const symbolCard1 = symbolDictionary[gridIndex1];
  const symbolCard2 = symbolDictionary[gridIndex2];

  let isMatch = false;
  if (isEven(symbolCard1)) { // even -> name, check if second index is +1
    isMatch = symbolCard2 === (symbolCard1 + 1)
  } else { // odd --> image, check if second index is -1
    isMatch = symbolCard2 === (symbolCard1 - 1)
  }

  if (isMatch) {
    score += 2;
    disableCards();
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  firstCard.classList.remove('flip');
  secondCard.classList.remove('flip');
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  lockBoard = true;
  // Remove matched cards from the DOM after a delay
  setTimeout(() => {
    // hide text
    hideText(firstCard);
    hideText(secondCard);
    firstCard.style.backgroundColor = 'rgb(235, 180, 195)';
    secondCard.style.backgroundColor = 'rgb(235, 180, 195)';
    firstCard.style.cursor = 'auto';
    secondCard.style.cursor = 'auto';
    resetBoard();
    if (document.querySelectorAll('.card.matched').length === symbols.length) {
        stopTimer();
        showEndMessage();
    }
  }, 500); // Adjust the delay as needed
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    hideText(firstCard);
    hideText(secondCard);
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, 1000);
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

/*
On load:
show buttons
load game

restart button clicked:
remove cards and/or message
show buttons
load game

*/

function restartGame(difficulty) {
    // Reset all game variables

    gameContainer.style.display = 'flex';

    // clear board
    // remove end message before adding cards
    if (document.getElementById('message-container')) {
      removeEndMessage();
    }

    // remove cards if they exist
    
    while (gridContainer.firstChild) {
      gridContainer.removeChild(gridContainer.firstChild);
    }

    if (difficulty == "Easy") {
      boardSize = 16;
      numCols = 4;
      numRows = 4;
    } else if (difficulty == "Medium") {
      boardSize = 24; 
      if (isLandscape()) {
        numCols = 6;
        numRows = 4;
      } else {
        numCols = 4;
        numRows = 6;
      }
    } else if (difficulty == "Hard") {
      boardSize = 32;
      if (isLandscape()) {
        numCols = 8;
        numRows = 4;
      } else {
        numCols = 4;
        numRows = 8;
      }
    }
    removeButtons();
    restartButton.disabled = false;
    symbols = [];
    for (let j = 0; j < boardSize; j++) {
      symbols.push(j);
    }
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    symbolDictionary = [];
    timeLeft = 60;
    score = 0;
    restartButton.textContent = 'Restart Game';

    // Randomize new anime
    animeDictionary = getRandomAnime();

    // Shuffle the symbols
    symbols.sort(() => Math.random() - 0.5);

    // Create and append cards to the grid container
    symbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        // card.textContent = symbol;

        if (isEven(symbol)) {
          let cardText = document.createElement('div');
          card.classList.add('card-text');
          card.appendChild(cardText);
        } else {
          let image = document.createElement('img');
          image.src = '';
          card.appendChild(image);
        }
        
        symbolDictionary.push(symbol);
        hideText(card);
        card.addEventListener('click', flipCard);
        gridContainer.appendChild(card);
    });
    adjustGridSize();
    // restartButton.textContent = 'Restart Game';
    stopTimer();
    startTimer();
    // remove congratulations message
    // messageContainer.textContent = '';

}

function showEndMessage() {
    // remove all cards
    
    gameContainer.style.display = 'block';

    while (gridContainer.firstChild) {
      gridContainer.removeChild(gridContainer.firstChild);
    }
    // show message instead
    // let messageContainer = document.createElement('div');
    // messageContainer.id = 'message-container';
    // let messageContainer = document.getElementById('game-container');
     // show message instead
     let messageContainer = document.createElement('div');
     messageContainer.id = 'message-container';
     
     messageContainer.innerHTML = "Your Score: " + (score / boardSize * 100) + "%<br>Finished in:<br>"+ (60 - timeLeft - 1) + " seconds";
     
     gameContainer.appendChild(messageContainer);

    // can also add an image
    // either keep the end message like this 
    // or just add more divs such as a div for score and time
    // and remove them accordingly in the function
    // let restartContainer = document.getElementById('restart-container');
    // restartContainer.parentNode.insertBefore(messageContainer, restartContainer.nextSibling);
}

function removeEndMessage() {
  // check if I can delete this since messageContainer is already defined at the beginning
  let message = document.getElementById('message-container');
  message.remove();
}

function hideText(card) {
  const index = card.dataset.index;
  const symbolIndex = symbolDictionary[index];
  if (isEven(symbolIndex)) {
    card.children[0].textContent = '';
  } else {
    card.children[0].src = '';
  }
  
}

function showText(card) {
  const index = card.dataset.index;
  const symbolIndex = symbolDictionary[index];
  if (isEven(symbolIndex)) {
    card.children[0].textContent = animeDictionary[symbolIndex];
    fitTextToContainer(card.children[0]);
  } else {
    card.children[0].src = animeDictionary[symbolIndex];
    // fitImageToContainer(card.children[0]);
  }
  
}

function fitTextToContainer(textElement) {
  // let container = document.getElementById('container');
  // let textElement = document.getElementById('textElement');
  
  let container = textElement.parentElement;

  let fontSize = 1;
  
  // textElement.style.wordBreak = 'break-word';
  // Increase font size until text exceeds container dimensions
  while (textElement.scrollWidth <= container.clientWidth && textElement.scrollHeight <= container.clientHeight) {
      textElement.style.fontSize = fontSize + 'px';
      fontSize++;
  }
  
  // Decrease font size by 1 to fit text within container
  // decrease by 4 (looks nicer)
  textElement.style.fontSize = (fontSize - 4) + 'px';
  textElement.style.textAlign = 'center';
}

function fitImageToContainer(image) {
  let container = textElement.parentElement;
  let containerWidth = container.clientWidth;
  let containerHeight = container.clientHeight;

  let imageAspectRatio = image.naturalWidth / image.naturalHeight;

  let containerAspectRatio = containerWidth / containerHeight;

  // Adjust the width and height of the image to fit within the container
  if (containerAspectRatio > imageAspectRatio) {
    // Container is wider than the image
    image.style.width = '100%';
    image.style.height = 'auto';
  } else {
      // Container is taller than the image
      image.style.width = 'auto';
      image.style.height = '100%';
  }
}

function getRandomAnime() {
  let newAnimeDictionary = [];
  let randNums = [];
  // get (# of boardSize) unique anime
  while(newAnimeDictionary.length != boardSize) {
      const randNum = Math.floor(Math.random() * (animeData.length - 1));
      if (!randNums.includes(randNum)) {
          randNums.push(randNum);
          const animeObj = animeData[randNum];
          newAnimeDictionary.push(animeObj.name);
          newAnimeDictionary.push(animeObj.image);
      }
  }
  return newAnimeDictionary;
  // return randNums;
}

function isEven(num) {
  return num % 2 == 0;
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

function showStartMessage() {
  let messageContainer = document.createElement('div');
  messageContainer.id = 'message-container';
  messageContainer.textContent = 'Select a Difficulty!'
  gameContainer.appendChild(messageContainer);
}

function clearGame() {
  if (!restartButton.disabled) {
    if (document.getElementById('message-container')) {
      removeEndMessage();
    }
  
    // remove cards if they exist
    
    while (gridContainer.firstChild) {
      gridContainer.removeChild(gridContainer.firstChild);
    }
    stopTimer();
    timerElement.textContent = '1:00';
    addButtons();
    restartButton.disabled = true;
  }
}


function addButtons() {
  gameContainer.style.display = 'block';
  showStartMessage();
  // Create Easy button
  let easyBtn = document.createElement("button");
  easyBtn.textContent = "Easy";
  easyBtn.onclick = function() {
    restartGame('Easy');
  };
  easyBtn.classList.add("diff-btn");
  gameContainer.appendChild(easyBtn);

  // Create Medium button
  let mediumBtn = document.createElement("button");
  mediumBtn.textContent = "Medium";
  mediumBtn.onclick = function() {
    restartGame('Medium');
  };
  mediumBtn.classList.add("diff-btn");
  gameContainer.appendChild(mediumBtn);

  // Create Hard button
  let hardBtn = document.createElement("button");
  hardBtn.textContent = "Hard";
  hardBtn.onclick = function() {
    restartGame('Hard');
  };
  hardBtn.classList.add("diff-btn");
  gameContainer.appendChild(hardBtn);
}

function selectDifficulty(difficulty) {
  // Remove all buttons
  removeButtons();
  gameContainer.style.display = 'flex';
  return difficulty;
}

function removeButtons() {
  let buttonsToRemove = document.getElementsByClassName("diff-btn");
  while (buttonsToRemove.length > 0) {
    buttonsToRemove[0].parentNode.removeChild(buttonsToRemove[0]);
  }
}

function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

function adjustGridSize() {
  const container = document.getElementById('grid-container');
  const cards = container.querySelectorAll('.card');
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  

  // Calculate number of rows needed based on number of cards
  // change numCols here
  // const numCols = 4;
  // Calculate grid size and card size
  // Calculate the grid size based on the specified number of columns and rows
  const gridWidth = 0.7 * viewportWidth;
  const gridHeight = 0.7 * viewportHeight;
  const maxViewportSize = Math.max(gridWidth, gridHeight);
  const minViewportSize = Math.min(gridWidth, gridHeight);
  const maxSize = Math.max(numRows, numCols);
  const minSize = Math.min(numRows, numCols);
  const widthLen = gridWidth / (numCols + 0.5);
  const heightLen = gridHeight / (numRows + 0.5);

  const newCardSize = Math.min(widthLen, heightLen); // Calculate card size based on the number of columns

  // const newCardSize = Math.floor(Math.min(gridWidth, gridHeight) / Math.floor(Math.max(numRows, numCols)));
  container.style.width = `${gridWidth}px`;
  container.style.height = `${gridHeight}px`;

  cards.forEach(card => {
    card.style.width = `${newCardSize}px`;
    card.style.height = `${newCardSize}px`;
  });

  // Adjust grid template columns to display in rows
  container.style.gridTemplateColumns = `repeat(${numCols}, ${newCardSize}px)`;
  container.style.gridAutoRows = `${newCardSize}px`;
}

  })
  .catch(error => {
    console.error('There was a problem fetching the anime JSON file:', error);
  });

