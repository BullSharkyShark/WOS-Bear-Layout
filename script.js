const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let cellSize = 20;
const gridSize = 30;
let mode = 'bear_trap';
let objects = [];
let scale = 1;
let draggingObject = null;

// Mode switch by keyboard
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

// Zoom with mouse wheel
canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) scale *= zoomFactor;
    else scale /= zoomFactor;
    draw();
});

// Left click
canvas.addEventListener('click', e => {
    const [col, row] = getMouseGridPos(e);
    if (mode === 'erase') {
        eraseObject(row, col);
    } else if (mode === 'drag') {
        startDrag(row, col);
    } else {
        placeObject(row, col, mode);
    }
    draw();
});

// Right click for renaming
canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const [col, row] = getMouseGridPos(e);
    renameObject(row, col);
    draw();
});

function getMouseGridPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return [Math.floor(x / cellSize), Math.floor(y / cellSize)];
}

function placeObject(row, col, type) {
    const size = type === 'bear_trap' ? 3 : type === 'city' ? 2 : 1;

    // Prevent overlap
    for (const obj of objects) {
        if (overlaps(row, col, size, obj)) return;
    }

    const label = type === 'bear_trap' ? 'Bear' : type === 'city' ? 'City' : '';

    objects.push({
        type,
        row,
        col,
        size,
        label
    });
}

function eraseObject(row, col) {
    objects = objects.filter(obj => {
        return !(obj.row <= row && row < obj.row + obj.size &&
                 obj.col <= col && col < obj.col + obj.size);
    });
}

function renameObject(row, col) {
    for (const obj of objects) {
        if (obj.type === 'banner' || obj.type === 'train') continue;
        if (obj.row <= row && row < obj.row + obj.size &&
            obj.col <= col && col < obj.col + obj.size) {
            const newName = prompt('Enter new name:', obj.label || '');
            if (newName !== null) obj.label = newName;
            break;
        }
    }
}

function startDrag(row, col) {
    for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        if (obj.type === 'train') continue;
        if (obj.row <= row && row < obj.row + obj.size &&
            obj.col <= col && col < obj.col + obj.size) {
            draggingObject = obj;
            objects.splice(i, 1);
            break;
        }
    }
}

canvas.addEventListener('mouseup', e => {
    if (draggingObject && mode === 'drag') {
        const [col, row] = getMouseGridPos(e);
        draggingObject.row = row;
        draggingObject.col = col;
        objects.push(draggingObject);
        draggingObject = null;
        draw();
    }
});

function overlaps(row, col, size, obj) {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            for (let or = 0; or < obj.size; or++) {
                for (let oc = 0; oc < obj.size; oc++) {
                    if (row + r === obj.row + or && col + c === obj.col + oc) {
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

    // Grid
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

    // Objects
    for (const obj of objects) {
        ctx.fillStyle = obj.type === 'bear_trap' ? 'rgba(255,100,100,0.6)' :
                        obj.type === 'city' ? 'rgba(100,100,255,0.6)' :
                        obj.type === 'banner' ? 'rgba(100,255,100,0.6)' :
                        obj.type === 'train' ? 'rgba(80,80,80,0.8)' : 'black';
        ctx.fillRect(obj.col * cellSize, obj.row * cellSize, obj.size * cellSize, obj.size * cellSize);

        // Label
        if (obj.label) {
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText(obj.label, obj.col * cellSize + 2, obj.row * cellSize + 12);
        }

        // Banner area of effect
        if (obj.type === 'banner') {
            ctx.fillStyle = 'rgba(180,255,180,0.3)';
            const startRow = obj.row - 3;
            const startCol = obj.col - 3;
            for (let r = startRow; r < startRow + 7; r++) {
                for (let c = startCol; c < startCol + 7; c++) {
                    if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                    }
                }
            }
        }
    }

    ctx.restore();
}

draw();
