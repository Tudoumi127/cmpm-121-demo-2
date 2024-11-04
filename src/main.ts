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

canvas.addEventListener("mousedown", (pos) => 
{
    x = pos.offsetX;
    y = pos.offsetY;
    drawing = true;
});

canvas.addEventListener("mousemove", (pos) =>
{
    if (drawing){
        drawLine(ctx, x, y, pos.offsetX, pos.offsetY);
        x = pos.offsetX;
        y = pos.offsetY;
    }
});

canvas.addEventListener("mouseup", (pos) => 
{
    if(drawing){
        drawLine(ctx, x, y, pos.offsetX, pos.offsetY);
        drawing = false;
    }
});

function drawLine(context, x1, y1, x2, y2){
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

clear.addEventListener("mousedown", () => 
{
    if(ctx) {
        ctx.fillRect(0, 0, 256, 256);
    }
});