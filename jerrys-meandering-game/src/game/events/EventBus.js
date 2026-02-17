import Phaser from 'phaser';

/**
 * EventBus is a Phaser object that serves as the router of messages between the Game Scene (UI) and the Game Logic
 */
export const EventBus = new Phaser.Events.EventEmitter();