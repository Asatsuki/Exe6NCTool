export class Color {
    public static WHITE = new Color("white", "prg_white.svg", "pls_white.svg");
    public static RED = new Color("red", "prg_red.svg", "pls_red.svg");
    public static BLUE = new Color("blue", "prg_blue.svg", "pls_blue.svg");
    public static GREEN = new Color("green", "prg_green.svg", "pls_green.svg");
    public static YELLOW = new Color("yellow", "prg_yellow.svg", "pls_yellow.svg");
    public static PINK = new Color("pink", "prg_pink.svg", "pls_pink.svg");

    public img_prg: HTMLImageElement;
    public img_pls: HTMLImageElement;

    public constructor(
        public name: string,
        img_prg_name: string,
        img_pls_name: string,
    ) {
        this.img_prg = new Image();
        this.img_prg.src = `/img/${img_prg_name}`
        this.img_pls = new Image();
        this.img_pls.src = `/img/${img_pls_name}`
    }
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
            [0,0.1,1,0],
            [0,0.1,1,0],
            [0,0.1,1,0],
            [0,0.1,2,0],
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
