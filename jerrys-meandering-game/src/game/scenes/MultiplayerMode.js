import { Scene } from "phaser";
import { EventBus } from "../events/EventBus.js";

export class MultiplayerMode extends Scene {
    constructor() {
        super("MultiplayerMode");
    }

    preload() {
    }

    create() {
        const url = `http://127.0.0.1:5000/puzzle/multiplayer/10/10`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Puzzle ${levelIndex} not found`);
                }
                return response.json();
            })
            .then(puzzle => {
                this.scene.start("MultiplayerGrid", { puzzle,});
            });
    }
}