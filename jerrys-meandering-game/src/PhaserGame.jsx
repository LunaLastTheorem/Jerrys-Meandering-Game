import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './game/main';
import { EventBus } from './game/events/EventBus.js';

export const PhaserGame = forwardRef(function PhaserGame (props, ref) {
    
    const game = useRef();

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {
        if(!game.current) {
            game.current = StartGame('game-container');

            if (ref) {
                ref.current = { game: game.current, scene: null };
            }
        }
        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    useEffect(() => {
        const handleGridClick = ({ row, col }) => {
            console.log('React received grid click:', row, col);
        };

        EventBus.on('grid-cell-clicked', handleGridClick);

        return () => {
            EventBus.removeListener('grid-cell-clicked', handleGridClick);
        };
    }, []);

    return (
        <div id="game-container"></div>
    );

});
