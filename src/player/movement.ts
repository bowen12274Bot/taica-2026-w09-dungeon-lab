import type { Point } from '../map/room.ts';

export type Facing = 'down' | 'up' | 'left' | 'right';
export type PlayerState = { world: Point; facing: Facing; moving: boolean };
export const PLAYER_SPEED = 64;
export const PLAYER_BODY = { width: 10, height: 8 } as const;

export function movementVelocity(up: boolean, down: boolean, left: boolean, right: boolean): Point {
  const x = Number(right) - Number(left);
  const y = Number(down) - Number(up);
  const length = Math.hypot(x, y);
  return length ? { x: x / length * PLAYER_SPEED, y: y / length * PLAYER_SPEED } : { x: 0, y: 0 };
}

export function motionState(previous: Point, world: Point, facing: Facing): PlayerState {
  const dx = world.x - previous.x;
  const dy = world.y - previous.y;
  // Ignore floating-point separation noise, including near-equal diagonal components.
  const moving = Math.hypot(dx, dy) > 1e-7;
  if (moving) {
    facing = Math.abs(dx) > Math.abs(dy) + 1e-7 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  return { world, facing, moving };
}
