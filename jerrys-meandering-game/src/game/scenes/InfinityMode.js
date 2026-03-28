import { Scene } from "phaser";
import { EventBus } from "../events/EventBus.js";

export class InfinityMode extends Scene {
    constructor() {
        super("InfinityMode");
    }

    preload() {
    }

    create() {
        const url = `http://127.0.0.1:5000/puzzle/3/3`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Puzzle ${levelIndex} not found`);
                }
                return response.json();
            })
            .then(puzzle => {
                this.scene.start("Grid", { puzzle, isInfinityMode: true, level: 0 });
            });
    }
}