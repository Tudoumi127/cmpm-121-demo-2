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

//functions

let drawing = false;
let x = 0;
let y = 0;

let lines: {x: number; y: number; }[][][] = [];
let currentLine: {x: number; y: number; }[][] = [];
let currentStroke: {x: number; y: number; }[];
let recentLine;

const drawEvent = new CustomEvent("drawing-changed");


//event listeners

canvas.addEventListener("mousedown", (pos) => 
{
    drawing = true;

    recentLine = [];

    currentStroke= [{x:pos.offsetX, y:pos.offsetY}];
});

canvas.addEventListener("mousemove", (pos) =>
{
    if (drawing){
        currentStroke.push({x:pos.offsetX, y:pos.offsetY});
        currentLine.push([...currentStroke]);

        currentStroke.shift();
        canvas.dispatchEvent(drawEvent);
    }
});

canvas.addEventListener("mouseup", (pos) => 
{
    if(drawing){
        drawing = false;

        currentStroke.push({x:pos.offsetX, y:pos.offsetY});
        currentLine.push([...currentStroke]);

        lines.push([...currentLine]);
        currentLine = [];

        canvas.dispatchEvent(drawEvent);
    }
});

function drawLine(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number){
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

canvas.addEventListener("drawing-changed", function(drawEvent){
    ctx.fillRect(0, 0, 256, 256);
    for(const line of lines){
        for(const stroke of line){
            drawLine(ctx, stroke[0].x, stroke[0].y, stroke[1].x, stroke[1].y);
        }
    }

    if(currentLine.length > 0){
        for(const stroke of currentLine){
            drawLine(ctx, stroke[0].x, stroke[0].y, stroke[1].x, stroke[1].y);
        }
    }
})

undoButton.addEventListener("mousedown", () => {
    if(lines.length > 0){
        recentLine.push(lines.pop());

        canvas.dispatchEvent(drawEvent);
    }
})

redoButton.addEventListener("mousedown", () => {
    if(recentLine.length > 0) {
        lines.push(recentLine.pop());

        canvas.dispatchEvent(drawEvent);
    }
})

clear.addEventListener("mousedown", () => {
    lines = [];
    currentLine = [];
    canvas.dispatchEvent(drawEvent);
});
