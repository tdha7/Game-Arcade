fetch('top_anime_list.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse JSON response
  })
  .then(animeData => {
    let boardSize = 16;
    let symbols = [];
    // contains a list of anime card objects
    // anime card objects have TWO fields:
    // type: (image) or (name)
    // value: (image link) or (English name)
    // doesn't have to be shuffled
    let animeDictionary = [];
    let symbolDictionary = []; 
    // game state
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let score = 0;
    // default game time
    let initialTime = 60;
    let timeLeft = initialTime;
    let timerInterval;
    // default game board
    let numCols = 4;
    let numRows = 4;

    // get variables from HTML
    const gridContainer = document.getElementById('grid-container');
    const restartButton = document.getElementById('restart-button');
    let timerElement = document.getElementById('timer');
    let gameContainer = document.getElementById('game-container');
    // adjust the game board to fit the screen
    window.addEventListener('resize', adjustGridSize);
    restartButton.addEventListener('click', clearGame);

    // show new game when window loads
    restartButton.disabled = true;
    addButtons();

    // flips the card for user to see
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
      }, 500); 
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

    function restartGame(difficulty) {
        // Reset all game variables
        gameContainer.style.display = 'flex';
        // clear board
        // remove end message before adding cards
        if (document.getElementById('message-container')) {
          removeEndMessage();
        }
        // remove cards if they exist
        removeCards();

        // set difficulty board
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
        stopTimer();
        startTimer();
    }

    function showEndMessage() {
        // remove all cards
        gameContainer.style.display = 'block';
        removeCards();
        // show message instead
        let messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.innerHTML = "Your Score: " + (score / boardSize * 100) + "%<br>Finished in:<br>"+ (60 - timeLeft - 1) + " seconds";
        gameContainer.appendChild(messageContainer);
    }

    function removeEndMessage() {
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
      }
    }

    function fitTextToContainer(textElement) {
      let container = textElement.parentElement;
      // make text large by default
      let fontSize = 200;
      // textElement.style.wordBreak = 'break-word';
      // Shrink font size until it fits within the card
      while (textElement.scrollWidth > container.clientWidth || textElement.scrollHeight > container.clientHeight) {
        textElement.style.fontSize = fontSize + 'px';
        fontSize--;
      }
      textElement.style.textAlign = 'center';
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
        removeCards();

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
      // Calculate grid size and card size
      // Calculate the grid size based on the specified number of columns and rows
      const gridWidth = 0.7 * viewportWidth;
      const gridHeight = 0.7 * viewportHeight;
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
    function removeCards() {
      while (gridContainer.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
      }
    }
  })
  .catch(error => {
    console.error('There was a problem getting the anime JSON file:', error);
  });

