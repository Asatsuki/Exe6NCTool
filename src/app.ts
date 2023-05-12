import { Constants as c, Part, PartInstance, PlaceSet, PrecalcPart, PartUtils, partsData, partNames } from "./modules/parts_data";

import Tagify from '@yaireo/tagify'

const mapCanvas = document.getElementById("mapCanvas") as HTMLCanvasElement;
const ctx = mapCanvas.getContext("2d") as CanvasRenderingContext2D;

const exeChipFont = new FontFace('ExeChipFont', 'url(./font/ExeChipFont.otf)');
exeChipFont.load().then((font) => {
    document.fonts.add(font);
});
const modalImg = new Map<string, HTMLImageElement>(
    ["info", "error"].map((el) => {
        const img = new Image();
        img.src = `./img/modal_${el}.svg`;
        return [el, img]
    }
));
const infoModal = new Image();
infoModal.src = "./img/modal_info.svg";
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
const saveImgButton = document.querySelector('button[name=saveImg]') as HTMLInputElement; 
    
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
            enabled: 0,
            placeAbove: true,
        }
    });
});

const worker = new Worker(new URL('./workers/simulate.worker.ts', import.meta.url), {type: 'module'});

window.onload = () => {
    precalc();
    doSimulate();
}

saveImgButton.onclick = () => {
    mapCanvas.toBlob(blob => {
        if (blob == null) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Exe6NCTool.png`;
        a.click();
        URL.revokeObjectURL(a.href);
    }, "image/png")
}

inputElm.onchange = () => {
    doSimulate();
}

function getPartList(): Part[] {
    const partsStr = inputElm.value.split(',');
    const partList: Part[] = [];
    partsStr.map((el) => {
        const part = PartUtils.getPartFromName(el);
        if (part != null) {
            partList.push(part);
        }
    });
    return partList;
}

let timeId: NodeJS.Timeout | undefined = undefined;

function doSimulate() {
    timeId = setTimeout(() => {drawModal("info", "ケイサンチュウ")}, 50);
    const partList = getPartList();
    worker.postMessage({partList: partList, precalcParts: precalcParts});
}

worker.onmessage = e => {
    clearTimeout(timeId);
    const simulated = e.data.simulated as PartInstance[];
    drawBackground();
    if (simulated != null) {
        drawParts(simulated);
    } else {
        const partList = getPartList();
        partList.sort((a, b) => {return partNames.indexOf(a.name) - partNames.indexOf(b.name)});
        partList.map((el, i) => {
            drawPartName(el.name, i);
        });
    }
    
    drawForeground();
    if (simulated == null) {
        drawModal("error", "ガイトウナシ");
    }
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

const blockW = 64;
const blockH = 64;
const mapX = 32;
const mapY = 32;
const nameX = 512;
const nameY = 52;

function drawBackground() {

    ctx.save();

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    
    // 背景を描画
    ctx.fillStyle = "#1f7ba4";
    ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

    // パーツ名の枠を描画
    ctx.drawImage(partNameImg, nameX, nameY);

    ctx.restore();
}

function drawForeground() {
    ctx.save();

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

    function drawVersion() {
        const urlX = 2;
        const urlY = ctx.canvas.height - 32;
        ctx.fillStyle = "white";
        ctx.textAlign = "left"
        ctx.font = "normal 20px ExeChipFont";
        ctx.drawImage(appUrlImg, urlX, urlY);
    }

    ctx.restore();
}

function drawParts(parts: PartInstance[] | undefined) {
    const lineWidth = 4;
    
    // パーツを描画
    if (parts != null) {
        const partsSorted = [...parts];
        partsSorted.sort((a, b) => partNames.indexOf(a.part.name) - partNames.indexOf(b.part.name));
                
        partsSorted.map((partI, i) => {
            drawPart(partI);
            drawPartName(partI.part.name, i);
        })
    }

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
}

function drawPartName(partName: string, index: number) {
    const nameHeight = 32;
    const nameWidth = 120;

    const xOffset = Math.floor(index / 14) * nameWidth;
    const yOffset = (index % 14) * nameHeight;
    ctx.fillStyle = "white";
    ctx.shadowColor = "#726c69ff";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.textAlign = "left"
    ctx.font = "normal 22px ExeChipFont";
    ctx.fillText(partName, nameX + 10 + xOffset, nameY + 32 + yOffset);
    ctx.shadowColor = "#00000000";
}

function drawModal(type: "info" | "error", message: string) {
    const img = modalImg.get(type) as HTMLImageElement;
    const centerX = 512 / 2;
    const centerY = 512 / 2;
    const modalX = centerX - img.width / 2;
    const modalY = centerY - img.height / 2;
    ctx.drawImage(img, modalX, modalY);

    ctx.fillStyle = "white";
    ctx.shadowColor = "#726c69ff";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.textAlign = "center"
    ctx.font = "normal 26px ExeChipFont";
    ctx.fillText(message, centerX, centerY);
    ctx.shadowColor = "#00000000";
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


