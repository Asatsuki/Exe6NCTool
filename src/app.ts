import { Color, Part, PartUtils, partsData } from "./modules/parts_data";
import Tagify from '@yaireo/tagify'

class PartInstance {
    public constructor (
        public part: Part,
        public color: Color,
        public spin: number,
        public compressed: boolean,
        public x: number,
        public y: number
    ) {}

    public placedMemMap(): boolean[][] | undefined {
        let commandLine = false; // コマンドラインに1マスでもかかっているかどうか（かかっていないとプログラムパーツが無効）
        let internal = false; // 中央5x5に1マスでもかかっているかどうか（かかっていないと置けない）
        const memMap: boolean[][] = Array.from(new Array(mapH), () => new Array(mapW).fill(false));
        const rotated = PartUtils.getRotatedShape(this.part, this.spin);
        for (let pY = 0; pY < partH; pY++) {
            for (let pX = 0; pX < partW; pX++) { // pX, pYはパーツ上の座標
                const mapX = pX - centerX + this.x; // マップ上の対応座標
                const mapY = pY - centerY + this.y; // マップ上の対応座標
                if ((rotated[pY][pX] == 1)) { // この位置にパーツがある
                    if (mapX < 0 || mapX >= mapW || mapY < 0 || mapY >= mapH) {
                        // 枠外にはみ出る
                        return undefined;
                    } else if ((mapX == 0 || mapX == mapW-1) && (mapY == 0 || mapY == mapH-1)) {
                        // 四隅を使う
                        return undefined;
                    } else {
                        memMap[mapY][mapX] = true;
                        if (mapY == 3) commandLine = true; 
                        if (mapX >= 1 && mapX <= 5 && mapY >= 1 && mapY <= 5) internal = true;
                    }
                }
            }
        }
        if (this.part.isProgram && !commandLine) return undefined;
        if (!internal) return undefined;
        return memMap;
    }
}

interface PlaceSet {
    memMap: boolean[][]
    partI: PartInstance
}

interface PrecalcPart {
    part: Part,
    places: PlaceSet[]
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
gridImg.src = "./img/grid.svg";
const commandImg = new Image();
commandImg.src = "./img/command_line.svg";
const memMapImg = new Image();
memMapImg.src = "./img/memory_map.svg";
const partNameImg = new Image();
partNameImg.src = "./img/part_name.svg";

const precalcParts = new Map<string, PrecalcPart>();
const inputElm = document.querySelector('input[name=tags]') as HTMLInputElement;
    
window.addEventListener('DOMContentLoaded', (event) => {
    const partNames: string[] = [];
    partsData.map((el) => {
        partNames.push(el.name);
    });

    const tagify = new Tagify(inputElm, {
        originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
        enforceWhitelist: true,
        whitelist: partNames,
        duplicates: true,
        maxTags: 12,
        dropdown: {
            maxItems: 9999,
            enabled: 0
        }
    });
});

window.onload = () => {
    precalc();
    simulateAsync();
    worker.postMessage("worker start");
}

inputElm.onchange = () => {
    simulateAsync();
}

async function simulateAsync() {
    const partsStr = inputElm.value.split(',');
    const partList: Part[] = [];
    partsStr.map((el) => {
        const part = PartUtils.getPartFromName(el);
        if (part != null) {
            partList.push(part);
        }
    });
    
    const simulated = await simulate(partList);
    draw(simulated);
}

const worker = new Worker(new URL('./workers/simulate.worker.ts', import.meta.url));

worker.onmessage = e => {
    console.log("onmessage: " + e.data);
}

// 各パーツの配置の計算を何回もやるととても時間がかかるので、事前計算する
function precalc() {
    partsData.map((part) => {
        const places: PlaceSet[] = new Array();
        for (let uc = 0; uc < 2; uc++) { // Uncompressed
            const compressed = !uc;
            for (let spin = 0; spin < 4; spin++) {
                for (let pY = 0; pY < mapH; pY++) {
                    for (let pX = 0; pX < mapW; pX++) {
                        const partI = new PartInstance(part, part.colors[0], spin, compressed, pX, pY);
                        const memMap = partI.placedMemMap();
                        if (memMap != null && !places.some((el => JSON.stringify(el.memMap) === JSON.stringify(memMap)))) {
                            places.push({
                                memMap: memMap,
                                partI: partI
                            });
                        }
                    }
                }
            }
        }
        precalcParts.set(part.name, {
            part: part,
            places: places
        });
    });

}

function simulate(partList: Part[]): PartInstance[] | undefined {

    const partTotal = partList.reduce((sum: number, element) => sum + PartUtils.getPartSize(element, true), 0);
    if (partTotal > 45) {
        return undefined;
    }
    
    const partsSorted = partList.sort((a, b) => PartUtils.getPartSize(b, true) - PartUtils.getPartSize(a, true));
        
    const simulated = simulateStep(partsSorted, [], Array.from(new Array(mapH), () => new Array(mapW).fill(false)));
    return simulated;
    
    // 再帰してシミュレート
    function simulateStep(partList: Part[], placed: PartInstance[], memMap: boolean[][]): PartInstance[] | undefined {
        const part = partList[0];
        const precalcPart = precalcParts.get(part.name);
        if (precalcPart == null) return undefined;

        for (let i = 0; i < precalcPart.places.length; i++) {
            const placeSet = precalcPart.places[i];
            const partI = placeSet.partI;
            const newMemMap = place(placeSet.memMap, memMap);
            if (newMemMap != null) {
                const newPartList = partList.concat();
                newPartList.shift();

                const newPlaced = placed.concat();
                newPlaced.push(partI);
                
                if (partList.length <= 1) return newPlaced;

                const next = simulateStep(newPartList, newPlaced, newMemMap);
                if (next != null) {
                    return next;
                }
            }
        }
        return undefined;
    }

    function place(memMapPart: boolean[][], memMapBoard: boolean[][]): boolean[][] | undefined {
        const newMemMap: boolean[][] = Array.from(new Array(mapH), () => new Array(mapW).fill(false));
        for (let pY = 0; pY < mapH; pY++) {
            for (let pX = 0; pX < mapW; pX++) { // pX, pYはパーツ上の座標
                if (memMapPart[pY][pX] && memMapBoard[pY][pX]) return undefined; // 重なるので配置不能
                newMemMap[pY][pX] = memMapPart[pY][pX] || memMapBoard[pY][pX];
            }
        }
        return newMemMap;
    }
}

function draw(parts: PartInstance[] | undefined) {
    const blockW = 64;
    const blockH = 64;
    const mapX = 32;
    const mapY = 32;
    const nameX = 512;
    const nameY = 52;
    const lineWidth = 4;
    const nameHeight = 32;
    const nameWidth = 120;

    
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    // パーツ名の枠を描画
    ctx.drawImage(partNameImg, nameX, nameY);

    // パーツを描画
    if (parts != null) {
        const partsSorted = parts.sort((a, b) => partsData.indexOf(a.part) - partsData.indexOf(b.part))
        partsSorted.map((part, i) => {
            drawPart(part);
            drawPartName(part, i);
        })
    }

    // グリッドを描画
    for (let i = 0; i < mapH; i++) {
        for (let j = 0; j < mapW; j++) {
            if ((i == 0 || i == 6) && (j == 0 || j == 6)) {
                continue;
            }
            ctx.drawImage(gridImg, mapX + j * blockW, mapY + i * blockH);
        }
    }

    // メモリマップを描画
    ctx.drawImage(memMapImg, mapX - blockW / 2, mapY - blockH / 2);

    // コマンドラインを描画
    ctx.drawImage(commandImg, mapX - blockW / 2, mapY - blockH / 2);

    function drawPart(partI: PartInstance) {
        const img = partI.part.isProgram ? partI.color.img_prg : partI.color.img_pls;

        const memMap = partI.placedMemMap();
        if (memMap == null) {
            console.log(`${partI.part.name}の描画に失敗`);
            return;
        };
        //console.log(partI);
        //console.log(prittyPrintMemMap(memMap));
        for (let pY = 0; pY < mapH; pY++) {
            for (let pX = 0; pX < mapW; pX++) {
                if (tryGetBlock(memMap, pX, pY)) {
                    const startX = mapX + pX * blockW;
                    const startY = mapY + pY * blockH;
                    const endX = startX + blockW;
                    const endY = startY + blockH;
                    
                    // ブロック描画
                    ctx.drawImage(img, startX, startY);
                    // 枠線
                    ctx.fillStyle = "black";
                    if (!tryGetBlock(memMap, pX-1, pY-1)) ctx.fillRect(startX, startY, lineWidth, lineWidth);
                    if (!tryGetBlock(memMap, pX, pY-1)) ctx.fillRect(startX, startY, blockW, lineWidth);
                    if (!tryGetBlock(memMap, pX+1, pY-1)) ctx.fillRect(endX-lineWidth, startY, lineWidth, lineWidth);
                    if (!tryGetBlock(memMap, pX-1, pY)) ctx.fillRect(startX, startY, lineWidth, blockH);
                    //
                    if (!tryGetBlock(memMap, pX+1, pY)) ctx.fillRect(endX-lineWidth, startY, lineWidth, blockH);
                    if (!tryGetBlock(memMap, pX-1, pY+1)) ctx.fillRect(startX, endY-lineWidth, lineWidth, lineWidth);
                    if (!tryGetBlock(memMap, pX, pY+1)) ctx.fillRect(startX, endY-lineWidth, blockW, lineWidth);
                    if (!tryGetBlock(memMap, pX+1, pY+1)) ctx.fillRect(endX-lineWidth, endY-lineWidth, lineWidth, lineWidth);
                }
            }
        }

        function tryGetBlock(memMap: boolean[][], x: number, y: number): boolean {
            if (x < 0 || x >= mapW || y < 0 || y >= mapH) {
                return false;
            } else {
                return memMap[y][x];
            }
        }
    }

    function drawPartName(partI: PartInstance, index: number) {
        const xOffset = Math.floor(index / 14) * nameWidth;
        const yOffset = (index % 14) * nameHeight;
        ctx.fillStyle = "white"
        ctx.font = "normal 22px 'ExeChipFont'";
        ctx.fillText(partI.part.name, nameX + 10 + xOffset, nameY + 32 + yOffset);
    }
}

function prittyPrintMemMap(memMap: boolean[][]): string {
    let str = "";
    memMap.map(el => {
        el.map(el => {
            str += el ? "■" : "□";
        })
        str += "\n"
    });
    return str
}


