import type Phaser from 'phaser';
import type { PlayerState } from '../player/movement.ts';
import { KNIGHT_DIRECTIONS, KNIGHT_FRAMES, KNIGHT_PALETTE } from './knight-art.ts';

const TEXTURE = 'original-knight';
export function createKnightTexture(scene: Phaser.Scene): string {
  if (!scene.textures.exists(TEXTURE)) {
    const canvas = document.createElement('canvas');
    canvas.width = 16 * 3;
    canvas.height = 16 * 4;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Knight texture canvas unavailable');
    KNIGHT_DIRECTIONS.forEach((direction, d) => {
      KNIGHT_FRAMES[direction].forEach((frame, f) => frame.forEach((row, y) => {
        [...row].forEach((pixel, x) => {
          const color = KNIGHT_PALETTE[pixel];
          if (color) {
            context.fillStyle = color;
            context.fillRect(f * 16 + x, d * 16 + y, 1, 1);
          }
        });
      }));
    });
    const texture = scene.textures.addCanvas(TEXTURE, canvas);
    if (!texture) throw new Error('Knight texture creation failed');
    for (let d = 0; d < 4; d++) {
      for (let f = 0; f < 3; f++) texture.add(d * 3 + f, 0, f * 16, d * 16, 16, 16);
    }
  }
  KNIGHT_DIRECTIONS.forEach((direction, d) => {
    const key = `walk-${direction}`;
    if (!scene.anims.exists(key)) scene.anims.create({
      key, frames: [0, 1, 0, 2].map(pose => ({ key: TEXTURE, frame: d * 3 + pose })),
      frameRate: 8, repeat: -1,
    });
  });
  return TEXTURE;
}

export function showPlayerState(sprite: Phaser.Physics.Arcade.Sprite, state: PlayerState): void {
  if (state.moving) sprite.play(`walk-${state.facing}`, true);
  else {
    sprite.anims.stop();
    sprite.setFrame(KNIGHT_DIRECTIONS.indexOf(state.facing) * 3);
  }
}
