const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
};

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

const shuffle = array => {
    const clonedArray = [...array];
    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [clonedArray[i], clonedArray[randomIndex]] = [clonedArray[randomIndex], clonedArray[i]];
    }
    return clonedArray;
};

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
};

const generateGame = () => {
    const dimensions = parseInt(selectors.board.getAttribute('data-dimension'), 10);
    if (dimensions % 2 !== 0) {
        throw new Error("The dimensions of the board must be an even number");
    }

    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);

    const cards = 
        `<div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => 
                `<div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>`
            ).join('')}
        </div>`;
    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.board.replaceWith(parser.querySelector('.board'));
    selectors.board = document.querySelector('.board'); // Update reference
};

const startGame = () => {
    if (state.gameStarted) return;

    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerText = `${state.totalFlips} moves`;
        selectors.timer.innerText = `Time: ${state.totalTime} sec`;
    }, 1000);
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;
};

const flipCard = card => {
    if (card.classList.contains('flipped') || state.flippedCards >= 2) return;

    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    card.classList.add('flipped');

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');

        if (flippedCards[0] === flippedCards[1]) {
            setTimeout(() => flipBackCards(), 1000);
            return;
        }

        if (flippedCards[0].querySelector('.card-back').innerText === flippedCards[1].querySelector('.card-back').innerText) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }

        setTimeout(() => {
            flipBackCards();

            if (!document.querySelectorAll('.card:not(.matched)').length) {
                setTimeout(() => {
                    selectors.boardContainer.style.display = 'none'; // Hide board
                    selectors.win.style.display = 'flex'; // Show win message
                    selectors.win.innerHTML = 
                        `<span class="win-text">
                            🎉 You Won! 🎉<br/>
                            with <span class="highlight">${state.totalFlips}</span> moves<br/>
                            under <span class="highlight">${state.totalTime}</span> seconds
                        </span>`;
                    clearInterval(state.loop);
                }, 500);
            }
        }, 1000);
    }
};

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const card = event.target.closest('.card');
        if (card && !card.classList.contains('flipped')) {
            flipCard(card);
        } else if (event.target.nodeName === 'BUTTON' && !event.target.classList.contains('disabled')) {
            startGame();
        }
    });
};

generateGame();
attachEventListeners();
