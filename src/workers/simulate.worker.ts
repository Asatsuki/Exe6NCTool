import { Constants as c, PartUtils, Part, PartInstance, PrecalcPart } from "../modules/parts_data";

const ctx: Worker = self as any;

function simulate(partList: Part[], precalcParts: Map<string, PrecalcPart> ): PartInstance[] | undefined {

    const partTotal = partList.reduce((sum: number, element) => sum + PartUtils.getPartSize(element, true), 0);
    if (partTotal > 45) {
        return undefined;
    }
    
    const partsSorted = partList.sort((a, b) => PartUtils.getPartSize(b, true) - PartUtils.getPartSize(a, true));
        
    const simulated = simulateStep(partsSorted, [], Array.from(new Array(c.mapH), () => new Array(c.mapW).fill(false)));
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
        const newMemMap: boolean[][] = Array.from(new Array(c.mapH), () => new Array(c.mapW).fill(false));
        for (let pY = 0; pY < c.mapH; pY++) {
            for (let pX = 0; pX < c.mapW; pX++) { // pX, pYはパーツ上の座標
                if (memMapPart[pY][pX] && memMapBoard[pY][pX]) return undefined; // 重なるので配置不能
                newMemMap[pY][pX] = memMapPart[pY][pX] || memMapBoard[pY][pX];
            }
        }
        return newMemMap;
    }
}


ctx.onmessage = e => {
    const partList = e.data.partList;
    const precalcParts = e.data.precalcParts;
    const simulated = simulate(partList, precalcParts);
    if (simulated != null) {
        console.log(simulated[0].constructor.name);
    ctx.postMessage({simulated: simulated});
    } else {
        
    }
    
}