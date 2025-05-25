const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 30;
const baseCellSize = 20;
let scale = 1.0;
let mode = 'bear_trap';
let objects = [];
let draggingObject = null;

canvas.width = gridSize * baseCellSize;
canvas.height = gridSize * baseCellSize;

document.addEventListener('keydown', e => {
    if (e.key === '1') mode = 'bear_trap';
    if (e.key === '2') mode = 'city';
    if (e.key === '3') mode = 'banner';
    if (e.key === '4') mode = 'drag';
    if (e.key === '5') mode = 'train';
    if (e.key.toLowerCase() === 'e') mode = 'erase';
    draw();
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    scale *= e.deltaY < 0 ? 1.1 : 0.9;
    draw();
});

canvas.addEventListener('mousedown', e => {
    const [col, row] = getGridPos(e);
    if (e.button === 2) {
        renameObject(row, col);
    } else {
        if (mode === 'erase') {
            eraseObject(row, col);
        } else if (mode === 'drag') {
            startDrag(row, col);
        } else {
            placeObject(row, col, mode);
        }
    }
    draw();
});

canvas.addEventListener('mouseup', e => {
    if (draggingObject && mode === 'drag') {
        const [col, row] = getGridPos(e);
        draggingObject.row = row;
        draggingObject.col = col;
        objects.push(draggingObject);
        draggingObject = null;
        draw();
    }
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

function getGridPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return [Math.floor(x / baseCellSize), Math.floor(y / baseCellSize)];
}

function placeObject(row, col, type) {
    const size = type === 'bear_trap' ? 3 : type === 'city' ? 2 : 1;
    for (const obj of objects) {
        if (overlaps(row, col, size, obj)) return;
    }
    const label = type === 'bear_trap' ? 'Bear' : type === 'city' ? 'City' : '';
    objects.push({ type, row, col, size, label });
}

function eraseObject(row, col) {
    objects = objects.filter(obj => !(obj.row <= row && row < obj.row + obj.size &&
                                      obj.col <= col && col < obj.col + obj.size));
}

function renameObject(row, col) {
    for (const obj of objects) {
        if (obj.type !== 'banner' && obj.type !== 'train' &&
            obj.row <= row && row < obj.row + obj.size &&
            obj.col <= col && col < obj.col + obj.size) {
            const newLabel = prompt('Enter new name:', obj.label);
            if (newLabel !== null) obj.label = newLabel;
            break;
        }
    }
}

function startDrag(row, col) {
    for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        if (obj.type !== 'train' &&
            obj.row <= row && row < obj.row + obj.size &&
            obj.col <= col && col < obj.col + obj.size) {
            draggingObject = obj;
            objects.splice(i, 1);
            break;
        }
    }
}

function overlaps(row, col, size, obj) {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            for (let or = 0; or < obj.size; or++) {
                for (let oc = 0; oc < obj.size; oc++) {
                    if ((row + r) === (obj.row + or) && (col + c) === (obj.col + oc)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function draw() {
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);

    ctx.strokeStyle = '#ddd';
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * baseCellSize, 0);
        ctx.lineTo(i * baseCellSize, gridSize * baseCellSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * baseCellSize);
        ctx.lineTo(gridSize * baseCellSize, i * baseCellSize);
        ctx.stroke();
    }

    for (const obj of objects) {
        ctx.fillStyle = obj.type === 'bear_trap' ? 'rgba(255,100,100,0.6)' :
                        obj.type === 'city' ? 'rgba(100,100,255,0.6)' :
                        obj.type === 'banner' ? 'rgba(100,255,100,0.6)' :
                        obj.type === 'train' ? 'rgba(80,80,80,0.8)' : 'black';
        ctx.fillRect(obj.col * baseCellSize, obj.row * baseCellSize,
                     obj.size * baseCellSize, obj.size * baseCellSize);

        if (obj.label) {
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText(obj.label, obj.col * baseCellSize + 2, obj.row * baseCellSize + 12);
        }

        if (obj.type === 'banner') {
            ctx.fillStyle = 'rgba(180,255,180,0.3)';
            const startRow = obj.row - 3;
            const startCol = obj.col - 3;
            for (let r = startRow; r < startRow + 7; r++) {
                for (let c = startCol; c < startCol + 7; c++) {
                    if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                        ctx.fillRect(c * baseCellSize, r * baseCellSize, baseCellSize, baseCellSize);
                    }
                }
            }
        }
    }

    ctx.restore();
}

draw();
