import { Color, Part, PartUtils, partsData } from "./modules/parts_data";

class Spin{
    public static 0 = new Spin(0);
    public static 90 = new Spin(1);
    public static 180 = new Spin(2);
    public static 270 = new Spin(3);

    public constructor(
        rotate: number // 時計回り90°の回転回数
    ) {}
}

class PartInstance{
    public constructor (
        public ncpart: Part,
        public color: Color,
        public spin: number
    ) {}
}

const mapW = 7;
const mapH = 7;
const partW = 5;
const partH = 5;
const centerX = 2;
const centerY = 2;

const mapCanvas = document.getElementById("mapCanvas") as HTMLCanvasElement;
const ctx = mapCanvas.getContext("2d") as CanvasRenderingContext2D;
const gridImg = new Image();
gridImg.src = "/img/grid.svg";

const memoryMap: PartInstance[] = [];
const partList: Part[] = [];

window.onload = () => {
    draw();
}

function simulate() {
    partList.splice(0);
    partList.push();
}

function draw() {
    const blockW = 64;
    const blockH = 64;
    const mapX = 32;
    const mapY = 32;
    const lineWidth = 8;

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    // パーツを描画
    drawPart(partsData[1], 3, 3);

    // グリッドを描画
    for (let i = 0; i < mapH; i++) {
        for (let j = 0; j < mapW; j++) {
            if ((i == 0 || i == 6) && (j == 0 || j == 6)) {
                continue;
            }
            ctx.drawImage(gridImg, mapX + j * blockW, mapY + i * blockH);
        }
    }

    // 境目を描画
    ctx.fillStyle = "black";

    function drawPart(part: Part, x: number, y: number) {
        const img = part.isProgram ? part.colors[0].img_prg : part.colors[0].img_pls;

        for (let i = 0; i < partH; i++) {
            for (let j = 0; j < partW; j++) {
                if (part.shape[i][j]) {
                    ctx.drawImage(img, mapX+(x+j-centerX)*blockW, mapY+(y+i-centerY)*blockH);
                }
            }
        }
    }
}

