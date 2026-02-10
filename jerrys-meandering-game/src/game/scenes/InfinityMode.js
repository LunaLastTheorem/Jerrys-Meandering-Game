import { Scene } from "phaser";
import { EventBus } from '../EventBus';

export class InfinityMode extends Scene {
    constructor() {
        super("InfinityMode");
    }

    preload() {
    }

    create() {

        const data = {
            "index": 0,
            "cols": 3,
            "rows": 3,
            "district_size": 3,
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


        const url = `http://127.0.0.1:5000/puzzle/${0}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Puzzle ${0} not found`);
                }
                return response.json();
            })
            .then(puzzle => {
                if (data) {
                    console.log(data, typeof data);
                    console.log(puzzle, typeof puzzle);

                    console.log(typeof puzzle == typeof data);

                }

                this.scene.start("Grid", { puzzle });
            });
    }
}