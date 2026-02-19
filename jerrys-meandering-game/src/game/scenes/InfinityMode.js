import { Scene } from "phaser";
import { EventBus } from "../events/EventBus.js";

export class InfinityMode extends Scene {
    constructor() {
        super("InfinityMode");
    }

    preload() {
    }

    create() {
        const data = {
            "puzzle": {
                "index": 0,
                "cols": 3,
                "rows": 3,
                "districtSize": 3,
                "grid": [
                    [
                        "r",
                        "r",
                        "b"
                    ],
                    [
                        "r",
                        "r",
                        "r"
                    ],
                    [
                        "b",
                        "b",
                        "b"
                    ]
                ]
            }
        }

        this.scene.start("Grid", data);
    }
}