import "./style.css";

const APP_NAME = "I'm dying actually";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = "Demo 2";
app.append(header);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
if(ctx){
    ctx.canvas.width = 256;
    ctx.canvas.height = 256;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 256, 256);
}

app.append(canvas);