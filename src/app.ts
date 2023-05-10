import { Constants as c, Color, Part, PartInstance, PlaceSet, PrecalcPart, PartUtils, partsData } from "./modules/parts_data";

import Tagify from '@yaireo/tagify'

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
const appUrlImg = new Image();
appUrlImg.src = "./img/app_url.png";

const partPrgImgs = new Map<string, HTMLImageElement>();
const partPlsImgs = new Map<string, HTMLImageElement>();
(function () {
    const colors = ["white", "red", "blue", "green", "yellow", "pink"];
    colors.map((el) => {
        const partPrgImg = new Image();
        partPrgImg.src = `./img/prg_${el}.svg`;
        partPrgImgs.set(el, partPrgImg);
        const partPlsImg = new Image();
        partPlsImg.src = `./img/pls_${el}.svg`;
        partPlsImgs.set(el, partPlsImg);
    });
}());

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
    doSimulate();
}

inputElm.onchange = () => {
    doSimulate();
}

function doSimulate() {
    const partsStr = inputElm.value.split(',');
    const partList: Part[] = [];
    partsStr.map((el) => {
        const part = PartUtils.getPartFromName(el);
        if (part != null) {
            partList.push(part);
        }
    });
    
    worker.postMessage({partList: partList, precalcParts: precalcParts});
    
}

const worker = new Worker(new URL('./workers/simulate.worker.ts', import.meta.url), {type: 'module'});

worker.onmessage = e => {
    const simulated = e.data.simulated as PartInstance[];
    draw(simulated);
}

// 各パーツの配置の計算を何回もやるととても時間がかかるので、事前計算する
function precalc() {
    partsData.map((part) => {
        const places: PlaceSet[] = new Array();
        for (let uc = 0; uc < 2; uc++) { // Uncompressed
            const compressed = !uc;
            for (let spin = 0; spin < 4; spin++) {
                for (let pY = 0; pY < c.mapH; pY++) {
                    for (let pX = 0; pX < c.mapW; pX++) {
                        const partI = new PartInstance(part, part.colors[0], spin, compressed, pX, pY);
                        const memMap = PartUtils.getPlacedMemMap(partI);
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

    ctx.save();

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
    for (let i = 0; i < c.mapH; i++) {
        for (let j = 0; j < c.mapW; j++) {
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

    drawVersion();

    ctx.restore();

    function drawPart(partI: PartInstance) {
        ctx.restore();
        
        const img = partI.part.isProgram ? partPrgImgs.get(partI.color.name) as HTMLImageElement : partPlsImgs.get(partI.color.name) as HTMLImageElement;

        const memMap = PartUtils.getPlacedMemMap(partI);
        if (memMap == null) {
            console.log(`${partI.part.name}の描画に失敗`);
            return;
        };
        //console.log(partI);
        //console.log(prittyPrintMemMap(memMap));
        for (let pY = 0; pY < c.mapH; pY++) {
            for (let pX = 0; pX < c.mapW; pX++) {
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
            if (x < 0 || x >= c.mapW || y < 0 || y >= c.mapH) {
                return false;
            } else {
                return memMap[y][x];
            }
        }
    }

    function drawPartName(partI: PartInstance, index: number) {
        const xOffset = Math.floor(index / 14) * nameWidth;
        const yOffset = (index % 14) * nameHeight;
        ctx.fillStyle = "white";
        ctx.shadowColor = "#726c69ff";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.textAlign = "left"
        ctx.font = "normal 22px 'ExeChipFont'";
        ctx.fillText(partI.part.name, nameX + 10 + xOffset, nameY + 32 + yOffset);
        ctx.shadowColor = "#00000000";
    }

    function drawVersion() {
        const versionX = 2;
        const versionY = 20;
        const urlX = 2;
        const urlY = ctx.canvas.height - 32;
        ctx.fillStyle = "white";
        ctx.textAlign = "left"
        ctx.font = "normal 18px 'ExeChipFont'";
        ctx.fillText("ロックマンエグゼ6 ナビカスシミュレータ", versionX, versionY);
        ctx.fillText("V1.1.0", versionX, versionY + 20);
        ctx.drawImage(appUrlImg, urlX, urlY);
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


