import { Scene } from "phaser";

export class Results extends Scene {
    constructor() {
        super("Results");
    }

    init(data) {
        this.message = data.message;
        this.color = data.color;
    }

    create() {
        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            this.message,
            {
                fontSize: 60,
                fontFamily: "monospace",
                color: Phaser.Display.Color.IntegerToColor(this.color).rgba,
                fontStyle: "bold"
            }
        )
        .setOrigin(0.5);
    }
}