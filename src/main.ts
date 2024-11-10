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


app.append(canvas);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

const clear = document.createElement("button");
clear.innerHTML = "Clear Canvas";
app.append(clear);

const thinpen = document.createElement("button");
thinpen.innerHTML = "Thin Pen";
app.append(thinpen);
thinpen.className = "selected";

const thickpen = document.createElement("button");
thickpen.innerHTML = "Thick Pen";
app.append(thickpen);
thickpen.className = "not-selected";



let drawing = false;
let lines: Line[] = [];
const redone: Line[] = [];
let currentLine: Line | null;
let strokeSize = 1;

const drawEvent = new CustomEvent("drawing-changed");

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


//event listeners

canvas.addEventListener("mousedown", (pos) => 
{
    drawing = true;

    redone.splice(0, redone.length);
    currentLine = new Line(pos.offsetX, pos.offsetY);
    lines.push(currentLine);
});

canvas.addEventListener("mousemove", (pos) =>
{
    if (drawing){

        if(currentLine){
            currentLine.mouseMove(pos.offsetX, pos.offsetY);
        }

        canvas.dispatchEvent(drawEvent);
    }
});

canvas.addEventListener("mouseup", (pos) => 
{
    if(drawing){
        drawing = false;

        if(currentLine){
            currentLine.mouseMove(pos.offsetX, pos.offsetY);
        }

        canvas.dispatchEvent(drawEvent);
    }
});

canvas.addEventListener("mouseout", () => {
    if (drawing){
        drawing = false;
        currentLine = null;
    }
});

canvas.addEventListener("drawing-changed", function(){
    ctx.fillRect(0, 0, 256, 256);
    for(const line of lines){
       line.display(ctx);
    }
})

thinpen.addEventListener("mousedown", () =>{
    strokeSize = 1;
    thinpen.classList.add("selected");
    thinpen.classList.remove("not-selected");
    thickpen.classList.add("not-selected");

    thickpen.classList.remove("selected");
});

thickpen.addEventListener("mousedown", () =>{
    strokeSize = 3;
    thickpen.classList.add("selected");
    thickpen.classList.remove("not-selected");
    thinpen.classList.add("not-selected");
    thinpen.classList.remove("selected");
});

undoButton.addEventListener("mousedown", () => {
    const undo = lines.pop();
    if(undo){
        redone.push(undo);
        canvas.dispatchEvent(drawEvent);
    }
})

redoButton.addEventListener("mousedown", () => {
    const redo = redone.pop();
    if(redo){
        lines.push(redo);

        canvas.dispatchEvent(drawEvent);
    }
})

clear.addEventListener("mousedown", () => {
    lines.splice(0, lines.length);
    currentLine = null;
    canvas.dispatchEvent(drawEvent);
});
