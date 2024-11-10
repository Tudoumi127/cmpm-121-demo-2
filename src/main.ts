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
/*let x = 0;
let y = 0;

let lines: {x: number; y: number; }[][][] = [];
let currentLine: {x: number; y: number; }[][] = [];
let currentStroke: {x: number; y: number; }[];
let recentLine;*/

let lines: Line[] = [];

const redone: Line[] = [];

let currentLine: Line | null;

const drawEvent = new CustomEvent("drawing-changed");

class Line {
    private points: {x: number; y: number;}[] = [];

    constructor(startX: number, startY: number){
        this.points.push({x: startX, y: startY});
    }

    mouseMove(x: number, y: number){
        this.points.push({x, y});
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
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

    /*recentLine = [];

    currentStroke= [{x:pos.offsetX, y:pos.offsetY}];*/
    redone.splice(0, redone.length);
    currentLine = new Line(pos.offsetX, pos.offsetY);
    lines.push(currentLine);
});

canvas.addEventListener("mousemove", (pos) =>
{
    if (drawing){
        /*currentStroke.push({x:pos.offsetX, y:pos.offsetY});
        currentLine.push([...currentStroke]);

        currentStroke.shift();*/

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

        /*currentStroke.push({x:pos.offsetX, y:pos.offsetY});
        currentLine.push([...currentStroke]);

        lines.push([...currentLine]);
        currentLine = [];*/

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

function drawLine(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number){
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

canvas.addEventListener("drawing-changed", function(){
    ctx.fillRect(0, 0, 256, 256);
    for(const line of lines){
        /*for(const stroke of line){
            drawLine(ctx, stroke[0].x, stroke[0].y, stroke[1].x, stroke[1].y);
        }*/
       line.display(ctx);
    }

    /*if(currentLine.length > 0){
        for(const stroke of currentLine){
            drawLine(ctx, stroke[0].x, stroke[0].y, stroke[1].x, stroke[1].y);
        }
    }*/
})

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
