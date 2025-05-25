const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 20;
const gridSize = 30;
let mode = 'bear_trap';
let objects = [];

document.addEventListener('keydown', e => {
    if (e.key === '1') mode = 'bear_trap';
    if (e.key === '2') mode = 'city';
    if (e.key === '3') mode = 'banner';
    if (e.key === '4') mode = 'drag';
    if (e.key === '5') mode = 'train';
    if (e.key.toLowerCase() === 'e') mode = 'erase';
    console.log('Mode:', mode);
    draw();
});

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (mode === 'erase') {
        objects = objects.filter(o => !(o.row === row && o.col === col));
    } else {
        objects.push({ row, col, type: mode });
    }
    draw();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ddd';
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, gridSize * cellSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(gridSize * cellSize, i * cellSize);
        ctx.stroke();
    }

    for (const obj of objects) {
        ctx.fillStyle = obj.type === 'bear_trap' ? 'rgba(255,100,100,0.6)' :
                        obj.type === 'city' ? 'rgba(100,100,255,0.6)' :
                        obj.type === 'banner' ? 'rgba(100,255,100,0.6)' :
                        obj.type === 'train' ? 'rgba(80,80,80,0.8)' : 'black';
        ctx.fillRect(obj.col * cellSize, obj.row * cellSize, cellSize, cellSize);
    }
}

draw();
