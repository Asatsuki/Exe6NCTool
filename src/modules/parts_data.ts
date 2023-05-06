export interface NCPart {
    name: string;
    color: Color;
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
