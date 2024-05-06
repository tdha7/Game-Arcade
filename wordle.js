/* Open Source Game : WORDLE 
Link: https://github.com/vanshgulati16/Wordle-Clone.github.io 
Originally a wordle game, but I changed it to match the theme
of my website and make it anime related by generating an anime
character name instead of the word 'SUPER' used by the author
*/

// get containers from html
const tileDisplay = document.querySelector('.tile-container');
const keyboard = document.querySelector('.key-container');
const messageDisplay = document.querySelector('.message-container');

// list of anime character names that I added manually
const wordleDict = ['LUFFY', 'ERWIN', 'NATSU', 'LIGHT', 'ASUNA', 'SHIRO', 'AKITO', 'SAITO', 
    'ALICE', 'SHIKI', 'EMIYA', 'AYANO', 'UTAHA', 'ERINI', 'RENGE', 'AKARI', 'JIROU', 'ARMIN', 
    'HANGE', 'TOUKA', 'USHIO', 'STARK', 'EISEN', 'KRAFT', 'SERIE', 'KANNE', 'AYASE', 'ASUKA', 
    'ANJOU', 'MATOU', 'TAIGA', 'KIREI', 'TOUKO', 'ISSEI', 'AKENO', 'ANGRA', 'TOORU', 'ARISA', 
    'ISUZU', 'MACHI', 'ALPHA', 'DELTA', 'AKANE', 'KAORI', 'ANNIE', 'PIECK', 'FALCO', 'PORCO', 
    'FLOCH', 'CHIKA', 'DENJI', 'AISHA', 'EINAR', 'THORS', 'ARATA', 'DAVID', 'MUZAN', 'GIYUU', 
    'AKAZA', 'YUUJI', 'SABER', 'GOJOU', 'PANDA', 'TOUDO', 'SHOKO', 'TIESE', 'TOKIO', 'USAMI', 
    'RIDER', 'WAVER', 'RIKKA', 'YUUTA', 'GAUMA', 'CHISE', 'JOSEE', 'GETOU', 'ZENIN', 'KENTO', 
    'MAYOI', 'KAIKI', 'KAREN', 'IZUKO', 'IROHA', 'KAEDE', 'TOMOE', 'EUGEO', 'LEAFA', 'SHINO',
    'EMMA', 'KRONE', 'MARCH', 'FUSHI', 'POWER', 'MEDEA', 'BANRI', 'KOUKO', 'FREYA', 'INOUE', 
    'IRIDO', 'EBISU', 'KATOU', 'SOUTA', 'YUUNA', 'KUDOU', 'AISHA', 'LUVIA', 'TAIGA', 'AYATO',
    'IZUMI', 'BRIAR', 'OKABE', 'ELIAS', 'SILKY', 'MISHA', 'SASHA', 'KANON', 'MIKEY', 'IRINA', 
    'GAARA', 'IRUKA', 'ASUMA', 'KRAFT', 'AZAKA', 'NINYM', 'ERIKA', 'MALTY', 'MELTY', 'URARA', 
    'KAORU', 'INORI', 'OREKI', 'AKAME', 'LEONE', 'MENMA', 'GASAI'];

// generate a random word from the dictionary
const randNum = Math.floor(Math.random() * (wordleDict.length - 1));
const wordle = wordleDict[randNum];

// keys for user to input by clicking
const keys = [
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    'DELETE',
    'ENTER'
];

// initialize game board
const guessRows =[
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];

// initialize game variables
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

// create divs for user to input their guess in
guessRows.forEach((guessRow, guessRowIndex) => { 
    const rowElements = document.createElement('div')
    rowElements.setAttribute('id', 'guessRow-' + guessRowIndex)
    guessRow.forEach((guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-'+ guessRowIndex + '-tile-' + guessIndex )
        tileElement.classList.add('tile')
        rowElements.append(tileElement)
    })
    tileDisplay.append(rowElements)
});

// shows letter when the user clicks on the letter keys 
keys.forEach(key => { 
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClick(key))
    keyboard.append(buttonElement)
});

// handle deleting a letter, entering a guess word, adding a letter (by default)
const handleClick = (letter) => {
    console.log('clicked', letter)
    if (letter === 'DELETE'){
        deleteLetter();
        console.log('guessRows', guessRows);
        return;
    }
    if (letter === 'ENTER'){ 
        const guess = guessRows[currentRow].join('');
        // user has to enter at least 5 letters / a word to be able to enter
        if (guess.length != 5) {
            return;
        }
        checkRow();
        console.log('guessRows', guessRows);
        return;
    }
    addLetter(letter);
};

// adds letter to the tile
const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6){
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
        tile.textContent = letter;
        guessRows[currentRow][currentTile] = letter;
        tile.setAttribute('data', letter);
        currentTile +=1;
        console.log('guessRows', guessRows);
    }
    
};

// deletes a letter from the tile
const deleteLetter = () => {
    if (currentTile > 0){
        currentTile--;
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
        tile.textContent = '';
        guessRows[currentRow][currentTile] = '';
        tile.setAttribute('data', '');
    }
};

// checks if the user has guessed correctly
const checkRow =()=>{
    const guess = guessRows[currentRow].join('');
    flipTile();
    if (currentTile > 4){
        console.log('guess is ' + guess, 'wordle is ' + wordle);
        if (wordle == guess){
            showMessage('Magnificent!!');
            isGameOver = true;
            return;
        }else{
            if(currentRow >= 5){
                isGameOver = false;
                showMessage('Game Over');
                return;
            }
            if (currentRow < 5){
                currentRow++;
                currentTile = 0;
            }
        }
    }
};

// show message to the screen
const showMessage = (message) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageDisplay.append(messageElement);
    setTimeout(() => messageDisplay.removeChild(messageElement), 2000);
};

// shows the colors depending on the user's guess
// green for correct position and letter
// yellow for correct letter but wrong position
// grey for incorrect letter and incorrect position
const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow ).childNodes;
    rowTiles.forEach((tile, index) => {
        const dataLetter = tile.getAttribute('data');

        if (dataLetter == wordle[index]) {
            tile.classList.add('green-overlay');
        }else if (wordle.includes(dataLetter)){
            tile.classList.add('yellow-overlay');
        }else{ 
            tile.classList.add('grey-overlay');
        }
    });
};
