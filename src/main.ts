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

const clear = document.createElement("button");
clear.innerHTML = "Clear Canvas";
app.append(clear);

//functions

let drawing = false;
let x = 0;
let y = 0;

let lines: {x: number; y: number; }[][] = [];
let currentLine: {x: number; y: number; }[];

const drawEvent = new CustomEvent("drawing-changed");

canvas.addEventListener("mousedown", (pos) => 
{
    drawing = true;
    currentLine = [{x:pos.offsetX, y:pos.offsetY}];
});

canvas.addEventListener("mousemove", (pos) =>
{
    if (drawing){
        currentLine.push({x:pos.offsetX, y:pos.offsetY});
        lines.push([...currentLine]);
        currentLine.shift();
        canvas.dispatchEvent(drawEvent);
    }
});

canvas.addEventListener("mouseup", (pos) => 
{
    if(drawing){
        drawing = false;
        currentLine.push({x:pos.offsetX, y:pos.offsetY});
        lines.push([...currentLine]);
        currentLine.shift();
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
        drawLine(ctx, line[0].x, line[0].y, line[1].x, line[1].y);
    }
})

clear.addEventListener("mousedown", () => {
    lines = [];
});