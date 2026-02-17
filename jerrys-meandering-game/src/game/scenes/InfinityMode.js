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
        const url = `http://127.0.0.1:5000/puzzle/${0}`;

        this.scene.start("Grid", data);
    }
}