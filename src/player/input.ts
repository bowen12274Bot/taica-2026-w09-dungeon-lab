import type Phaser from 'phaser';
import { movementVelocity } from './movement.ts';

export function createMovementInput(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
  const up = [keyboard.addKey('W'), keyboard.addKey('UP')];
  const down = [keyboard.addKey('S'), keyboard.addKey('DOWN')];
  const left = [keyboard.addKey('A'), keyboard.addKey('LEFT')];
  const right = [keyboard.addKey('D'), keyboard.addKey('RIGHT')];
  const pressed = (keys: Phaser.Input.Keyboard.Key[]) => keys.some(key => key.isDown);
  return {
    velocity: () => movementVelocity(pressed(up), pressed(down), pressed(left), pressed(right)),
    reset: () => [...up, ...down, ...left, ...right].forEach(key => key.reset()),
  };
}
