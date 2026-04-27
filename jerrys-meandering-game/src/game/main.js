import Phaser from 'phaser';
import { Grid } from './scenes/Grid';
import { HomePage } from './scenes/HomePage';
import { Levels } from './scenes/Levels';
import { SinglePlayerResults } from './scenes/SinglePlayerResults';
import { MultiplayerResults } from './scenes/MultiplayerResults';
import { InfinityMode } from './scenes/InfinityMode';
import { MultiplayerMode } from './scenes/Multiplayer/MultiplayerMode';
import { MultiplayerGrid } from './scenes/Multiplayer/MultiplayerGrid';
import { Loading } from './scenes/Loading';
import { Tutorial } from './scenes/Tutorial';

export default function StartGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 1920,
        height: 1080,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        render: {
            antialias: true,
            pixelArt: false,
            roundPixels: true
        },
        parent,
        backgroundColor: '#ffffff',
        scene: [HomePage, Levels, Grid, SinglePlayerResults, MultiplayerResults, InfinityMode, MultiplayerMode, MultiplayerGrid, Loading, Tutorial]
    };

    return new Phaser.Game(config);
}
