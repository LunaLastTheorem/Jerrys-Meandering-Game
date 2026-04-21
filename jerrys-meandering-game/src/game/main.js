import Phaser from 'phaser';
import { Grid } from './scenes/Grid';
import { HomePage } from './scenes/HomePage';
import { Levels } from './scenes/Levels';
import { ResultsScene } from './scenes/ResultsScene';
import { InfinityMode } from './scenes/InfinityMode';
import { MultiplayerMode } from './scenes/Multiplayer/MultiplayerMode';
import { MultiplayerGrid } from './scenes/Multiplayer/MultiplayerGrid';
import { Loading } from './scenes/Loading';

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
        scene: [HomePage, Levels, Grid, ResultsScene, InfinityMode, MultiplayerMode, MultiplayerGrid, Loading]
    };

    return new Phaser.Game(config);
}
