import "./style.css";

const APP_NAME = "I'm dying actually";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = "Demo 2";
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);
ctx.font = "32px monospace";

app.append(canvas);

const undoButton = document.createElement("button");
createButtons(undoButton, "Undo", false);

const redoButton = document.createElement("button");
createButtons(redoButton, "Redo", false);

const clear = document.createElement("button");
createButtons(clear, "Clear Canvas", false);

const thinpen = document.createElement("button");
createButtons(thinpen, "Thin Pen", true);
thinpen.className = "selected";

const thickpen = document.createElement("button");
createButtons(thickpen, "Thick Pen", true);
//thickpen.className = "not-selected";

const emote1 = document.createElement("button");
createButtons(emote1, "🪭", true);
emote1.addEventListener("click", () => stamp(emote1));

const emote2 = document.createElement("button");
createButtons(emote2, "🏮", true);
emote2.addEventListener("click", () => stamp(emote2));

const emote3 = document.createElement("button");
createButtons(emote3, "🧧", true);
emote3.addEventListener("click", () => stamp(emote3));

const customEmo = document.createElement("button");
createButtons(customEmo, "Create Stamp", false);


let drawing = false;
const lines: Line[] = [];
const redone: Line[] = [];
let currentLine: Line | null;
const drawEvent = new CustomEvent("drawing-changed");
const toolEvent = new CustomEvent("tool-moved");

let strokeSize = 1;
let cursor: Cursor | null;
let emoteButton: HTMLButtonElement | null;
let currentEmo: placedStamp | null;
let initialPos: {x: number, y: number};
const placedEmo: placedStamp[] = [];

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

    constructor(startX: number, startY: number){
        this.points.push({x: startX, y: startY});
        this.stroke = strokeSize;
    }

    mouseMove(x: number, y: number){
        this.points.push({x, y});
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeStyle = "black";
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
function createButtons(button: HTMLButtonElement, value: string, brush: boolean){
    button.innerHTML = value;
    app.append(button);
    if(button.innerHTML != "This" && brush){
        button.className = "not-selected"
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

function draw(cursor: Cursor, ctx: CanvasRenderingContext2D) {
    if(emoteButton) {
        cursor.shape = emoteButton.innerHTML;
    } else {
        cursor.shape = "*"
    }
    
    ctx.fillStyle = "black";
    ctx.fillText(cursor.shape, cursor.x - 8,cursor.y + 16);
}

//event listeners

canvas.addEventListener("mousedown", (pos) => {
    drawing = true;
    redone.splice(0, redone.length);

    if (emoteButton) {
        currentEmo = {shape: emoteButton.innerHTML, x: pos.offsetX, y: pos.offsetY, rotation: 0}
        placedEmo.push(currentEmo);
        initialPos = {x: pos.offsetX, y: pos.offsetY};
    } else {
        currentLine = new Line(pos.offsetX, pos.offsetY);
        lines.push(currentLine);
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 256, 256);
    for(const line of lines){
       line.display(ctx);
    }
    for(const emote of placedEmo){
        ctx.save();
        ctx.translate(emote.x, emote.y);
        ctx.rotate(emote.rotation || 0);
        ctx.font = "32px monospace";
        ctx.fillStyle = "black";
        ctx.fillText(emote.shape, emote.x - 8, emote.y + 16);
        ctx.restore();
    }
})

canvas.addEventListener("tool-moved", function(){
    if(!drawing){
        canvas.dispatchEvent(drawEvent);
    }
    if(cursor){
        draw(cursor, ctx);
    }
})

thinpen.addEventListener("click", () =>{
    strokeSize = 1;
    
    changeClass(thinpen);
    if(emoteButton){
        changeClass(emoteButton);
        emoteButton = null;
    }
    else{
        changeClass(thickpen);
    }
});

thickpen.addEventListener("click", () =>{
    strokeSize = 3;
   
    changeClass(thickpen);
    if(emoteButton){
        changeClass(emoteButton);
        emoteButton = null;
    }
    else{
        changeClass(thinpen);
    }
});

undoButton.addEventListener("click", () => {
    const undo = lines.pop();
    if(undo){
        redone.push(undo);
        canvas.dispatchEvent(drawEvent);
    }
})

redoButton.addEventListener("click", () => {
    const redo = redone.pop();
    if(redo){
        lines.push(redo);

        canvas.dispatchEvent(drawEvent);
    }
})

clear.addEventListener("click", () => {
    lines.splice(0, lines.length);
    currentLine = null;
    canvas.dispatchEvent(drawEvent);
});

customEmo.addEventListener("click", () => {
    const sticker = prompt("Custom stamp", "❤️");
    if(sticker) {
        const newButton = document.createElement("button");
        createButtons(newButton, sticker, true);
        newButton.addEventListener("click", () => stamp(newButton));
    }
    
})
