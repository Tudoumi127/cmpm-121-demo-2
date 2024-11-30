import "./style.css";

const APP_NAME = "We Have CSP at Home";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const header = document.createElement("h2");
header.innerHTML = APP_NAME;
app.append(header);

//thank you to Katrina Vanarsdale for the style/container help
//https://github.com/rndmcnlly/cmpm-121-demo-2/commit/0399c7ba87ef474b8a2e53c52fbd483efcf848f5#diff-4fab5baaca5c14d2de62d8d2fceef376ddddcc8e9509d86cfa5643f51b89ce3dR32

const container = document.createElement("div");
container.style.display = "flex";
container.style.justifyContent = "space-between";
container.style.margin = "20px";
app.append(container);
const settings = document.createElement("div");
settings.className = "column";
container.append(settings);
const canvasCol = document.createElement("div");
container.append(canvasCol);
canvasCol.className = "column";
canvasCol.style.flex = "1";
const brushSettings = document.createElement("div");
brushSettings.className = "column";
container.append(brushSettings);

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
canvasCol.append(canvas);

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 500, 500);
ctx.font = "32px monospace";

// Buttons
const undoButton = document.createElement("button");
createButtons(undoButton, "Undo", false);
undoButton.addEventListener("click", () => undoRedo(lines, redone));

const redoButton = document.createElement("button");
createButtons(redoButton, "Redo", false);
redoButton.addEventListener("click", () => undoRedo(redone, lines));

const exportButton = document.createElement("button");
createButtons(exportButton, "Export", false, exportCanvas);

const clear = document.createElement("button");
createButtons(clear, "Clear Canvas", false, cleared);

const thinpen = document.createElement("button");
createButtons(thinpen, "Thin Pen", true);
thinpen.className = "selected";
thinpen.addEventListener("click", () => size(thinpen, thickpen, 2));

const thickpen = document.createElement("button");
createButtons(thickpen, "Thick Pen", true);
thickpen.addEventListener("click", () => size(thickpen, thinpen, 5));

//emotes

const emote1 = document.createElement("button");
createButtons(emote1, "🪭", true, stamp);

const emote2 = document.createElement("button");
createButtons(emote2, "🏮", true, stamp);

const emote3 = document.createElement("button");
createButtons(emote3, "🧧", true, stamp);

const customEmo = document.createElement("button");
createButtons(customEmo, "Create Stamp", false);

const slideCon = document.createElement("div");
slideCon.className = "sliderContainer";
const slider = document.createElement("input");
slider.type = "range";
slider.min = "0";
slider.max = "1530";
slider.value = "0";
slider.className = "slider";
slider.style.setProperty('--thumb-color', "rgb(255,0,0)");
app.append(slideCon);
slideCon.append(slider);
let r: number = 255;
let g: number = 0;
let b: number = 0;
slider.oninput = function() {
    const val = Number(slider.value);
    if(val < 255) {
        r = 255;
        g = val;
        b = 0;
    } else if (val < 510) {
        r = 510 - val;
        g = 255;
        b = 0;
    } else if (val < 765) {
        r = 0;
        g = 255;
        b = val - 510; 
    } else if (val < 1020) {
        r = 0;
        g = 1020 - val; 
        b = 255;
    } else if (val < 1275) {
        r = val - 1020;
        g = 0;
        b = 255;
    } else {
        r = 255;
        g = 0;
        b = 1530 - val; 
    }
    color = `rgb(${r},${g},${b})`;
    slider.style.setProperty('--thumb-color', color);
  }


let drawing = false;
const lines: mark[] = [];
const redone: mark[] = [];
let currentLine: Line | null;
const drawEvent = new CustomEvent("drawing-changed");
const toolEvent = new CustomEvent("tool-moved");

let strokeSize = 2;
let color = "rgb(255,0,0)";
let cursor: Cursor | null;
let emoteButton: HTMLButtonElement | null;
let currentEmo: placedStamp | null;
let initialPos: {x: number, y: number};

interface mark {
    line: Line | undefined;
    stamp: placedStamp | undefined;
}

interface placedStamp{
    shape: string;
    x: number;
    y: number;
    rotation: number;
}

interface Cursor{
    shape: string;
    x: number;
    y: number;
}

class Line {
    private points: {x: number; y: number;}[] = [];
    private stroke: number;
    private strokeColor: string;

    constructor(startX: number, startY: number){
        this.points.push({x: startX, y: startY});
        this.stroke = strokeSize;
        this.strokeColor = color;
    }

    mouseMove(x: number, y: number){
        this.points.push({x, y});
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.stroke;
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for(let i = 0; i < this.points.length; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        ctx.stroke();
        ctx.closePath();
    }
}

//button functions

function createButtons(button: HTMLButtonElement, value: string, brush: boolean, func?: (button: HTMLButtonElement) => void | void| undefined){
    button.innerHTML = value;

    if(func){
        button.addEventListener("click", () => func(button));
    }

    if(!brush){
        settings.appendChild(button);
    }
    else{
        brushSettings.appendChild(button);
    }

    if(button.innerHTML != "Thin" && brush){
        button.className = "not-selected"
    }
}

function drawCanvasContent(ctxCan: CanvasRenderingContext2D) {
    ctxCan.fillStyle = 'white';
    ctxCan.fillRect(0,0, 500, 500);
    for (const {line, stamp} of lines) {
        if(line) {
            line.display(ctxCan);
        }
        if(stamp) {
            ctxCan.save();
            ctxCan.translate(stamp.x, stamp.y); 
            ctxCan.rotate(stamp.rotation || 0); 
            ctxCan.fillStyle = 'black';
            ctxCan.fillText(stamp.shape, -8,16);
            ctxCan.restore();
        }
    }
}

function stamp(button: HTMLButtonElement){
    if(emoteButton){
        changeClass(emoteButton);
    }
    emoteButton = button;
    changeClass(button);
    if(thinpen.className == "selected"){
        changeClass(thinpen);
    }
    else if(thickpen.className == "selected"){
        changeClass(thickpen);
    }
}

function changeClass(button: HTMLButtonElement){
    if(button.className == "not-selected"){
        button.classList.add("selected");

        button.classList.remove("not-selected");
    }
    else{
        button.classList.add("not-selected");

        button.classList.remove("selected");
    }
}

function cleared(){
    lines.splice(0, lines.length);
    currentLine = null;
    canvas.dispatchEvent(drawEvent);
}

function undoRedo(remove: Array<mark>, add: Array<mark>){
    const removedLine = remove.pop();
    if(removedLine){
        add.push(removedLine);
    }
    canvas.dispatchEvent(drawEvent);
}

function size(newSize: HTMLButtonElement, oldSize: HTMLButtonElement, size: number){
    if(strokeSize != size || emoteButton) {
        strokeSize = size;
        changeClass(newSize);
        if (emoteButton) {
            changeClass(emoteButton);
            emoteButton = null;
        } else {
            changeClass(oldSize);
        }
    }
}

function draw(cursor: Cursor, ctx: CanvasRenderingContext2D) {
    if(emoteButton) {
        cursor.shape = emoteButton.innerHTML;
    } else {
        cursor.shape = "*"
    }
    
    ctx.fillStyle = "black";
    ctx.fillText(cursor.shape, cursor.x - 8,cursor.y + 16);
}

function exportCanvas() {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1200;
    tempCanvas.height = 1200;
    const tempCtx = tempCanvas.getContext("2d") as CanvasRenderingContext2D;;
    tempCtx.scale(4,4);
    tempCtx.font = "32px monospace";
    drawCanvasContent(tempCtx);
    
    const anchor = document.createElement("a");
    anchor.href = tempCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
}

//event listeners

canvas.addEventListener("mousedown", (pos) => {
    drawing = true;
    redone.splice(0, redone.length);

    if (emoteButton) {
        currentEmo = {shape: emoteButton.innerHTML, x: pos.offsetX, y: pos.offsetY, rotation: 0}
        lines.push({line: undefined, stamp: currentEmo});
        initialPos = {x: pos.offsetX, y: pos.offsetY};
    } else {
        currentLine = new Line(pos.offsetX, pos.offsetY);
        lines.push({line: currentLine, stamp: undefined});
    }
});

canvas.addEventListener("mousemove", (pos) => {
    if (drawing) {
        if (currentLine) {
            currentLine.mouseMove(pos.offsetX, pos.offsetY);
        }
        if (emoteButton && currentEmo) { 
            const dx = pos.offsetX - initialPos.x;
            const dy = pos.offsetY - initialPos.y;
            const angle = Math.atan2(dy, dx);
            currentEmo.rotation = angle;
        }
        canvas.dispatchEvent(drawEvent);
    } else if(cursor) {
        cursor.x = pos.offsetX;
        cursor.y = pos.offsetY;
        canvas.dispatchEvent(toolEvent);
    }

});

canvas.addEventListener("mouseup", (pos) => {
    if (drawing) {
        drawing = false;
        if (currentLine) {
            currentLine.mouseMove(pos.offsetX, pos.offsetY);
        }
        canvas.dispatchEvent(drawEvent);    
    }
});

canvas.addEventListener("mouseout", () => {
    if (drawing || currentLine){
        drawing = false;
        currentLine = null;
    }
    cursor = null;
    canvas.dispatchEvent(drawEvent);
});

canvas.addEventListener("mouseenter", () => {
    cursor = {shape: "*", x: 0, y: 0};
});

canvas.addEventListener("drawing-changed", function(){
    drawCanvasContent(ctx);
})

canvas.addEventListener("tool-moved", function(){
    if(!drawing){
        canvas.dispatchEvent(drawEvent);
    }
    if(cursor){
        draw(cursor, ctx);
    }
})

customEmo.addEventListener("click", () => {
    const sticker = prompt("Custom stamp", "❤️");
    if(sticker) {
        const newButton = document.createElement("button");
        createButtons(newButton, sticker, true, stamp);
    }
})