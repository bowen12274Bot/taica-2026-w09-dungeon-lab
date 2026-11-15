import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ROOM, ROOM_LAYOUT, ROOM_CELLS, PLAYER_SPAWN,
  getCell, isWalkable, gridToWorld, worldToGrid, worldToRender, renderToWorld,
} from '../src/map/room.ts';
import { tileArt } from '../src/rendering/room-art.ts';
import { fitRoomScale } from '../src/rendering/fit-room.ts';

test('the entire 20 × 12 map matches the approved requirement verbatim', () => {
  const spec = readFileSync(new URL('../docs/requirements/round-01-map.md', import.meta.url), 'utf8');
  const map = spec.match(/```\s*\n([#.XDS]+(?:\r?\n[#.XDS]+)+)\r?\n```/);
  assert.ok(map, 'Approved ASCII map must exist');
  assert.deepEqual(ROOM_LAYOUT, map[1].split(/\r?\n/));
  assert.equal(ROOM_LAYOUT.length, 12);
  assert.ok(ROOM_LAYOUT.every(row => row.length === 20));
  assert.equal(ROOM.width, ROOM.columns * ROOM.tileSize);
  assert.equal(ROOM.height, ROOM.rows * ROOM.tileSize);
});

test('only the interior floor is walkable; doors, perimeter and both 2 × 2 blocks are closed', () => {
  let walkable = 0;
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 20; col++) {
      const block = (col >= 5 && col <= 6 && row >= 3 && row <= 4)
        || (col >= 13 && col <= 14 && row >= 6 && row <= 7);
      const perimeter = col === 0 || col === 19 || row === 0 || row === 11;
      assert.equal(isWalkable(col, row), !block && !perimeter, `${col},${row}`);
      if (isWalkable(col, row)) walkable++;
    }
  }
  assert.equal(walkable, 172);
  const count = terrain => ROOM_CELLS.flat().filter(cell => cell.terrain === terrain).length;
  assert.equal(count('wall'), 58);
  assert.equal(count('obstacle'), 8);
  assert.equal(count('door'), 2);
});

test('spawn stays (10,9) / world (8,56), and uses ordinary floor art', () => {
  assert.deepEqual(PLAYER_SPAWN.grid, { col: 10, row: 9 });
  assert.deepEqual(PLAYER_SPAWN.world, { x: 8, y: 56 });
  assert.equal(ROOM_LAYOUT[9][10], 'S');
  assert.equal(getCell(10, 9).terrain, 'floor');
  assert.deepEqual(tileArt(getCell(10, 9)), tileArt(getCell(11, 9)));
});

test('all cell centers round-trip through center-origin world coordinates', () => {
  assert.deepEqual(gridToWorld(0, 0), { x: -152, y: -88 });
  assert.deepEqual(gridToWorld(19, 11), { x: 152, y: 88 });
  for (const cell of ROOM_CELLS.flat()) {
    const world = gridToWorld(cell.col, cell.row);
    assert.deepEqual(worldToGrid(world), { col: cell.col, row: cell.row });
    assert.deepEqual(worldToRender(world), { x: cell.col * 16 + 8, y: cell.row * 16 + 8 });
  }
});

test('continuous and negative positions keep their fractions; boundaries are half-open', () => {
  const world = { x: -72.25, y: 0.125 };
  assert.deepEqual(renderToWorld(worldToRender(world)), world);
  assert.deepEqual(worldToGrid({ x: -0.01, y: -0.01 }), { col: 9, row: 5 });
  assert.deepEqual(worldToGrid({ x: 0, y: 0 }), { col: 10, row: 6 });
  assert.deepEqual(worldToGrid({ x: -160, y: -96 }), { col: 0, row: 0 });
  assert.deepEqual(worldToGrid({ x: 159.99, y: 95.99 }), { col: 19, row: 11 });
  for (const point of [{ x: 160, y: 0 }, { x: 0, y: 96 }, { x: -160.01, y: 0 },
    { x: 0, y: -96.01 }, { x: NaN, y: 0 }, { x: Infinity, y: 0 }]) {
    assert.equal(worldToGrid(point), undefined);
  }
  for (const [col, row] of [[-1, 1], [20, 1], [1, -1], [1, 12], [0.5, 1], [NaN, 1]]) {
    assert.equal(getCell(col, row), undefined);
    assert.equal(isWalkable(col, row), false);
  }
});

test('all walkable cells connect to the reserved spawn', () => {
  const seen = new Set();
  const pending = [PLAYER_SPAWN.grid];
  while (pending.length) {
    const { col, row } = pending.pop();
    const key = `${col},${row}`;
    if (seen.has(key) || !isWalkable(col, row)) continue;
    seen.add(key);
    pending.push({ col: col - 1, row }, { col: col + 1, row },
      { col, row: row - 1 }, { col, row: row + 1 });
  }
  assert.equal(seen.size, 172);
});

test('art references exist in the original 16 px packed sheet', () => {
  const png = readFileSync(new URL('../public/assets/dungeon/tilemap_packed.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), 192);
  assert.equal(png.readUInt32BE(20), 176);
  for (const cell of ROOM_CELLS.flat()) {
    const { frame } = tileArt(cell);
    assert.ok(Number.isInteger(frame) && frame >= 0 && frame < 132);
  }
  assert.equal(tileArt(getCell(9, 0)).frame, 46);
  assert.equal(tileArt(getCell(10, 0)).frame, 47);
});

test('responsive scale fits both dimensions and prioritizes integer zoom', () => {
  assert.equal(fitRoomScale(1200, 700), 3);
  assert.equal(fitRoomScale(959, 576), 2);
  assert.equal(fitRoomScale(960, 383), 1);
  assert.equal(fitRoomScale(320, 192), 1);
  assert.equal(fitRoomScale(256, 192), 0.8);
  assert.equal(fitRoomScale(320, 96), 0.5);
  assert.equal(fitRoomScale(0, 100), 0);
  for (const [width, height] of [[1100, 650], [670, 400], [332, 550], [262, 520]]) {
    const scale = fitRoomScale(width, height);
    assert.ok(320 * scale <= width && 192 * scale <= height);
  }
});
