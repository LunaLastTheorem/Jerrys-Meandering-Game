import Phaser from 'phaser';
import { Grid } from './scenes/Grid';
import { HomePage } from './scenes/HomePage';
import { Levels } from './scenes/Levels';

export default function StartGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 1920,
        height: 1080,
        parent,
        backgroundColor: '#ffffff',
        // transparent: true, // this makes the canvas transparent
        scene: [HomePage, Levels, Grid]
    };

    return new Phaser.Game(config);
}
