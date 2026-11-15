import test from 'node:test';
import assert from 'node:assert/strict';
import { movementVelocity, motionState } from '../src/player/movement.ts';
import { KNIGHT_FRAMES, KNIGHT_PALETTE } from '../src/rendering/knight-art.ts';
import { roomCollisionRects } from '../src/map/collision.ts';
import { ROOM_CELLS } from '../src/map/room.ts';

test('merged collision rectangles cover every blocked cell exactly once, without covering floor', () => {
  const covered = new Map();
  for (const rect of roomCollisionRects()) {
    for (let y = rect.row; y < rect.row + rect.rows; y++) {
      for (let x = rect.col; x < rect.col + rect.columns; x++) {
        const key = `${x},${y}`;
        covered.set(key, (covered.get(key) ?? 0) + 1);
      }
    }
  }
  for (const row of ROOM_CELLS) for (const cell of row) {
    assert.equal(covered.get(`${cell.col},${cell.row}`) ?? 0, cell.walkable ? 0 : 1);
  }
  assert.equal(covered.size, 68);
});

test('all eight directions have speed 64; opposite inputs cancel per axis', () => {
  for (let mask = 0; mask < 16; mask++) {
    const keys = [1, 2, 4, 8].map(bit => Boolean(mask & bit));
    const v = movementVelocity(...keys);
    const dx = Number(keys[3]) - Number(keys[2]);
    const dy = Number(keys[1]) - Number(keys[0]);
    assert.equal(Math.sign(v.x), Math.sign(dx));
    assert.equal(Math.sign(v.y), Math.sign(dy));
    assert.ok(Math.abs(Math.hypot(v.x, v.y) - (dx || dy ? 64 : 0)) < 1e-10);
  }
});

test('facing follows actual displacement, diagonal ties prefer vertical, idle preserves facing', () => {
  const origin = { x: -10.25, y: -2.5 };
  for (const [dx, dy, face] of [[1, 1, 'down'], [1, -1, 'up'], [-2, 1, 'left'], [2, -1, 'right'], [0, -1, 'up']]) {
    assert.deepEqual(motionState(origin, { x: origin.x + dx, y: origin.y + dy }, 'down'), {
      world: { x: origin.x + dx, y: origin.y + dy }, moving: true, facing: face,
    });
  }
  assert.equal(motionState(origin, origin, 'left').facing, 'left');
  assert.equal(motionState(origin, origin, 'left').moving, false);
  assert.equal(motionState(origin, { x: origin.x + 1, y: origin.y - 1 + 1e-12 }, 'down').facing, 'up');
});

test('original knight has 3 distinct full 16×16 poses in every direction', () => {
  assert.deepEqual(Object.keys(KNIGHT_FRAMES).sort(), ['down', 'left', 'right', 'up']);
  for (const frames of Object.values(KNIGHT_FRAMES)) {
    assert.equal(frames.length, 3);
    assert.equal(new Set(frames.map(frame => frame.join(''))).size, 3);
    for (const frame of frames) {
      assert.equal(frame.length, 16);
      for (const row of frame) {
        assert.equal(row.length, 16);
        for (const p of row) assert.ok(p === '.' || KNIGHT_PALETTE[p]);
      }
    }
    // Poses change limbs, while the helmet remains anchored (not whole-image bobbing).
    assert.deepEqual(frames[0].slice(0, 8), frames[1].slice(0, 8));
    assert.notDeepEqual(frames[0].slice(8), frames[1].slice(8));
  }
});
