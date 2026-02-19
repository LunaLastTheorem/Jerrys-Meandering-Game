import Phaser from 'phaser';
import { Grid } from './scenes/Grid';
import { HomePage } from './scenes/HomePage';
import { Levels } from './scenes/Levels';
import { Results } from './scenes/Results';
import { InfinityMode } from './scenes/InfinityMode';

export default function StartGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 1920,
        height: 1080,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent,
        backgroundColor: '#ffffff',
        // transparent: true, // this makes the canvas transparent
        scene: [HomePage, Levels, Grid, Results, InfinityMode]
    };

    return new Phaser.Game(config);
}
