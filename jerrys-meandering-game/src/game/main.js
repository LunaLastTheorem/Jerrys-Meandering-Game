import Phaser from 'phaser';
import { Grid } from './scenes/Grid';

export default function StartGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 1920,
        height: 1080,
        parent,
        backgroundColor: '#ffffff',
        // transparent: true, // this makes the canvas transparent
        scene: [Grid]
    };

    return new Phaser.Game(config);
}
