export interface NCPart {
    name: string;
    color: Color;
}

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
