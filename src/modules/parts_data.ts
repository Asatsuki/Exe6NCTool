export namespace Constants {
    export const mapW = 7;
    export const mapH = 7;
    export const partW = 5;
    export const partH = 5;
    export const centerX = 2;
    export const centerY = 2;
}

export class Color {
    public static WHITE = new Color("white");
    public static RED = new Color("red");
    public static BLUE = new Color("blue");
    public static GREEN = new Color("green");
    public static YELLOW = new Color("yellow");
    public static PINK = new Color("pink");

    public constructor(
        public name: string
    ) { }
}

export class PartInstance {
    public constructor (
        public part: Part,
        public color: Color,
        public spin: number,
        public compressed: boolean,
        public x: number,
        public y: number
    ) {}
}

export interface PlaceSet {
    memMap: boolean[][]
    partI: PartInstance
}

export interface PrecalcPart {
    part: Part,
    places: PlaceSet[]
}

export interface Part {
    name: string;
    isProgram: boolean;
    colors: Color[];
    compress: string;
    shape: number[][]; // 0:空白、1:パーツ、2:圧縮で消えるパーツ
}

export namespace PartUtils {

    export function getPartFromName(name: string): Part | undefined {
        return partsData.find(x => x.name == name);
    }

    export function getPartSize(part: Part, isCompressed: boolean): number {
        if (isCompressed) {
            return part.shape.flat().filter(x => x == 1).length;
        } else {
            return part.shape.flat().filter(x => x == 1 || x == 2).length;
        }
    }

    export function getRotatedShape(part: Part, spin: number): number[][] {
        let shape = part.shape;
        spin = spin % 4;
        for (let i = 0; i < spin; i++) {
            shape = [...shape].reverse(); // 上下反転して
            shape = shape[0].map(
                (_: any, i: number) => shape.map(row => row[i])
            ); // 転置すると時計回りに回転する
        }
        return shape;
    }

    export function getPlacedMemMap(partI: PartInstance): boolean[][] | undefined {
        let commandLine = false; // コマンドラインに1マスでもかかっているかどうか（かかっていないとプログラムパーツが無効）
        let internal = false; // 中央5x5に1マスでもかかっているかどうか（かかっていないと置けない）
        const memMap: boolean[][] = Array.from(new Array(Constants.mapH), () => new Array(Constants.mapW).fill(false));
        const rotated = PartUtils.getRotatedShape(partI.part, partI.spin);
        for (let pY = 0; pY < Constants.partH; pY++) {
            for (let pX = 0; pX < Constants.partW; pX++) { // pX, pYはパーツ上の座標
                const mapX = pX - Constants.centerX + partI.x; // マップ上の対応座標
                const mapY = pY - Constants.centerY + partI.y; // マップ上の対応座標
                if ((rotated[pY][pX] == 1)) { // この位置にパーツがある
                    if (mapX < 0 || mapX >= Constants.mapW || mapY < 0 || mapY >= Constants.mapH) {
                        // 枠外にはみ出る
                        return undefined;
                    } else if ((mapX == 0 || mapX == Constants.mapW-1) && (mapY == 0 || mapY == Constants.mapH-1)) {
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
        if (partI.part.isProgram && !commandLine) return undefined;
        if (!internal) return undefined;
        return memMap;
    }
}

export const partsData: Part[] = [
    {
        name: "スーパーアーマー",
        isProgram: true,
        colors: [Color.RED],
        compress: "ABLLAALRBA",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,1,1,1,0],
            [0,2,2,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "カスタム1",
        isProgram: true,
        colors: [Color.BLUE],
        compress: "LBBRBAALRR",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,2,1,2,0],
            [0,0,1,1,0],
            [0,0,0,0,0],
        ]
    },
        {
        name: "カスタム2",
        isProgram: true,
        colors: [Color.WHITE],
        compress: "RALLAABRBA",
        shape:[
            [0,0.2,2,0],
            [0,0,1,1,0],
            [0,0,1,1,0],
            [0,0,1,1,0],
            [0,0,1,2,0],
        ]
    },
    {
        name: "メガフォルダ1",
        isProgram: true,
        colors: [Color.GREEN],
        compress: "ARLALALLAB",
        shape:[
            [0,0,0,0,0],
            [0,0,0,2,0],
            [0,1,1,1,0],
            [0,0,0,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "メガフォルダ2",
        isProgram: true,
        colors: [Color.WHITE],
        compress: "LALRBLRLRA",
        shape:[
            [0,0,0,0,0],
            [0,0,2,1,0],
            [0,1,1,1,0],
            [0,0,1,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ギガフォルダ1",
        isProgram: true,
        colors: [Color.RED],
        compress: "BLBRLLLABA",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,1,1,1,0],
            [2,1,1,1,2],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ファーストバリア",
        isProgram: true,
        colors: [Color.BLUE],
        compress: "BBARABLARR",
        shape:[
            [0,0,0,0,0],
            [0,2,1,2,0],
            [0,2,1,1,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "シールド",
        isProgram: true,
        colors: [Color.BLUE],
        compress: "RBBBAAABRL",
        shape:[
            [0,0,0,0,0],
            [0,0,1,1,2],
            [0,0,1,0,0],
            [0,0,2,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "リフレクト",
        isProgram: true,
        colors: [Color.GREEN],
        compress: "LAABRRLRLR",
        shape:[
            [0,0,0,0,0],
            [0,0,2,0,0],
            [1,1,1,1,1],
            [0,0,2,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "カワリミマジック",
        isProgram: true,
        colors: [Color.GREEN],
        compress: "BLALBRALBA",
        shape:[
            [0,0,0,0,0],
            [0,0,2,1,0],
            [0,0,1,1,0],
            [0,1,1,0,0],
            [0,1,0,0,0],
        ]
    },
    {
        name: "フロートシューズ",
        isProgram: true,
        colors: [Color.PINK],
        compress: "RALABLBBRB",
        shape:[
            [0,0,0,0,0],
            [0,0,0,1,0],
            [0,2,1,1,0],
            [0,0,1,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "エアシューズ",
        isProgram: true,
        colors: [Color.WHITE],
        compress: "ARBABRRBAL",
        shape:[
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,1,1,1,0],
            [0,1,2,1,0],
            [0,1,0,1,0],
        ]
    },
    {
        name: "アンダーシャツ",
        isProgram: true,
        colors: [Color.WHITE],
        compress: "RRALLRAABB",
        shape:[
            [0,0,0,0,0],
            [0,0,2,0,0],
            [0,0,1,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "サーチシャッフル",
        isProgram: true,
        colors: [Color.GREEN],
        compress: "RRABLRARLA",
        shape:[
            [0,0,0,1,2],
            [1,1,0,1,1],
            [1,1,1,1,1],
            [1,1,0,1,2],
            [2,1,0,0,0],
        ]
    },
    {
        name: "ナンバーオープン",
        isProgram: true,
        colors: [Color.PINK],
        compress: "AAALAABLRA",
        shape:[
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,2,1,1],
        ]
    },
    {
        name: "シノビダッシュ",
        isProgram: true,
        colors: [Color.WHITE],
        compress: "BBBABBAARB",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,1,1,1,0],
            [0,0,2,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "オイルボディ",
        isProgram: true,
        colors: [Color.RED],
        compress: "LRABARBBLR",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,1,1,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "アイムフィッシュ",
        isProgram: true,
        colors: [Color.BLUE],
        compress: "ARAABARRBA",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,1,1,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "バッテリーモード",
        isProgram: true,
        colors: [Color.YELLOW],
        compress: "BRBBBBBARR",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,1,1,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ジャングルランド",
        isProgram: true,
        colors: [Color.GREEN],
        compress: "ALARBRARLB",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,1,1,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "コレクターズアイ",
        isProgram: true,
        colors: [Color.PINK],
        compress: "ALABBAAABA",
        shape:[
            [0,0,0,0,0],
            [0,1,1,1,0],
            [0,2,1,1,0],
            [0,0,2,1,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ミリオネア",
        isProgram: true,
        colors: [Color.RED],
        compress: "RBARALBBBL",
        shape:[
            [0,0,0,0,0],
            [0,1,1,0,0],
            [0,0,1,0,0],
            [0,2,2,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ユーモアセンス",
        isProgram: true,
        colors: [Color.PINK],
        compress: "LLABLBABLL",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,1,0],
            [0,0,2,1,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "リズミカルポエム",
        isProgram: true,
        colors: [Color.YELLOW],
        compress: "BABARRLLAB",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,1,1,0,0],
            [0,1,2,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "スリップランナー",
        isProgram: true,
        colors: [Color.YELLOW],
        compress: "ALAAALLABR",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,2,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "セルフリカバリー",
        isProgram: true,
        colors: [Color.PINK],
        compress: "BBBAABAABB",
        shape:[
            [0,0,2,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [1,1,1,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "バスターパック",
        isProgram: true,
        colors: [Color.RED],
        compress: "BAABBBALBA",
        shape:[
            [0,0,0,0,0],
            [0,1,1,2,0],
            [0,1,1,1,0],
            [0,1,1,1,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ボディパック",
        isProgram: true,
        colors: [Color.PINK],
        compress: "RLABLRLAAB",
        shape:[
            [0,0,1,0,0],
            [1,1,1,1,1],
            [0,1,1,1,0],
            [0,1,1,1,0],
            [2,1,1,1,2],
        ]
    },
    {
        name: "フォルダパック1",
        isProgram: true,
        colors: [Color.YELLOW],
        compress: "ABLRRBRLBA",
        shape:[
            [0,0,0,0,0],
            [0,0,1,1,0],
            [0,1,1,1,0],
            [0,2,1,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "フォルダパック2",
        isProgram: true,
        colors: [Color.PINK],
        compress: "BBARBLARBL",
        shape:[
            [0,0,1,0,0],
            [0,1,1,1,0],
            [0,1,1,1,0],
            [1,1,1,1,0],
            [0,0,0,1,0],
        ]
    },
    {
        name: "バグストッパー",
        isProgram: true,
        colors: [Color.YELLOW],
        compress: "AAABRLBAAL",
        shape:[
            [0,0,1,2,0],
            [0,1,1,0,0],
            [0,0,1,1,0],
            [0,2,1,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ラッシュサポート",
        isProgram: true,
        colors: [Color.YELLOW],
        compress: "RLBAABALLR",
        shape:[
            [0,0,0,0,0],
            [0,2,1,0,0],
            [0,0,1,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ビートサポート",
        isProgram: true,
        colors: [Color.BLUE],
        compress: "LRBBALRABA",
        shape:[
            [0,0,0,0,0],
            [0,0,0,1,0],
            [0,0,1,1,0],
            [0,0,1,0,0],
            [0,0,2,0,0],
        ]
    },
    {
        name: "タンゴサポート",
        isProgram: true,
        colors: [Color.GREEN],
        compress: "BRBRRABBRA",
        shape:[
            [0,1,1,1,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,1,1,2,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "アタック+1",
        isProgram: false,
        colors: [Color.PINK, Color.RED, Color.BLUE],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ラピッド+1",
        isProgram: false,
        colors: [Color.WHITE, Color.PINK, Color.GREEN],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "チャージ+1",
        isProgram: false,
        colors: [Color.WHITE, Color.BLUE, Color.PINK],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "アタックMAX",
        isProgram: false,
        colors: [Color.RED],
        compress: "LBRBABLBAL",
        shape:[
            [0,1,1,0,0],
            [0,1,1,0,0],
            [0,1,1,0,0],
            [0,2,1,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "ラピッドMAX",
        isProgram: false,
        colors: [Color.GREEN],
        compress: "AALABRALBA",
        shape:[
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,2,1,1,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "チャージMAX",
        isProgram: false,
        colors: [Color.BLUE],
        compress: "LLALLBABBB",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,2,1,1,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "HP+50",
        isProgram: false,
        colors: [Color.WHITE, Color.PINK, Color.BLUE],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "HP+100",
        isProgram: false,
        colors: [Color.WHITE, Color.PINK, Color.BLUE],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,0,1,1,0],
            [0,0,1,1,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "HP+200",
        isProgram: false,
        colors: [Color.WHITE, Color.YELLOW, Color.BLUE],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,1,1,1,0],
            [0,1,1,1,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "HP+300",
        isProgram: false,
        colors: [Color.WHITE, Color.PINK, Color.GREEN],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,1,1,1,1],
            [0,1,1,1,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "HP+400",
        isProgram: false,
        colors: [Color.WHITE, Color.YELLOW, Color.GREEN],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [0,1,1,1,1],
            [0,1,1,1,1],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
    {
        name: "HP+500",
        isProgram: false,
        colors: [Color.WHITE, Color.PINK, Color.GREEN],
        compress: "",
        shape:[
            [0,0,0,0,0],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
    },
];

export const partNames = partsData.map((el) => {
    return el.name;
});
