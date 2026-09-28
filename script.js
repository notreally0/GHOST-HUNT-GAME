const CODES = ['31', '66', 'BOO', '13', '404', '666', 'HACK'];
const SPOOK_ICONS = ['👻', '💀', '☠️', '👹'];
const GRID_SIZE = 5;
const BUFFER_LIMIT = 4;
const SEQUENCE_LEN = 3;

let matrix = [];
let sequence = [];
let buffer = [];
let isRowMode = true;
let activeIndex = -1;
let timer = 20.0;
let timerInterval = null;
let score = 0;
let isGameOver = false;

const matrixEl = document.getElementById('matrix');
const sequenceEl = document.getElementById('sequence');
const bufferEl = document.getElementById('buffer');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const modeEl = document.getElementById('mode-indicator');
const overlay = document.getElementById('overlay');

function initGame() {
    clearInterval(timerInterval);
    isGameOver = false;
    isRowMode = true;
    activeIndex = -1;
    buffer = [];
    timer = 20.0;

    overlay.classList.add('hidden');
    timerEl.innerText = `${timer.toFixed(1)}s`;
    modeEl.innerText = "SELECT ROW 1";

    generateMatrix();
    generateSequence();
    render();
    startTimer();
}

function generateMatrix() {
    matrix = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        matrix.push({
            code: CODES[Math.floor(Math.random() * CODES.length)],
            used: false
        });
    }
}

function generateSequence() {
    sequence = [];
    for (let i = 0; i < SEQUENCE_LEN; i++) {
        sequence.push(CODES[Math.floor(Math.random() * CODES.length)])
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer -= 0.1;
        if (timer <= 0) {
            timer = 0;
            endGame(false, "TIME EXPIRED - DRAGGED TO THE VOID");
        }
        timerEl.innerText = `${timer.toFixed(1)}s`;
    }, 100);
}

function handleCellClick(index) {
    if (isGameOver) return;

    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    if (activeIndex === -1 && row !== 0) return;

    if (activeIndex !== -1) {
        const lastRow = Math.floor(activeIndex / GRID_SIZE);
        const lastCol = activeIndex % GRID_SIZE;

        if (isRowMode && row !== lastRow) return;
        if (!isRowMode && col !== lastCol) return;
    }

    if (matrix[index].used) return;
    
    matrix[index].used = true;
    buffer.push(matrix[index].code);
    activeIndex = index;
    isRowMode = !isRowMode;
    
    modeEl.innerText = isRowMode ? `SELECT ROW ${row + 1}` : `SELECT COL ${col + 1}`; 

    checkGameState();
    render();
}

function checkGameState() {
    const bufferStr = buffer.join('');
    const seqStr = sequence.join('');

    if (bufferStr.includes(seqStr)) {
        score += Math.round(timer * 100);
        scoreEl.innerText = score;
        endGame(true, "HAUNT SUCCESSFUL - SOUL BANISHED");
        return;
    }

    if (buffer.length >= BUFFER_LIMIT) {
        endGame(false, "BUFFER OVERFLOW - CURSED FOEEVER");
    }
}

function endGame(win, message) {
    clearInterval(timerInterval);
    isGameOver = true;
    overlay.classList.remove('hidden', 'win', 'lose');
    overlay.classList.add(win ? 'win' : 'lose');
    document.getElementById('overlay-title').innerText = win ? "GHOST INFILTRATED" : "CURSED";
    document.getElementById('overlay-desc').innerText = message;
}

function render() {
    matrixEl.innerHTML = '';
    const lastRow = activeIndex !== -1 ? Math.floor(activeIndex / GRID_SIZE) : 0;
    const lastCol = activeIndex !== -1 ? activeIndex % GRID_SIZE : -1;

    matrix.forEach((cell, i) => {
        const r = Math.floor(i / GRID_SIZE);
        const c = i % GRID_SIZE;
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        cellEl.innerText = cell.code;

        if (cell.used) {
            cellEl.classList.add('used');
        } else {
            let isSelectable = false;
            if (activeIndex === -1 && r === 0) isSelectable = true;
            else if (activeIndex !== -1) {
                if (isRowMode && r === lastRow) isSelectable = true;
                if (!isRowMode && c === lastCol) isSelectable = true;
            }

            if (isSelectable) cellEl.classList.add('selectable');
            else if ((isRowMode && r === lastRow) || (!isRowMode && c=== lastCol)) {
                cellEl.classList.add('active-row-col');
            }
        }

        cellEl.addEventListener('click', () => handleCellClick(i));
        matrixEl.appendChild(cellEl);
    });

    sequenceEl.innerHTML = '';
    sequence.forEach((code, i) => {
        const node = document.createElement('div');
        node.className = 'sq-node';
        node.innerText = code;

        if (buffer.length > 0 && buffer[i] === code) {
            node.classList.add('matched');
        }
        sequenceEl.appendChild(node);
    });

    bufferEl.innerHTML = '';
    for (let i = 0; i < BUFFER_LIMIT; i++) {
        const buf = document.createElement('div');
        buf.className = 'buf-node';
        if (buffer[i]) {
            buf.innerText = buffer[i];
            buf.classList.add('filled');
        } else {
            buf.innerText = SPOOK_ICONS[i % SPOOK_ICONS.length];
        }
        bufferEl.appendChild(buf);
    }
}

initGame(); 