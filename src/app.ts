import { Color } from "./modules/parts_data";

const mapCanvas = document.getElementById("mapCanvas") as HTMLCanvasElement;
const ctx = mapCanvas.getContext("2d") as CanvasRenderingContext2D;
const gridImg = new Image();
gridImg.src = "/img/grid.svg";

window.onload = () => {
    draw();
}

function draw() {
    const partW = 64;
    const partH = 64;
    const mapX = 32;
    const mapY = 32;
    const lineWidth = 8;

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    ctx.drawImage(Color.GREEN.img_pls, mapX + 128, mapY + 128);

    // グリッドを描画
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if ((i == 0 || i == 6) && (j == 0 || j == 6)) {
                continue;
            }
            ctx.drawImage(gridImg, mapX + j * partW, mapY + i * partH);
        }
    }

    // 境目を描画
    ctx.fillStyle = "black";
    ctx.fillRect(mapX + 128, mapY + 128, partW / 2, lineWidth);
}