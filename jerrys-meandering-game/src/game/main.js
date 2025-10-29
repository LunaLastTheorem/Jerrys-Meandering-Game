import Phaser from 'phaser';
import { Grid } from './scenes/Grid';

export default function StartGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 1024,
        height: 768,
        parent,
        backgroundColor: '#E0E0E0',
        transparent: true, // this makes the canvas transparent
        scene: [Grid]
    };

    return new Phaser.Game(config);
}
