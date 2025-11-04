import Phaser from 'phaser';
import { Grid } from './scenes/Grid';

export default function StartGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 525,
        height: 525,
        parent,
        backgroundColor: '#ffffff',
        // transparent: true, // this makes the canvas transparent
        scene: [Grid]
    };

    return new Phaser.Game(config);
}
